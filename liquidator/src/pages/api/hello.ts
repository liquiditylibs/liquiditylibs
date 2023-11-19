// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import web3Contract from "../../../web3contract.json";
import Web3 from "web3";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const chainId = "11155111";
  let instanceWeb3: Web3 = new Web3("https://ethereum-sepolia.publicnode.com");
  let _customWeb3Proxy: Web3 = new Web3(
    "https://ethereum-sepolia.publicnode.com"
  );
  let _customContractProxy: any = new instanceWeb3.eth.Contract(
    web3Contract.abi,
    web3Contract.addresses[chainId]
  );
  let estimate;
  try {
    console.log(1);
    estimate = await _customContractProxy.methods
      .transfer("0x820FAec66A504901De79fa44D21609d457174f5B", 100)
      .estimateGas({
        from: "0x9B1B2994A03877F5C52b10cb2276b82A19ceb2F2",
      });
    console.log("estimate: ", estimate);
  } catch (ex: any) {
    console.log({ message: ex.message });
    throw new Error("Error estimating gas");
  }
  let receipt;
  try {
    receipt = await _customWeb3Proxy.eth.sendSignedTransaction(
      "0xcc0a1f94e54ee76a365c5871ec3d05498da44cddf657ce05ed076c2df8a29ce814dbc45acf87726ebdae4bd116d7d00f48cca223197c04da7a7e90c98e8301e21c"
    );
  } catch (ex: any) {
    console.log({ message: ex.message });
    throw new Error("Error sending");
  }
  console.log("estimate: ", estimate, receipt);
  console.log("here");
  res.status(200).json({ name: "John Doe" });
}
