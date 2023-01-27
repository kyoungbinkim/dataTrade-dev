import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import _ from 'lodash'

import contractInstance,{ getAccounts, getBalance, setContractInstance, getSinger } from '../contract/interface.js';
import httpCli from '../utils/http.js';
import types from '../utils/types.js';
import mimc from '../crypto/mimc.js';
import math from '../utils/math.js';
import Config from '../utils/config.js';
import UserKey from '../wallet/keyStruct.js';
import '../test/WalletCard.css'

export default function JoinService() {
    
    const mimc7 = new mimc.MiMC7();
    const navigate = useNavigate();
    
    const [accounts, setAccounts] = useState([]);
    const [key, setKey]          = useState(null);
    const [nickname, setNickname] = useState(null);
    const [deduplication, setDeduplication] = useState(false);

    const onClickSkOwnGen = async (e) => {   

        const key = UserKey.keyGen();
        sessionStorage.setItem('key', key.toJson());
        
        setAccounts(await getAccounts());
        console.log(await getAccounts())
        
        setKey(JSON.parse(key.toJson()));
        alert("반드시 기억하세요!")
        alert('0x'+key.skOwn);
        setNickname(null);
        setDeduplication(false);
    };

    const onChangeNickname = (e) => {
        setNickname(e.target.value);
        setDeduplication(false);
    }

    const onChangeEOA = (e) => {
        sessionStorage.setItem('EOA', e.target.value);
    }

    const onClickDeduplication = async (e) => {

        const res = await httpCli.get(`/usr/join/check/nickname/${nickname}`);
        if(!res.data){ alert("id already exsist! 😭"); return; }
        else{ alert(` you can use "${nickname}"🎉`); }
        setDeduplication(true);
    }

    const onClickJoin = (e) => {
        const key = JSON.parse(sessionStorage.getItem('key'));
        console.log(_.get(key,'skOwn'));
        let joinQuery = {
            loginTk : mimc7.hash(_.get(key,'skOwn'), types.asciiToHex('login')),
            nickname: nickname,
            skEnc   : _.get(key, 'skOwn'),
            pkOwn   : _.get(key, 'pkOwn'),
            pkEnc   : _.get(key, 'pkEnc'),
            addr    : _.get(key, 'ena'),
            EOA     : sessionStorage.getItem('EOA'),
        }
        httpCli.post("/usr/join/join", joinQuery).then(res =>{
            console.log(res.data);
            if(res.data["flag"] === false){
              alert("이미가입되었거나 올바르지 않은 주소입니다.");
              return;
            }
            console.log(res.data['receipt']['blockHash'], res.data['receipt']['transactionHash'])
            alert("sucess Join"+ 
                "\n\nblockHash : " + res.data['receipt']['blockHash']+
                "\ntxHash : " + res.data['receipt']['transactionHash'] +'\n');
            sessionStorage.removeItem('key');
            navigate(`/`);
        });
    }

    const PrintArr = () => {
        return(
            <div className='paragraph'>
                <h4>eth Address</h4>
                {
                    accounts.map((val, ind) => (
                        <div key={ind}>{ind} {':'} {val}</div>
                    ))
                }
                <br/>
            </div>
        )
    }

    return (
        <div className='Card'>
            <h3>Join</h3>
            {!key ? 
                <div>
                    <button className='buttonStyle' onClick={onClickSkOwnGen}> 🔑 비밀키 생성기 🔑 </button><br/>
                </div>:
                <div className='myCard'>
                    <div className='paragraph'>
                        <h3> 🔐 </h3>
                        <strong> SK_own : {'0x'+_.get(key, 'skOwn')}</strong><br/>
                        <strong> PK_own : {'0x'+_.get(key, 'pkOwn')}</strong><br/>
                        <strong> SK_enc : {'0x'+_.get(key, 'skEnc')}</strong><br/>
                        <strong> PK_enc : {'0x'+_.get(key, 'pkEnc')}</strong><br/>
                        <strong> addr  : {' 0x'+_.get(key, 'ena')}</strong><br/><br/>
                    </div>
                    
                    <PrintArr/>
                    <div>
                        <input type='text' className='text' onChange={onChangeEOA} placeholder='write your EOA addr'></input><br/>
                        <input type='text' className='text' onChange={onChangeNickname} placeholder='write your nickname'></input>
                        <button className='buttonStyle' onClick={onClickDeduplication}>중복확인</button><br/>
                    </div>
                    {
                        deduplication ?
                        <div>
                            <button className='buttonStyle' onClick={onClickJoin}>🌈 𝑱 𝐨 ℹ 𝓷✨</button>
                        </div> 
                        :<div><br/><br/></div> 
                    }
                </div>
            }


        </div>
    );
};

