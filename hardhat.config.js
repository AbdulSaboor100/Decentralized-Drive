require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

require("dotenv").config();
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.SEPOLIA_NETWORK_URL}`,
      accounts: [process.env.MNEMONICS],
    },
  },
  paths: {
    artifacts: "client/src/artifacts",
  },
};
