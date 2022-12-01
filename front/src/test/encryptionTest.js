import React, { useState } from 'react';
import Encryption from '../crypto/encryption.js';
import math from '../utils/math.js';
import Config from '../utils/config.js';
import types from '../utils/types.js';
import SnarkInput from '../libsnark/struct/snarkInput.js';
import './WalletCard.css'

function EncData() {
    // let dataBuf;
    const [encSystem, setEncSystem] = useState(null);
    const [fileData, setFileData] = useState([]);
    const [privKey, setPrivKey]   = useState(null);
    const [encData, setEncData]   = useState([]);
    const [decData, setDecData]   = useState([]);

    const onClcikRandomFileData = () => {
        const tmp = [];
        for(let i=0; i<Config.dataMaxBlockNum; i++){
            tmp.push(math.randomFieldElement().toString(16));
        }
        
        setFileData(tmp);
    };

    const onChangeprivKey = (e) => {
        console.log(e.target.value);
        setPrivKey(e.target.value)
    };

    const getPeerData = async () => {
        console.log("priv Key  : ", privKey);
        console.log("file Data : ", fileData);
        const peerData = new Encryption.symmetricKeyEncryption(privKey.toString());
        setEncSystem(peerData);
        const sct = peerData.EncData(fileData);
        console.log("sct : ", sct.toJson());
        setEncData(sct.toJson());
        console.log("encData : ", sct.toJson());
    };

    const getDecData = () => {
        console.log(encData);
        const tmp = encSystem.DecData(Encryption.sCTdata.fromJson(encData));
        console.log(tmp);
        setDecData(tmp);
    }

    const exportData = () => {
        const dataRagistSnarkInput = new SnarkInput.RegistData();
        dataRagistSnarkInput.uploadData(fileData);
        dataRagistSnarkInput.uploadPkOwnFromPrivKey(privKey);
        dataRagistSnarkInput.encryptData();
        dataRagistSnarkInput.makeSnarkInput();
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
          dataRagistSnarkInput.toSnarkInputFormat()
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "data.json";
    
        link.click();
    };


    return(
        <div className='mimcCard'>
            <h3> -- encryption test --</h3>
            <div>
                <button onClick={onClcikRandomFileData}> get random BigInt fileData </button>
                <h4>file Data : {fileData.toString()}</h4>
            </div>
            <div >
                input your privKey :
                <input onChange={onChangeprivKey} placeholder="input your privKey"/>
            </div>
            <div className='mimcCard'>
                <button onClick={ getPeerData}> get Peer Data </button>
                <h4>enc Data : {encData.toString()} </h4>
            </div>
            
            <div>
                <button onClick={getDecData}> Decrypt Data</button>
                <h4>dec data : {decData}</h4>
            </div>
            <button type="button" onClick={exportData}>
                Export RegistData SnarkInput JSON
            </button>
        </div>
    );
}

const EncDataTest = {
    EncData,
};

export default EncDataTest;




