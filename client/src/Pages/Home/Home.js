import React, { useEffect, useState } from "react";
import styles from "./Home.module.scss";
import { InboxOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Upload } from "antd";
import validator from "validator";
const { Dragger } = Upload;

const Home = ({ state, setState }) => {
  const [files, setFiles] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAddress, setShareAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [externalFileAddress, setExternalFileAddress] = useState("");
  const [externalFiles, setExternalFiles] = useState([]);
  const JWT = process.env.REACT_APP_PINATA_JWT;

  useEffect(() => {
    setFiles([]);
    setIsShareModalOpen(false);
    setShareAddress("");
    setErrors({});
    setExternalFileAddress("");
    setExternalFiles([]);
    getFiles();
  }, [state?.signer?.address]);

  useEffect(() => {
    getFiles();
  }, [state?.signer]);

  const props = {
    name: "file",
    multiple: true,
    onChange(info) {
      const { status, response } = info.file;
      if (status === "done") {
        setFile(response?.IpfsHash);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    action: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  };

  const connectMetamask = async () => {
    if (!window.ethereum) return message.error(`First Install Metamask`);
    try {
      const signer = await state?.provider.getSigner();
      setState({ ...state, signer });
    } catch (error) {
      console.log(error);
    }
  };

  const setFile = async (hash) => {
    try {
      const transaction = await state?.contract?.setFile(hash);
      await transaction.wait();
      message.success(`File uploaded successfully`);
      getFiles();
    } catch (error) {
      console.log(error);
      message.error(
        error?.message?.split(": ")[1]?.split('"')[1] || error?.message
      );
    }
  };

  const getFiles = async () => {
    try {
      const newFiles = await state?.contract?.getFile();
      setFiles(newFiles);
    } catch (error) {
      setFiles([]);
      console.log(error?.message);
      setErrors({
        files: error?.message?.split(": ")[1]?.split('"')[1] || error?.message,
      });
    }
  };

  useEffect(() => {
    if (state?.signer) {
      getFiles();
    }
  }, [state?.signer?.address]);

  const shareAccess = async () => {
    if (!validator.isEthereumAddress(shareAddress)) {
      return setErrors({
        shareAddress: "Address is Required or invalid",
      });
    }
    setErrors({});
    try {
      const transaction = await state?.contract?.giveAccess(shareAddress);
      message.success(`Waiting for transaction to be confirmed`);
      await transaction?.wait();
      message.success(`Access Shared`);
      setErrors({});
      setShareAddress("");
      setIsShareModalOpen(false);
      getFiles();
    } catch (error) {
      message.error(
        error?.message?.split(": ")[1]?.split('"')[1] || error?.message
      );
      console.log(error);
    }
  };

  const getExternalFiles = async () => {
    if (!validator.isEthereumAddress(externalFileAddress)) {
      return setErrors({
        externalFileAddress: "Address is Required or invalid",
      });
    }
    setErrors({});
    try {
      const response = await state?.contract?.getExternalFile(
        externalFileAddress
      );
      message.success(`External files fetched`);
      setExternalFiles(response);
    } catch (error) {
      setErrors({
        externalFiles:
          error?.message?.split(": ")[1]?.split('"')[1] || error?.message,
      });
      message.error(
        error?.message?.split(": ")[1]?.split('"')[1] || error?.message
      );
      console.log(error);
    }
  };

  return (
    <div className={styles.home_container}>
      <div className={styles.title_container}>
        <h1>Decentralized Drive</h1>
        {!state?.signer ? (
          <h4>First you need to connect your wallet</h4>
        ) : (
          <>
            <h4>Account: {state?.signer?.address}</h4>
            <h4>You can share your files with anyone</h4>
          </>
        )}
      </div>
      {!state?.signer ? (
        <div className={styles.connect_wallet_btn}>
          <Button type="primary" size="large" onClick={connectMetamask}>
            Connect Metamask
          </Button>
        </div>
      ) : (
        <div className={styles.connect_wallet_btn}>
          <Button
            type="primary"
            size="large"
            onClick={() => setIsShareModalOpen(true)}
          >
            Share Access
          </Button>
        </div>
      )}
      {state?.signer && (
        <>
          <div className={styles.upload_file_container}>
            <h3>Upload: </h3>
            <Dragger
              {...props}
              disabled={state?.signer?.address ? false : true}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          </div>
          <div className={styles.my_files_container}>
            <h3>Get External Files: </h3>
            <div className={styles.input_btn_container}>
              <Input
                placeholder="Enter address"
                type="text"
                value={externalFileAddress}
                onChange={(e) => setExternalFileAddress(e?.target?.value)}
                status={errors?.externalFileAddress && "error"}
              />
              <Button type="primary" onClick={getExternalFiles}>
                Go External
              </Button>
            </div>
            <div className={styles.file_container}>
              {externalFiles?.length > 0 ? (
                externalFiles?.map((item, i) => (
                  <img
                    key={i}
                    src={`https://olive-given-dog-873.mypinata.cloud/ipfs/${item}`}
                  />
                ))
              ) : (
                <p className={styles.error_message}>{errors?.externalFiles}</p>
              )}
            </div>
          </div>
          <div className={styles.my_files_container}>
            <h3>My Files: </h3>
            <div className={styles.file_container}>
              {files?.fileHashes?.length > 0 ? (
                files?.fileHashes?.map((item, i) => (
                  <img
                    key={i}
                    src={`https://olive-given-dog-873.mypinata.cloud/ipfs/${item}`}
                  />
                ))
              ) : (
                <p className={styles.error_message}>{errors?.files}</p>
              )}
            </div>
          </div>
          <Modal
            title="Sharing Access with"
            open={isShareModalOpen}
            onOk={shareAccess}
            onCancel={() => {
              setErrors({});
              setShareAddress("");
              setIsShareModalOpen(false);
            }}
            centered
            okText={"Add"}
            cancelButtonProps={{ style: { display: "none" } }}
          >
            <div className={styles.share_access_container}>
              <div className={styles.list}>
                {files?.allAccess?.length > 0 ? (
                  files?.allAccess?.map((item, i) => <p key={i}>{item}</p>)
                ) : (
                  <p className={styles.list_error_message}>
                    There is no one in shared list
                  </p>
                )}
              </div>
              <div className={styles.add_user}>
                <p>Add to share list: </p>
                <Input
                  type="text"
                  value={shareAddress}
                  placeholder="Enter Address"
                  onChange={(e) => setShareAddress(e?.target?.value)}
                  size="large"
                  status={errors?.shareAddress && "error"}
                />
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Home;
