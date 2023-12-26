// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract TokenEscrow {
    IERC20 public token;
    address public owner;
    uint256 public totalTxs;
    bool public paused;
    uint256 private balanceOwner;
    mapping(address => bool) public frogs;
    mapping(address => address) public busy;
    struct receiverStruct {
        address receiver;
        uint256 amount;
    }
    mapping(address => receiverStruct) private transfers;

    constructor(address _token, address[] memory _frogs) {
        owner = msg.sender;
        for (uint i = 0; i < _frogs.length; i++) {
            frogs[_frogs[i]] = true;
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

    function deposit(uint256 _amount, address _receiver) external isPaused {
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
            balanceOwner += _valueTransfer - _amount;
        } else if (totalTxs >= 1000) {
            _valueTransfer = uint256((_amount * 101) / 100);
            balanceOwner += _valueTransfer - _amount;
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
    }

    function confirm() external isPaused {
        _confirm(msg.sender);
    }

    function confirmFrog(address _sender) external isPaused onlyFrogs {
        _confirm(_sender);
    }

    function _confirm(address _sender) private {
        receiverStruct memory _receiver = transfers[_sender];
        require(_receiver.amount > 0, "No funds available");
        bool transferSuccess = token.transfer(
            _receiver.receiver,
            _receiver.amount
        );
        delete transfers[_sender];
        delete busy[_receiver.receiver];
        require(transferSuccess, "Transfer failed");
    }

    function cancel(address _sender) external isPaused onlyFrogs {
        receiverStruct memory _receiver = transfers[_sender];
        require(_receiver.amount > 0, "No funds available");
        bool transferSuccess = token.transfer(_sender, _receiver.amount);
        delete transfers[_sender];
        delete busy[_receiver.receiver];
        require(transferSuccess, "Transfer failed");
    }

    function withdraw() external onlyOwner {
        require(balanceOwner > 0, "No funds available");
        bool transferSuccess = token.transfer(owner, balanceOwner);
        require(transferSuccess, "Transfer to contract failed");
    }

    function addFrog(address[] calldata _frogs) external onlyOwner {
        for (uint i = 0; i < _frogs.length; i++) {
            frogs[_frogs[i]] = true;
        }
    }

    function removeFrogs(address[] calldata _frogs) external onlyOwner {
        for (uint i = 0; i < _frogs.length; i++) {
            delete frogs[_frogs[i]];
        }
    }
}
