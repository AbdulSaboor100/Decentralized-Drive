const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Drive = await hre.ethers.getContractFactory("Drive", deployer);
  const drive = await Drive.deploy();
  console.log(await drive.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
