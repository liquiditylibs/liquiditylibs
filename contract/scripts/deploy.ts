import { formatEther, parseEther } from "viem";
import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("Creating accounts");
    const [owner, account2, account3] = await hre.viem.getWalletClients();
    console.log({ owner });
    const addressOwner = createAccount(owner);
    // const walletClient = await hre.viem.getWalletClient(addressOwner);
    const address2 = createAccount(account2);
    const address3 = createAccount(account3);
    // Deploy USDL
    console.log("Deploying USDL");
    const usdl = await hre.viem.deployContract("USDL", [addressOwner]);
    console.log(`USDL deployed to ${usdl.address}`);
    // Deploy Escrow
    console.log("Deploying Liquidator");
    const liquidator = await hre.viem.deployContract("Liquidator", [
        usdl.address,
        [addressOwner, address2, address3],
        [address2, address3],
    ]);
    console.log(`Liquidator deployed to ${liquidator.address}`);
    // Minting tokens
    console.log("Minting tokens for addresses");
    await mintTokens([addressOwner, address2, address3], 2000, usdl);
    console.log("Validating balances for addresses");
    await validatingTokens([addressOwner, address2, address3], usdl);
    fs.writeFileSync(
        "local/accounts.json",
        JSON.stringify({
            addressOwner,
            address2,
            address3,
            addressUsdl: usdl.address,
            addressLiquidator: liquidator.address,
        })
    );
    fs.writeFileSync(
        "local/abi.json",
        JSON.stringify({
            usdl: usdl.abi,
            liquidator: liquidator.abi,
        })
    );
}

const createAccount = (account: { account: { address: `0x${string}` } }) => {
    const {
        account: { address },
    } = account;
    return address;
};

const mintTokens = async (
    address: `0x${string}`[],
    amount: number,
    usdlInstance: any
) => {
    for (let i = 0; i < address.length; i++) {
        await usdlInstance.write.mint([address[i], amount]);
    }
};

const validatingTokens = async (
    address: `0x${string}`[],
    usdlInstance: any
) => {
    for (let i = 0; i < address.length; i++) {
        const balance = await usdlInstance.read.balanceOf([address[i]]);
        console.log({ address: address[i], amount: Number(balance) });
    }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
