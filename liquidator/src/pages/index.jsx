import dynamic from "next/dynamic";

import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

import { useEffect } from "react";
import web3Contract from "../../web3contract.json";
import { ethers } from "ethers";
import {
  useWeb3ModalAccount,
  useWeb3ModalSigner,
} from "@web3modal/ethers5/react";
import Stream from "stream";

import { PushAPI, CONSTANTS, SignerType, Env } from "@pushprotocol/restapi";

// type TCoin = "USDc" | "USDt" | "DAI";

// type IList = {
//   value: string;
// };

const coinChosenBase = {
  ethereum: {
    usdt: false,
    usdc: false,
    dai: false,
  },
  polygon: {
    usdt: false,
    usdc: false,
    dai: false,
  },
  arbitrum: {
    usdt: false,
    usdc: false,
    dai: false,
  },
  optimism: {
    usdt: false,
    usdc: false,
    dai: false,
  },
  gnosis: {
    usdt: false,
    usdc: false,
    dai: false,
  },
};

const whiteList = ["0x820FAec66A504901De79fa44D21609d457174f5B"];

const Home = (props) => {
  const [addressContract, setAddressContract] = useState("");
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { signer } = useWeb3ModalSigner();
  const [coinsChosen, setCoinsChosen] = useState({ ...coinChosenBase });
  const [chainChosen, setChainChosen] = useState("ethereum");
  const [inputData, setInputData] = useState({ acceptable: 0, rate: 0 });
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasGlasses, setHasGlasses] = useState(false);

  useEffect(() => {
    console.log({ isConnected });
    if (isConnected && address && signer && !whiteList.includes(address)) {
      const callPush = async () => {
        await signTransactionFunction()
        const myOwnInstance = await PushAPI.initialize(signer, {
          env: "staging",
        });
        const message = await myOwnInstance.chat.send(
          "0x820FAec66A504901De79fa44D21609d457174f5B",
          { content: "hi man whats up" }
        );
        console.log({ message });
        await startStreaming("0x820FAec66A504901De79fa44D21609d457174f5B");
      };

      callPush();
    }
  }, [isConnected]);

  useEffect(() => {
    if (hasGlasses)
      setTimeout(() => {
        setHasGlasses(false);
      }, 3000);
  }, [hasGlasses]);

  const startStreaming = async (addressToChat) => {
    const myOwnInstance = await PushAPI.initialize(signer, {
      env: "staging",
    });
    const stream = new Stream();
    stream.on(CONSTANTS.STREAM.CONNECT, (a) => {
      console.log("Stream connected");

      console.log("Sending message to push Bot");

      myOwnInstance.chat.send(addressToChat, {
        content: "hi man whats up",
      });
    });
    // await stream.connect()
    stream.on(CONSTANTS.STREAM.DISCONNECT, () => {
      console.log("stream disconnected");
    });

    stream.on(CONSTANTS.STREAM.CHAT, (message) => {
      console.log("Encrypted Message Received");
      console.log(message);
      // stream.disconnect()
    });
  };

  const signTransactionFunction = async () => {
    const contractInstance = new ethers.Contract(
      addressContract,
      web3Contract.abi,
      signer
    );
    const unsignedTrx = await contractInstance.populateTransaction.transfer(
      "0x820FAec66A504901De79fa44D21609d457174f5B",
      10
    );
    const signature = await signer?.sendTransaction(unsignedTrx);
    console.log({signature})
  };

  const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
    useState(false);
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  useEffect(() => {
    if (chainId) setAddressContract(web3Contract.addresses[String(chainId)]);
  }, [chainId]);

  const changeCoins = (name) => {
    let newCoins = { ...coinsChosen };
    newCoins[chainChosen][name] = !newCoins[chainChosen][name];
    setCoinsChosen(newCoins);
  };
  const cryptoValue = (cryptos) => {
    return (
      <div className={styles.bodyCryptos}>
        {cryptos.map((crypto, index) => {
          return (
            <div
              key={index}
              className={styles.bodyCryptos_crypto}
              onClick={() => changeCoins(crypto.value.toLowerCase())}
            >
              <img
                src={`${crypto.value.toLowerCase()}.png`}
                alt={`flag_${index}`}
                className={styles.flagsList_img}
              />
              <b className={styles.flagsList_text}>{crypto.value}</b>
              <label>
                <input
                  name={crypto.value.toLowerCase()}
                  type="checkbox"
                  checked={coinsChosen[chainChosen][crypto.value.toLowerCase()]}
                />
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  const selectChain = (chain) => {
    setChainChosen(chain);
  };

  const chainsList = (chains) => {
    return chains.map((el, index) => {
      return (
        <button
          onClick={() => selectChain(el.value.toLowerCase())}
          className={`${styles.chainList} ${
            chainChosen == el.value.toLowerCase() && styles.chainListSelected
          }`}
          key={`${index}${el.value}`}
        >
          <img
            src={`/${el.value}.png`}
            alt={`chain_${index}`}
            className={styles.chainList_img}
          />
          {el.value}
        </button>
      );
    });
  };

  const dropdownFlag = (flags) => {
    return (
      <select className={styles.flagsList}>
        {flags.map((el, index) => (
          <option key={index} value={el.value}>
            <img
              src="turkish-flag.png"
              alt={`flag_${index}`}
              className={styles.flagsList_img}
            />
            {el.value}
          </option>
        ))}
      </select>
    );
  };

  const resetAll = () => {
    setCoinsChosen(JSON.parse(JSON.stringify(coinChosenBase)));
  };

  const handleChange = (e) => {
    console.log({ inputData });
    setInputData({
      ...inputData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("hello");
    console.log({ coinsChosen, inputData });
    setIsAvailable(true);
    startStreaming("0x9B1B2994A03877F5C52b10cb2276b82A19ceb2F2");
  };

  const disconnectAvailable = () => {
    setCoinsChosen(JSON.parse(JSON.stringify(coinChosenBase)));
    setInputData({ acceptable: 0, rate: 0 });
    setChainChosen("ethereum");
    setIsAvailable(false);
  };
  const summaryChains = () => {
    return (
      Number(coinsChosen.ethereum.dai) +
      Number(coinsChosen.ethereum.usdc) +
      Number(coinsChosen.ethereum.usdt) +
      Number(coinsChosen.polygon.dai) +
      Number(coinsChosen.polygon.usdc) +
      Number(coinsChosen.polygon.usdt) +
      Number(coinsChosen.arbitrum.dai) +
      Number(coinsChosen.arbitrum.usdc) +
      Number(coinsChosen.arbitrum.usdt) +
      Number(coinsChosen.optimism.dai) +
      Number(coinsChosen.optimism.usdc) +
      Number(coinsChosen.optimism.usdt) +
      Number(coinsChosen.gnosis.dai) +
      Number(coinsChosen.gnosis.usdc) +
      Number(coinsChosen.gnosis.usdt)
    );
  };
  return (
    <>
      <Head>
        <title>WalletConnect | Next Starter Template</title>
        <meta name="description" content="Generated by create-wc-dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div
          className={styles.backdrop}
          style={{
            opacity: isConnectHighlighted || isNetworkSwitchHighlighted ? 1 : 0,
          }}
        />
        <div className={styles.header}>
          <h2>
            Liquidator 🔥
            <div className={hasGlasses ? styles.glasses_cool : styles.glasses}>
              <img src={`glasses.png`} alt={`glasses`} />
            </div>
            <div className={styles.apecoin}>
              <img
                style={{ cursor: "pointer" }}
                onClick={() => setHasGlasses(true)}
                src={`apecoin.png`}
                alt={`apecoin`}
              />
            </div>
          </h2>

          <div className={styles.buttons}>
            <div
              onClick={closeAll}
              className={`${styles.highlight} ${
                isConnectHighlighted ? styles.highlightSelected : ``
              }`}
            >
              <w3m-button balance={false} />
            </div>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        {isConnected ? (
          whiteList.includes(address) ? (
            isAvailable ? (
              <div className={styles.available}>
                <div className={styles.available_ball}></div>
                <div>Im available bitches</div>
                <button
                  onClick={() => disconnectAvailable()}
                  className={styles.available_button}
                >
                  Disconnect me
                </button>
              </div>
            ) : (
              <div className={styles.keyBoardSpace_father}>
                <div className={styles.keyBoardSpace}>
                  <div className={styles.keyBoardSpace_title}>
                    Operational Country
                  </div>
                  <div className={styles.keyBoardSpace_flags}>
                    {dropdownFlag([
                      { value: "Turkey" },
                      { value: "Colombia" },
                      { value: "Brazil" },
                      { value: "USA" },
                    ])}
                  </div>
                  <div className={styles.keyBoardSpace_chains}>
                    {chainsList([
                      { value: "Ethereum" },
                      { value: "Polygon" },
                      { value: "Arbitrum" },
                      { value: "Optimism" },
                      { value: "Gnosis" },
                    ])}
                  </div>

                  <div className={styles.keyBoardSpace_selectedBar}>
                    <div>{summaryChains()} coins selected</div>
                    <button
                      className={styles.keyBoardSpace_selectedBar__unselect}
                      onClick={() => resetAll()}
                    >
                      Deselected all
                    </button>
                  </div>
                  {cryptoValue([
                    { value: "USDt" },
                    { value: "USDc" },
                    { value: "DAI" },
                  ])}
                  <form
                    className={styles.keyBoardSpace_form}
                    onSubmit={onSubmit}
                  >
                    <div className={styles.keyBoardSpace_form_input}>
                      <label
                        className={styles.keyBoardSpace_titleSecondary}
                        htmlFor="acceptable"
                      >
                        Acceptable amount
                      </label>
                      <div className={styles.keyBoardSpace_form_input_inside}>
                        <input
                          className={styles.keyBoardSpace_form_input_type}
                          type="number"
                          id="acceptableAmount"
                          name="acceptable"
                          onChange={handleChange}
                        />
                        <span>TRY</span>
                      </div>
                    </div>

                    <div className={styles.keyBoardSpace_form_input}>
                      <label
                        className={styles.keyBoardSpace_titleSecondary}
                        htmlFor="rate"
                      >
                        Your Rate
                      </label>
                      <div className={styles.keyBoardSpace_form_input_inside}>
                        <input
                          className={styles.keyBoardSpace_form_input_type_rate}
                          type="number"
                          id="rate"
                          name="rate"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className={styles.keyBoardSpace_titleThird}>
                      <label
                        className={styles.keyBoardSpace_titleSecondary}
                        htmlFor="acceptable"
                      >
                        Market Rate
                      </label>
                      <span>28.7 ₺</span>
                    </div>

                    <div className={styles.keyBoardSpace_titleThird}>
                      <label
                        className={styles.keyBoardSpace_titleSecondary}
                        htmlFor="estimated"
                      >
                        Estimated Profit
                      </label>
                      <span>
                        {inputData.rate &&
                          inputData.acceptable &&
                          (
                            (inputData.acceptable * (inputData.rate - 28.7)) /
                            inputData.rate
                          ).toFixed(2)}{" "}
                        ₺
                      </span>
                    </div>
                    <div className={styles.keyBoardSpace_titleThird}>
                      <label
                        className={styles.keyBoardSpace_titleSecondary}
                        htmlFor="estimated"
                      >
                        Total
                      </label>
                      <span>
                        {inputData.rate &&
                          inputData.acceptable &&
                          Number(inputData.acceptable) +
                            Number(
                              (
                                (inputData.acceptable *
                                  (inputData.rate - 28.7)) /
                                inputData.rate
                              ).toFixed(2)
                            )}{" "}
                        ₺
                      </span>
                    </div>
                    <div className={styles.keyBoardSpace_button}>
                      <button type="submit">Activate</button>
                    </div>
                  </form>
                </div>
              </div>
            )
          ) : (
            <div className={styles.otherMain}>Waiting for chat</div>
          )
        ) : (
          <div className={styles.otherMain}>
            <img
              src="prometeo.png"
              alt="background"
              className={styles.background}
            />
            Connect your own wallet to enjoy our service!
          </div>
        )}
      </main>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
