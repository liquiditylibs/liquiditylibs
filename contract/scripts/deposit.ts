import hre from "hardhat";
import fs from "fs";

async function main() {
    //Instancing address and contracts
    console.log("Instance address");
    const accounts = fs.readFileSync("local/accounts.json", "utf8");
    const abis = fs.readFileSync("local/abi.json", "utf8");
    const { address2, address3, addressUsdl, addressLiquidator } =
        JSON.parse(accounts);
    const { usdl: abiUsdl, liquidator: abiLiquidator } = JSON.parse(abis);
    const usdl = await hre.viem.getContractAt("USDL", addressUsdl);
    const liquidator = await hre.viem.getContractAt(
        "Liquidator",
        addressLiquidator
    );
    // Giving permissions to move balance
    const balanceAllowance = BigInt(20);
    const provider = await hre.viem.getPublicClient();
    const gasApprove = await provider.estimateContractGas({
        address: addressUsdl as `0x${string}`,
        abi: abiUsdl,
        functionName: "approve",
        account: address2,
        args: [addressLiquidator, balanceAllowance],
    });
    await usdl.write.approve([addressLiquidator, balanceAllowance], {
        account: address2,
    });
    //Validating allowance
    const allowance = await usdl.read.allowance([address2, addressLiquidator]);
    console.log({ allowance: Number(allowance) });
    //Deposit funds
    const gasDeposit = await provider.estimateContractGas({
        address: addressLiquidator as `0x${string}`,
        abi: abiLiquidator,
        functionName: "deposit",
        account: address2,
        args: [balanceAllowance, address3 as `0x${string}`],
    });
    await liquidator.write.deposit([balanceAllowance, address3], {
        account: address2,
    });
    // Confirming transaction
    const gasConfirm = await provider.estimateContractGas({
        address: addressLiquidator as `0x${string}`,
        abi: abiLiquidator,
        functionName: "confirm",
        account: address2,
        args: [],
    });
    await liquidator.write.confirm({ account: address2 });
    const totalGas =
        Number(gasApprove) + Number(gasDeposit) + Number(gasConfirm);
    const budget = fs.readFileSync("local/budget.json", "utf8");
    let _budget = JSON.parse(budget == "" ? "{}" : budget);
    _budget.mainFlow = {
        approve: Number(gasApprove),
        deposit: Number(gasDeposit),
        confirm: Number(gasConfirm),
        total: totalGas,
    };
    fs.writeFileSync("local/budget.json", JSON.stringify(_budget));
    console.log({ totalGas });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
