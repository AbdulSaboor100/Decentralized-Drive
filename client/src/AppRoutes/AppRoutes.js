import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../Pages/Home/Home";
import { ethers } from "ethers";
import Drive from "../artifacts/contracts/Drive.sol/Drive.json";

const AppRoutes = () => {
  const [state, setState] = useState({
    provider: null,
    contract: null,
    signer: null,
  });

  const loadProvider = async () => {
    try {
      const contractAddress = "0xd161A28E899df1f0b4813C76c84A92156236c628";
      const provider = new ethers.BrowserProvider(window.ethereum);
      let signer = state?.signer;
      let contract = state.contract;
      const listAccounts = await provider.listAccounts();
      if (listAccounts?.length > 0) {
        signer = await provider.getSigner();
      }
      if (signer) {
        contract = new ethers.Contract(contractAddress, Drive.abi, signer);
      }
      setState({ ...state, provider, contract, signer });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.ethereum && loadProvider();
  }, []);

  useEffect(() => {
    window?.ethereum?.on("accountsChanged", loadProvider);
    return () => {
      window.ethereum.removeListener("accountsChanged", loadProvider);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home state={state} setState={setState} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
