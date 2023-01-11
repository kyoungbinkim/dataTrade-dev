import React, { useState } from 'react';
import { useAsync } from 'react-async';
import { Routes, Route, Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import PasswordHelper from '../wallet/password.js';
import UserKey, { MakePrivKey } from '../wallet/keyStruct.js';
import axios from 'axios'
import Config from '../utils/config.js';
import '../test/WalletCard.css'

const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 2500;

const loadDataList = async () => {
    const ret = (await httpCli.get(`/data/data/page`)).data;
    console.log(ret, JSON.stringify(ret[0]));
    return ret;
    return JSON.stringify(ret);
}

export default () => {

    const { data, error, isLoading } = useAsync({ promiseFn: loadDataList})

    const [ret, setRet] = useState([]);

    
    // const ret = (await httpCli.get(`/data/data/page`)).data;
    //     console.log(ret);
    const PrintRet = () => {
        
        return(
            <div>
                {
                    data.map((val, ind) => (
                        <div key={ind}>{ind} {':'} {JSON.stringify(val, null,2)}</div>
                    ))
                }
                <br/>
            </div>
        )
    }

    if (isLoading) return <div>loading</div>
    if (error) return <div>error</div>
    if (data){
        return (
        <div>
            <strong>Loaded data:</strong>
            <PrintRet />
            <pre>
                {
                    data.map((val, ind) => {
                        <div key={ind}> {val} {ind} </div>
                    })
                }
            </pre>
        </div>
        )
    }
    // return null
}

