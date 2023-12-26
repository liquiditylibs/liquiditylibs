import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("Escrow", function () {
    async function deployContracts() {
        const [owner, account2, account3] = await hre.viem.getWalletClients();
        const {
            account: { address: addressOwner },
        } = owner;
        const {
            account: { address: address2 },
        } = account2;

        const {
            account: { address: address3 },
        } = account3;
        const usdl = await hre.viem.deployContract("USDL", [addressOwner]);
        const { address: addressERC20 } = usdl;
        const escrow = await hre.viem.deployContract("TokenEscrow", [
            addressERC20,
            [addressOwner],
        ]);
        const { address: addressEscrow } = escrow;
        return {
            addressOwner,
            address2,
            address3,
            addressERC20,
            addressEscrow,
            escrow,
            usdl,
        };
    }

    it("Deployment should assign owner, frogs and instance ERC20 token", async function () {
        const { addressOwner, addressERC20, escrow } = await loadFixture(
            deployContracts
        );
        expect((await escrow.read.token()).toLowerCase()).to.be.eq(
            addressERC20.toLowerCase()
        );
        expect((await escrow.read.owner()).toLowerCase()).to.be.eq(
            addressOwner.toLowerCase()
        );
        expect(await escrow.read.frogs([addressOwner])).to.be.eq(true);
    });
    it("permissions in ERC20 and deposit", async function () {
        const { addressEscrow, escrow, usdl, address2, address3 } =
            await loadFixture(deployContracts);
        const balanceAllowance = BigInt(20);
        //minting 20 USDL
        await usdl.write.mint([address2, balanceAllowance]);
        // 20 USDL are in address2
        expect(await usdl.read.balanceOf([address2])).to.be.eq(
            balanceAllowance
        );
        // address2 is approving smart contact to send USDL to SC
        await expect(
            usdl.write.approve([addressEscrow, balanceAllowance], {
                account: address2,
            })
        ).to.be.fulfilled;
        // SC has allowance from balance given at the beginning
        expect(await usdl.read.allowance([address2, addressEscrow])).to.be.eq(
            balanceAllowance
        );
        // address2 deposit USDL within escrow SC in a trx with address3
        await escrow.write.deposit([balanceAllowance, address3], {
            account: address2,
        });
        // address3 is with address2 in a trx
        expect((await escrow.read.busy([address3])).toLowerCase()).to.be.eq(
            address2.toLowerCase()
        );
        // balance of address2 is 0 because the USDL is in SC
        expect(await usdl.read.balanceOf([address2])).to.be.eq(BigInt(0));
    });
});
