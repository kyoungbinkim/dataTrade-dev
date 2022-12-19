import React, { useState, useEffect } from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import axios from 'axios'
import Config from '../utils/config.js';
import PasswordHelper from '../wallet/password.js';
import UserKey, {MakePrivKey, recoverFromIdPw} from '../wallet/keyStruct.js';
import '../test/WalletCard.css'


const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 2500;

export default function LoginService() {
    const navigate = useNavigate();
    const loginCheck = false;
    const [id, setId] = useState(null);
    const [pw, setPw] = useState(null);
    const [pwTk, setPwTk] = useState(null);

    let sessionStorage = window.sessionStorage;

    const onChangeId = (e) => {
        console.log(e.target.value, e.target.type);
        setId(e.target.value);
    };

    const onChangePw = (e)=> {
        if (!e.target.value){return;}
        const passwordToken = PasswordHelper.getPassWordToken(e.target.value);
        setPw(e.target.value);
        setPwTk(passwordToken);
    };

    const loginHandler = e => {
        if(sessionStorage.getItem("isLogin")){
            alert("already login");
            return;
        }
        const joinData = {"id":`${id}`, "pw":`${pwTk}`}
        console.log(joinData);
        httpCli.post("/usr/login/login", joinData).then(res => {
            console.log(res.data);
            if(res.data.flag){
                alert("login");
                try{
                    sessionStorage.setItem("id", id);
                    sessionStorage.setItem("pwTk", pwTk);
                    sessionStorage.setItem("sid", res.data.sid);
                    sessionStorage.setItem("isLogin", true);
                    sessionStorage.setItem("sk", MakePrivKey(id,pw));
                    const userKey = recoverFromIdPw(id, pw);
                    sessionStorage.setItem("usrKey", userKey.toJson());
                }
                catch (e){
                    console.log(e);
                    sessionStorage.clear();
                }
                console.log(sessionStorage);
                navigate(`/`);
            }
            else{
                alert("id or pw is wrong");
                navigate(`/Login`);
            }
            
        });
    };

    const checkLoginHandler = e => {
        alert(sessionStorage.getItem("isLogin"));

        httpCli.get("/usr/login").then(res => {
            alert(res.data);
            return res.data;
        });
    };

    return(
        <div className='Card'>
            <h3>Login Test</h3>
            <div>
                <input type="text" className='text' onChange={onChangeId} placeholder="write your id"></input><br/>
                <input type="text" className='text' onChange={onChangePw} placeholder="write your password"></input> <br/>
                <button className='buttonStyle' onClick={loginHandler}> LogIn</button>
                <p></p>
            </div>
            
        </div>
    );
};

{/* <div>
                <button className='buttonStyle' onClick={checkLoginHandler}>check login</button><br/>
                <button className='buttonStyle' onClick={() => {sessionStorage.clear()}}>logout</button>
            </div> */}

