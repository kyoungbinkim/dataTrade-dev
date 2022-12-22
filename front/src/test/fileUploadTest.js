import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'
import Config from '../utils/config.js';
import {MakePrivKey} from '../wallet/keyStruct.js';
import './WalletCard.css'
import { getPropertyOfType } from 'tsutils';

const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 30000;

const maxUtf8DataSize = 16430;

const FileUpload = () => {
    const fileInput = React.useRef(null);
    const [title, setTitle] = useState(null);
    const [textFile, setTextFile] = useState(null);
    const [verInput, serVerInput] = useState(null);
    const [proof, setProof] = useState(null);
    const [desc, setDesc] = useState("");
    let fileReader = new FileReader();

    const titleChangeHandler = e => {
        setTitle(e.target.value);
    }

    const descChangeHandler = e => {
        setDesc(e.target.value);
    }

    const handleButtonClick = e => {
        fileInput.current.click();
    };
    
    const handleChange = e => {
        
        console.log(e.target.files[0]);
        console.log(e.target.files[0]);
        fileReader.readAsText(e.target.files[0]);
        fileReader.onload = () => {
            const text = fileReader.result;
            if(getByteLengthOfUtf8String(text) > maxUtf8DataSize){
                alert("size is too big");
                return;
            }
            console.log(getByteLengthOfUtf8String(text), fileReader.result.length);
            setTextFile(fileReader.result);
            console.log(fileReader.result.charCodeAt(0).toString(16));
            sessionStorage.setItem("data", fileReader.result);
        };
    };
    
    const fileUpload = e =>{
        const fileData = {
            "data"  :`${textFile}`, 
            "key"   :`${sessionStorage.getItem("sk")}`, 
            "id"    :`${sessionStorage.getItem("id")}`,
            "title" :`${title}`,
            "desc"  :`${desc}`,
        };
        console.log(fileData);
        httpCli.post("/data/data/upload", fileData).then(res =>{
            console.log(res.data);
            console.log(res.data["proof"]);
            setProof(res.data["proof"]);
            serVerInput(res.data["verifyInput"]);
        });
    }

    return (
        <div className='myCard'>
            <h2>file upload Test</h2>
            <input className='buttonStyle' type="file" id="file"  onChange={handleChange} />
            <React.Fragment>
                <button className='buttonStyle' onClick={handleButtonClick}>파일 업로드</button>
                <input type="file"
                    ref={fileInput}
                    onChange={handleChange}
                    style={{ display: "none" }} />
            </React.Fragment><br/>
            <input type='text' className='text' onChange={titleChangeHandler} placeholder=' 제목을 입력하시오.'></input><br/>
            <textarea className='textDesc' onChange={descChangeHandler} placeholder='작품 설명을 입력하시오.'></textarea><br/>
            <button className='buttonStyle' onClick={fileUpload}> 파일 전송 </button>
            <h4> {textFile} </h4>
            <div>
                proof : {proof}
            </div><br/>
        </div>
    );
};

function getByteLengthOfUtf8String(s) {
    let b,i,c;
	if(s != undefined && s != "") {
		for(b=i=0; c=s.charCodeAt(i++); b+=c>>11?3:c>>7?2:1);
		return b;
	}
    return 0;
}

export default FileUpload;