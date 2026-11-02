require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PK = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = PK ? [PK] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true }
  },
  networks: {
    hardhat: {},
    // HSK Chain mainnet
    hsk: {
      url: process.env.HSK_RPC_URL || "https://mainnet.hsk.xyz",
      chainId: 177,
      accounts
    },
    // HSK Chain testnet (official: chainId 133, https://testnet.hsk.xyz)
    hsktestnet: {
      url: process.env.HSK_TESTNET_RPC || "https://testnet.hsk.xyz",
      chainId: Number(process.env.HSK_TESTNET_CHAINID) || 133,
      accounts
    }
  },
  etherscan: {
    apiKey: { hsk: process.env.HSK_EXPLORER_API_KEY || "none" },
    customChains: [
      {
        network: "hsk",
        chainId: 177,
        urls: {
          apiURL: process.env.HSK_EXPLORER_API || "https://explorer.hsk.xyz/api",
          browserURL: "https://explorer.hsk.xyz"
        }
      }
    ]
  }
};
