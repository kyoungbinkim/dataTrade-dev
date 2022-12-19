import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordHelper from '../wallet/password.js';
import axios from 'axios'
import Config from '../utils/config.js';
import '../test/WalletCard.css'


const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 2500;

export default function JoinService() {

    const navigate = useNavigate();
    const [id, setId] = useState(null);
    const [pwTk, setPwTk] = useState(null);
    const [pwTk2, setPwTk2] = useState(null);
    const [idCheck, setIdCheck] = useState(false);
    const [pwCheck, setPwCheck] = useState(null);

    const onChangeId = (e) => {
        console.log(e.target.value, e.target.type);
        setId(e.target.value);
        setIdCheck(false);
    };

    const onChangePw = (e)=> {
        if (!e.target.value){return;}
        const passwordToken = PasswordHelper.getPassWordToken(e.target.value);
        setPwTk(passwordToken);
    };
    
    const onChangePw2 = (e)=> {
        const passwordToken = PasswordHelper.getPassWordToken(e.target.value);
        setPwTk2(passwordToken);
    };

    const duplicateHandler = async e => {
        
        if(id.length > (Config.maxIdLen)){
          alert("Id is too long");
          return;
        }
        const res = await httpCli.get(`/usr/join/duplicate/${id}`);
        console.log(res.data, "if false, already exsist");
        if(!res.data){ alert("id already exsist!"); return; }
        else{ alert(`you can use "${id}"`); }
        setIdCheck(res.data);
    };

    const joinHandler = async e => {
      if(!idCheck){
        alert("you should check id");
        return;
      }
      if(!(pwTk === pwTk2)){
        alert("pw is different");
        return;
      }
      const joinData = {"id":`${id}`, "pw":`${pwTk}`}
      console.log(joinData);
      httpCli.post("/usr/join/join", joinData).then(res =>{
        console.log(res.data);
        if(res.data["flag"] === false){
          alert("id or data is wrong");
          return;
        }
        alert("sucess Join");
        navigate(`/`);
      });
    }

    const printPwCheck = () =>{
        if(!pwTk2){
          return "";
        }
        if(pwTk === pwTk2){
          return "비밀번호가 같습니다."
        }
        else{
          return "비밀번호가 다릅니다."
        }
    }

    return (
        <div className='Card'>
            <h3>Join Test</h3>
            <div>
                <input type="text" className='text' onChange={onChangeId} placeholder="write your id"></input>
                <button className='buttonStyle' onClick={ duplicateHandler }> Id Check</button>
                <p></p>
            </div>
            <div>
                <input className='text' onChange={onChangePw} placeholder="write your password"></input> <br/>
                <input className='text' onChange={onChangePw2} placeholder="rewrite your password"></input>
                <p>{ printPwCheck() }</p>
            </div>
            <div>
                <button className='buttonStyle' onClick={joinHandler}> Join </button>
            </div>
        </div>
    );
};

