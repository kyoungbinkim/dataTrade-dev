import React, { useState } from 'react';
import { useAsync } from 'react-async';
import { Routes, Route, Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import PasswordHelper from '../wallet/password.js';
import UserKey, { MakePrivKey } from '../wallet/keyStruct.js';
import Config from '../utils/config.js';
import httpCli from '../utils/http.js';
import '../test/WalletCard.css'



const loadDataList = async () => {
    const ret = (await httpCli.get(`/data/page`)).data;
    const test = (await httpCli.get(`data/page/0`)).data;
    if(ret === 'err'){

        sessionStorage.clear();
        alert('다시 로그인하세요')
        return [];
    }
    console.log(ret);
    return ret.data;
    return JSON.stringify(ret);
}

export default () => {

    const { data, error, isLoading } = useAsync({ promiseFn: loadDataList})

    const [ret, setRet] = useState([]);


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
            {/* <pre>
                {
                    data.map((val, ind) => {
                        <div key={ind}> {val} {ind} </div>
                    })
                }
            </pre> */}
        </div>
        )
    }
    // return null
}

