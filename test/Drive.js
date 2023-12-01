const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Drive Contract", () => {
  let drive, deployer, address2, address3;
  beforeEach(async () => {
    const [signer, signer2, signer3] = await ethers.getSigners();
    const Drive = await ethers.getContractFactory("Drive", signer);
    deployer = signer;
    address2 = signer2;
    address3 = signer3;
    drive = await Drive.deploy();
  });

  describe("Deployment", () => {
    it("Should set the initial values to empty", async () => {
      expect(await drive.number_of_files()).to.equal(0);
    });
  });

  describe("Transactions", () => {
    it("Should set the file and create user", async () => {
      await drive.setFile("snjfi43824");
      await drive.setFile("snjfi43825");
      const file = await drive.getFile();
      expect(file.fileHashes[0]).to.equal("snjfi43824");
      expect(file.user).to.equal(deployer.address);
    });

    it("Should return the error in file set if input is empty", async () => {
      await expect(drive.setFile("")).to.revertedWith("File hash is required");
    });

    it("Should give access to someone else", async () => {
      await drive.connect(address2).setFile("snjfi43824");
      await drive.connect(address2).giveAccess(address3.address);
      const externalFile = await drive
        .connect(address3)
        .getExternalFile(address2.address);

      expect(externalFile[externalFile?.length - 1]).to.equal("snjfi43824");
    });

    it("Should not give the files before giving access to", async () => {
      await drive.connect(address2).setFile("snjfi43824");
      await expect(
        drive.connect(address3).getExternalFile(address2.address)
      ).to.rejectedWith("Access Denied");
    });
  });
});
