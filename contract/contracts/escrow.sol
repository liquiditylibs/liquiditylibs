// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract Liquidator is ReentrancyGuard {
    IERC20 public token;
    address public owner;
    uint256 public totalTxs;
    bool public paused;
    mapping(address => bool) public frogs;
    mapping(address => uint256) public balance;
    mapping(address => bool) public liquidators;
    mapping(address => address) public busy;
    struct receiverStruct {
        address receiver;
        uint256 amount;
    }
    mapping(address => receiverStruct) public transfers;

    event Deposit(
        address indexed depositor,
        address indexed receiver,
        uint256 amount
    );
    event Withdrawal(address indexed receiver, uint256 amount);
    event TransferConfirmed(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
    event TransferCancelled(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
    event Paused(address account, bool status);
    event Frogs(address account, bool status);
    event Liquidators(address account, bool status);

    constructor(
        address _token,
        address[] memory _frogs,
        address[] memory _liquidators
    ) {
        owner = msg.sender;
        for (uint i = 0; i < _frogs.length; i++) {
            frogs[_frogs[i]] = true;
        }
        for (uint i = 0; i < _liquidators.length; i++) {
            liquidators[_liquidators[i]] = true;
        }
        token = IERC20(_token);
    }

    modifier onlyFrogs() {
        require(frogs[msg.sender], "Only the frogs can call this function");
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only the owner can call this function");
        _;
    }

    modifier isPaused() {
        require(paused == false, "This contract is paused by owner");
        _;
    }

    function deposit(
        uint256 _amount,
        address _receiver
    ) external nonReentrant isPaused {
        require(liquidators[_receiver], "Only the liquidators can participate");
        uint256 _valueTransfer = _amount;
        require(
            transfers[msg.sender].receiver == address(0),
            "User in a process"
        );
        require(
            busy[_receiver] == address(0),
            "User is busy in other transaction"
        );
        if (totalTxs > 100 && totalTxs < 1000) {
            _valueTransfer = uint256((_amount * 1005) / 1000);
            balance[owner] += _valueTransfer - _amount;
        } else if (totalTxs >= 1000) {
            _valueTransfer = uint256((_amount * 101) / 100);
            balance[owner] += _valueTransfer - _amount;
        }
        bool transferSuccess = token.transferFrom(
            msg.sender,
            address(this),
            _valueTransfer
        );
        require(transferSuccess, "Transfer to contract failed");
        transfers[msg.sender] = receiverStruct({
            receiver: _receiver,
            amount: _amount
        });
        busy[_receiver] = msg.sender;
        totalTxs += 1;
        emit Deposit(msg.sender, _receiver, _amount);
    }

    function confirm() external isPaused {
        _confirm(msg.sender);
    }

    function confirmFrog(address _sender) external isPaused onlyFrogs {
        uint256 _amount = _confirm(_sender);
        distributeTax(_amount);
    }

    function distributeTax(uint256 _amount) private {
        uint256 _tax;
        if (totalTxs > 100 && totalTxs < 1000) {
            _tax = uint256((_amount * 25) / 10000);
        } else if (totalTxs >= 1000) {
            _tax = uint256((_amount * 5) / 1000);
        }
        if (_tax > 0) {
            balance[owner] -= _tax;
            balance[msg.sender] += _tax;
        }
    }

    function _confirm(address _sender) private nonReentrant returns (uint256) {
        receiverStruct memory _receiver = transfers[_sender];
        uint256 _amount = _receiver.amount;
        require(_amount > 0, "No funds available");
        bool transferSuccess = token.transfer(_receiver.receiver, _amount);
        delete transfers[_sender];
        delete busy[_receiver.receiver];
        require(transferSuccess, "Transfer failed");
        emit TransferConfirmed(_sender, _receiver.receiver, _amount);
        return _amount;
    }

    function cancel(address _sender) external isPaused onlyFrogs nonReentrant {
        receiverStruct memory _receiver = transfers[_sender];
        uint256 _amount = _receiver.amount;
        require(_receiver.amount > 0, "No funds available");
        bool transferSuccess = token.transfer(_sender, _receiver.amount);
        delete transfers[_sender];
        delete busy[_receiver.receiver];
        emit TransferCancelled(_sender, _receiver.receiver, _amount);
        require(transferSuccess, "Transfer failed");
        distributeTax(_amount);
    }

    function withdraw(uint256 _balance) external nonReentrant {
        require(balance[msg.sender] >= _balance, "No funds available");
        balance[msg.sender] -= _balance;
        bool transferSuccess = token.transfer(msg.sender, _balance);
        require(transferSuccess, "Transfer to contract failed");
        emit Withdrawal(msg.sender, _balance);
    }

    function addFrog(address[] calldata _frogs) external onlyOwner {
        for (uint i = 0; i < _frogs.length; i++) {
            emit Frogs(_frogs[i], true);
            frogs[_frogs[i]] = true;
        }
    }

    function removeFrogs(address[] calldata _frogs) external onlyOwner {
        for (uint i = 0; i < _frogs.length; i++) {
            emit Frogs(_frogs[i], false);
            delete frogs[_frogs[i]];
        }
    }

    function addLiquidator(address[] calldata _liquidators) external onlyOwner {
        for (uint i = 0; i < _liquidators.length; i++) {
            emit Liquidators(_liquidators[i], true);
            liquidators[_liquidators[i]] = true;
        }
    }

    function removeLiquidator(
        address[] calldata _liquidators
    ) external onlyOwner {
        for (uint i = 0; i < _liquidators.length; i++) {
            emit Liquidators(_liquidators[i], false);
            delete liquidators[_liquidators[i]];
        }
    }

    function pauseContract() external onlyOwner {
        emit Paused(msg.sender, !paused);
        paused = !paused;
    }
}
