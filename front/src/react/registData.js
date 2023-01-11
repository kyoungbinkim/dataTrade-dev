import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import Config from '../utils/config.js';
import contractInstance,{ getAccounts, getBalance, setContractInstance, getSinger } from '../contract/interface.js';
import '../test/WalletCard.css'
import { BigNumber } from 'ethers';


const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 30000;

const RegistDataComponent = () => {
    const col = ['1','2','4'];
    const [fData, setFData] = useState(null);

    const [accountAddr, setAccountAddr] = useState(null);
    const [hCt, sethCt] = useState(null);

    const [balance, setBalance] = useState(null);
    const [accounts, setAccounts] = useState([]);

    const [isRegisteredFlag, setIsRegisteredFlag] = useState(false);
    const [registDataRecipt, setRegistDataRecipt] = useState(null);
    const [senderAddr, setSenderAddr] = useState(null);

    const setContractInstanceHandler = () => {
        console.log(sessionStorage.getItem('contractAbi'));
        setContractInstance(
            sessionStorage.getItem('contractAddr'), 
            JSON.parse(sessionStorage.getItem('contractAbi'))
        );
        console.log(contractInstance());
        console.log();

    }

    const getAccountsHandler = async () => {
        const tmp = await getAccounts();
        console.log(tmp);
        setAccounts(tmp);
    }

    const getBalanceHandler = async () => {
        try {
            setBalance((await getBalance(accountAddr))['_hex']);
            console.log((await getBalance(accountAddr)));
        } catch (error) {
            console.log(error);
        }
    }

    const addrChangeHandler = (e) => {
        setAccountAddr(e.target.value);
    }

    const hCtChangeHandler = (e) => {
        sethCt(e.target.value);
    }

    const senderAddrChangerHandler = (e) => {
        setSenderAddr(e.target.value)
    }

    const callIsRegistered = async (e) => {
        if(!hCt) { alert('write h_ct'); return;}
        //{ BigNumber: "6026189439794538201631" }
        try {
            const result = await contractInstance().isRegistered(BigNumber.from( hCt));
            console.log(result);
            setIsRegisteredFlag(result);
        } catch (error) {
            alert(error);
        }
        
    }

    const sendRegistData = async (e) => {
        if(!sessionStorage.getItem('fileData')){return;}

        try {
            console.log( JSON.parse(sessionStorage.getItem('fileData')))
            const dataJson = JSON.parse(sessionStorage.getItem('fileData'));

            const proof = dataJson.proof;
            const inputs = dataJson.verifyInput;
            console.log(proof, inputs)

            const signer = getSinger(senderAddr);
            console.log(signer)
            const constractWithSinger = (contractInstance()).connect(signer);
            const receipt = await constractWithSinger.registData(
                proof, inputs
            )
            console.log(receipt);
        
            setRegistDataRecipt(JSON.stringify(receipt, null, 2));
        } catch (error) {
            alert(error);
            return;
        }
        sendRegistDataServer();
    }

    /**
     * post 필요한 데이터  title, decs  id, ct_data, dataEncKey, h_id, h_ct
     */
    const sendRegistDataServer = () => {
        let uploadData = JSON.parse(sessionStorage.getItem('fileData'));
        delete uploadData['verifyInput']
        delete uploadData['contractAddr'];
        delete uploadData['proof'];
        
        httpCli.post("/data/data/upload", uploadData).then(
            res => {
                console.log(res);
            }
        )
    }

    const PrintArr = (arr) => {
        return(
            <div>
                {
                    accounts.map((val, ind) => (
                        <div key={ind}>{ind} {':'} {val}</div>
                    ))
                }
                <br/>
            </div>
        )
    }

    const PrintProof = () =>{
        return(
            <div>
            {
                JSON.parse( sessionStorage.getItem('proof')).map((val, ind) => (
                    <div key={ind}> {val}</div>
                ))
            }
            <br/>
            </div>
        );
    }

    const PrintInputs = () =>{
        return(
            <div>
            {
                JSON.parse( sessionStorage.getItem('verifyInput')).map((val, ind) => (
                    <div key={ind}> {val}</div>
                ))
            }
            <br/>
            </div>
        );
    }

    return(
        <div className='myCard'>
            <h2>RegistData Contract Test</h2>
            <br/><div>
                <button className='buttonStyle' onClick={setContractInstanceHandler}>set ContractIns</button>
            </div>

            <div>
                <button className='buttonStyle' onClick={getAccountsHandler}>get accounts</button>
                <PrintArr arr={accounts} />
            </div>

            <input type='text' className='text' onChange={addrChangeHandler} placeholder='write addr'></input>
            <button className='buttonStyle' onClick={getBalanceHandler}>get balance</button>
            <div>balance : {balance}</div><br></br>

            <div>
                <input type='text' className='text' onChange={hCtChangeHandler} placeholder='write h_ct dec string'></input>
                <button className='buttonStyle' onClick={callIsRegistered}>call isRegistered</button><br/>
                isRegistered : {isRegisteredFlag? "true":"false"}
            </div>

            <div className='myCard'>
                <div className='myCard'>
                    <h3>Proof</h3>
                    <p>[a:2 , b:4, c:2 ]</p>
                    <PrintProof/>
                </div>

                <div className='myCard'>
                    <h3 >verify Inputs</h3>
                    <p>inputs : [ constant(1) , pk_own , h_k , h_ct , id_data ]</p>
                    <PrintInputs/>
                </div>
                <input type='text' className='text' placeholder='write sender addr' onChange={senderAddrChangerHandler}></input>
                <button className='buttonStyle' onClick={sendRegistData}>send registData Tx</button><br/>
                Receipt : {registDataRecipt}
                <br/><br/><br/><br/>

                {/* <button onClick={sendRegistDataServer}> sendRegistDataServer</button> */}
            </div>
        </div>
    )
}

export default RegistDataComponent;