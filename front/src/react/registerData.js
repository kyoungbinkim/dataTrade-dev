import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BigNumber } from 'ethers';


import contractInstance,{ getAccounts, getBalance, setContractInstance, getSinger } from '../contract/interface.js';
import httpCli from '../utils/http.js';
import LoadingPage from './loading.js';
import '../test/WalletCard.css'

const maxUtf8DataSize = 16430;


const RegisterDataComponent = () => {
    const navigate = useNavigate();
    let fileReader = new FileReader();
    const fileInput = React.useRef(null);

    const [title, setTitle] = useState(null);
    const [textFile, setTextFile] = useState(null);
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [register, setRegister] = useState(false);

    const [hCt, setHCt] = useState(null);
    const [proof, setProof] = useState([]);
    const [receipt, setReceipt] = useState(null);


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

    const PrintProof = () =>{
        return(
            <div className='Card'><br/>
                <strong>proof : </strong>
            {
                proof.map((val, ind) => (
                    <div  key={ind}> {ind+": "} {val}</div>
                ))
            }
            <br/>
            </div>
        );
    }

    const RegisterDataHandler = async (e) => {
        setLoading(true);

        const reqBody = {
            "title" : `${title}`,
            "desc"  : `${desc}`,
            "data"  : `${textFile}`
        }

        httpCli.post('/data/register/', reqBody).then(
            async res => {
                alert('데이터 등록이 완료되었습니다.')
                console.log(res.data);
                console.log(res.data.receipt);
                console.log(res.data.proof);

                setHCt(res.data.h_ct);
                setProof(res.data.proof)
                setReceipt(JSON.stringify(res.data.receipt, null, 2));
                setLoading(false);
                setRegister(true);
                // try {
                //     setContractInstance(
                //         res.data.contractAddr
                //     )
                //     const result = await contractInstance().isRegistered(BigNumber.from(hCt));
                //     console.log(result);
                //     // setIsRegisteredFlag(result);
                // } catch (error) {
                //     alert(error);
                // }
            }
        )
    }

    return (
        <div className='myCard'>
            {loading? <LoadingPage /> :
            <div>
                <h2>Register Data</h2>
                <input type='text' className='title' onChange={titleChangeHandler} placeholder=' 제목을 입력하시오.'></input><br/>
                <textarea className='textDesc' onChange={descChangeHandler} placeholder='작품 설명을 입력하시오.'></textarea><br/>
                <React.Fragment>
                    <button className='buttonStyle' onClick={handleButtonClick}>파일 업로드</button>
                    <input type="file"
                        ref={fileInput}
                        onChange={handleChange}
                        style={{ display: "none" }} />
                </React.Fragment><br/>
                
                <button className='buttonStyle' onClick={RegisterDataHandler}> 파일 전송 </button>
                <p className='paragraph'> {textFile} </p>
                {register?
                <div>
                    
                    <div>
                        <PrintProof /><br/>
                        <strong className='paragraph'>receipt : {'\n'+receipt}</strong>
                    </div><br/>
                </div>:
                <div></div>
                }
            </div>
            }
        </div>
    )
}

function getByteLengthOfUtf8String(s) {
    let b,i,c;
	if(s != undefined && s != "") {
		for(b=i=0; c=s.charCodeAt(i++); b+=c>>11?3:c>>7?2:1);
		return b;
	}
    return 0;
}


export default RegisterDataComponent;