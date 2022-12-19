import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import { render } from '@testing-library/react';
import LoggingButton from './test/logging.js';
import form from './test/form.js';
import Mimc7Class from './test/mimc7test.js';
import WalletCard from './test/WalletCard.js';
import UserKey from './test/keyTest.js';
import EncDataTest from './test/encryptionTest.js';
import reportWebVitals from './reportWebVitals.js';
import FileUpload from './test/fileUploadTest.js';
import App from './App.js';


function Welcome(props){
  return <h1>Hello, {props.name} !!</h1>
}

function WelcomApp(){
  return(
    <div>
      <Welcome name="gg"/> 
      <Welcome name="aa"/>
    </div>
  );
}

function formatDate(date) {
  return date.toLocaleDateString();
}

function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <img className="Avatar"
          src={props.author.avatarUrl}
          alt={props.author.name}
        />
        <div className="UserInfo-name">
          {props.author.name}
        </div>
      </div>
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}

class ClockDisplay extends React.Component{
  constructor(props){
    super(props);
    this.state = {date : new Date(), rand:Math.random()};

    this.selectRandom = this.selectRandom.bind(this);
  }
  
  componentDidMount(){
    this.timerID = setInterval(
      () => this.tick(), 500
    );
  }

  componentWillUnmount(){
    clearInterval(this.timerID);
  }

  tick(){
    this.setState(
      {date : new Date()}
    );
  }

  selectRandom(){
    this.setState(
      {rand : Math.random()}
    );
  }

  render(){
    return (
      <div> 
        <h2>{this.state.date.toLocaleTimeString()}.</h2>
        <div>
          <button onClick={this.selectRandom}> random </button>
          <text> {this.state.rand}</text>
        </div>
      </div>
    );
  }
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();