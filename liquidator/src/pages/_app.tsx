import "@/styles/globals.css";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

import { WagmiConfig } from "wagmi";
import type { AppProps } from "next/app";

import { useEffect, useState } from "react";
// import {
//   sepolia,
//   polygonMumbai,
//   celoAlfajores,
//   optimismSepolia,
//   arbitrumSepolia,
// } from "wagmi/chains";

const chains = [
  {
    chainId: 11155111,
    name: "Sepolia",
    currency: "SepoliaETH",
    explorerUrl: "https://sepolia.etherscan.io/",
    rpcUrl: "https://ethereum-sepolia.publicnode.com",
  },
  //   polygonMumbai,
  //   celoAlfajores,
  //   optimismSepolia,
  //   arbitrumSepolia,
];

// 1. Get projectID at https://cloud.walletconnect.com

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

const metadata = {
  name: "Next Starter Template",
  description: "A Next.js starter template with Web3Modal v3 + Wagmi",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: chains,
  projectId,
  themeVariables: {
    '--w3m-color-mix': 'black',
    '--w3m-color-mix-strength': 40
  }
});

// createWeb3Modal({ wagmiConfig, projectId, chains });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
