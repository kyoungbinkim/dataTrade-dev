import React, { useState } from 'react';

const FileUpload = props => {
    const fileInput = React.useRef(null);
    const [textFile, setTextFile] = useState(null);
    let fileReader = new FileReader();

    const handleButtonClick = e => {
        fileInput.current.click();
    };
    
    const handleChange = e => {
        
        console.log(e.target.files[0]);
        console.log(e.target.files[0]);
        fileReader.readAsText(e.target.files[0]);
        fileReader.onload = () => {
            console.log(fileReader.result);
            setTextFile(fileReader.result);
        };
        
    };
    
    return (
        <div>
             <input type="file" id="file"  onChange={handleChange} multiple="multiple" />
            <React.Fragment>
                <button onClick={handleButtonClick}>파일 업로드</button>
                <input type="file"
                    ref={fileInput}
                    onChange={handleChange}
                    style={{ display: "none" }} />
            </React.Fragment>
            <h4> {textFile} </h4>
        </div>
    );
};

export default FileUpload;