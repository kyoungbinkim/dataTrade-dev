import React, { useState, useEffect } from 'react';
import {Navigate, useNavigate, RedirectFunction} from 'react-router-dom';
import axios from 'axios'
import _ from 'lodash'

import httpCli from '../utils/http.js';
import mimc from '../crypto/mimc.js';
import types from '../utils/types.js';
import Config from '../utils/config.js';
import { UserKeyNew } from '../wallet/keyStruct.js';
import '../test/WalletCard.css'

export default function LoginService() {

    const mimc7 = new mimc.MiMC7();

    const navigate = useNavigate();

    const [skOwn, setSkOwn] = useState(null);

    const onChangeSkOwn = (e) => {
        setSkOwn(e.target.value);
    }

    const onClickLogin = (e) => {
        const loginTk = mimc7.hash(skOwn, types.asciiToHex('login'));
        console.log('loginTk : ', loginTk);
        httpCli.post("/usr/login/login", {'loginTk' : loginTk}).then(res =>{
            console.log(res.data );
            if(!_.get(res.data, 'flag')){
                navigate('/login');
                return;
            }
            // sessionStorage.setItem('key', )
            sessionStorage.setItem('isLogin', true);
            sessionStorage.setItem('nickname', res.data.nickname);
            sessionStorage.setItem('loginTk', loginTk);
            sessionStorage.setItem('jwtToken', res.data.token);

            console.log(res.data)

            httpCli.defaults.headers.common['access-token'] = JSON.stringify(res.data);
            navigate('/');
            return;
        });
    }

    return(
    <div className='myCard'>
        <h3>Login</h3>
        <input type="text" className='text' onChange={onChangeSkOwn} placeholder="write your secret key"></input>
        <button className='buttonStyle' onClick={onClickLogin}>login</button><br/>
    </div>);
};
