import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios'

import httpCli from '../utils/http.js';
import Config from '../utils/config.js';
import types from '../utils/types.js';
import {MakePrivKey} from '../wallet/keyStruct.js';
import contractInstance,{ setContractInstance } from '../contract/interface.js';
import LoadingPage from './loading.js';
import '../test/WalletCard.css'


const maxUtf8DataSize = 16430;

const GetCTandProof = () => {
    const navigate = useNavigate();
    const fileInput = React.useRef(null);
    const [title, setTitle] = useState(null);
    const [textFile, setTextFile] = useState(null);
    const [verInput, serVerInput] = useState(null);
    const [proof, setProof] = useState([]);
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    let fileReader = new FileReader();

    const titleChangeHandler = e => {
        setTitle(e.target.value);
    }

    const descChangeHandler = e => {
        setDesc(e.target.value);
    }

    const handleButtonClick = e => {
        fileInput.current.click();
    }
    
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
            sessionStorage.setItem("data", fileReader.result);
        };
    };
    
    const getProof = e =>{
        setLoading(true);
        const fileData = {
            "id"    :`${sessionStorage.getItem("id")}`,
            "title" :`${title}`,
            "desc"  :`${desc}`,
        };
        httpCli.post("/data/data/getProof", {
            "data"  :`${textFile}`, 
            "id"    :`${sessionStorage.getItem("id")}`,
        },
        ).then(res =>{
            if(res.data['flag']){
                console.log(res.data);
                setProof(res.data["proof"]);
                serVerInput(res.data["verifyInput"]);
                
                fileData['proof']       = res.data["proof"];
                fileData['verifyInput'] = res.data['verifyInput'];
                fileData['id_data']     = types.decToHex(res.data['verifyInput'][4]);
                fileData['h_ct']        = types.decToHex(res.data['verifyInput'][3]);
                fileData['ct_data']     = res.data['ct_data'];
                fileData['dataEncKey']  = res.data['dataEncKey'];
                fileData['contractAddr']= res.data['contractAddr'];
                
                
                console.log(fileData);
                console.log(JSON.stringify(res.data['contractAbi'] , null, 2));

                sessionStorage.setItem('proof', JSON.stringify(res.data['proof']));
                sessionStorage.setItem('verifyInput', JSON.stringify(res.data['verifyInput']));
                sessionStorage.setItem('fileData', JSON.stringify(fileData));
                sessionStorage.setItem('contractAddr', res.data['contractAddr']);
                sessionStorage.setItem('contractAbi', JSON.stringify(res.data['contractAbi'] , null, 2));

                setContractInstance(res.data['contractAddr'], res.data['contractAbi']);
                alert('get Proof 성공');
                setLoading(false);
                navigate(`/Eth`);
            }
        });
    }

    return (
        <div className='myCard'>
            {loading? <LoadingPage /> :
            <div>
                <h2>file upload Test</h2>
                <input type='text' className='title' onChange={titleChangeHandler} placeholder=' 제목을 입력하시오.'></input><br/>
                <textarea className='textDesc' onChange={descChangeHandler} placeholder='작품 설명을 입력하시오.'></textarea><br/>
                {/* <input className='buttonStyle' type="file" id="file"  onChange={handleChange} /> */}
                <React.Fragment>
                    <button className='buttonStyle' onClick={handleButtonClick}>파일 업로드</button>
                    <input type="file"
                        ref={fileInput}
                        onChange={handleChange}
                        style={{ display: "none" }} />
                </React.Fragment><br/>
                
                <button className='buttonStyle' onClick={getProof}> 파일 전송 </button>
                <p className='paragraph'> {textFile} </p>
                <div>
                    proof : {proof}
                </div><br/>
            </div>
            }
        </div>
    )
};

function getByteLengthOfUtf8String(s) {
    let b,i,c;
	if(s != undefined && s != "") {
		for(b=i=0; c=s.charCodeAt(i++); b+=c>>11?3:c>>7?2:1);
		return b;
	}
    return 0;
}

export default GetCTandProof;