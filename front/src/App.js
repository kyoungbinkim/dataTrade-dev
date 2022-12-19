import * as React from "react";
import { Routes, Route, Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import JoinService from './react/join.js';
import LoginService from './react/login.js';
import {Mimc7Card} from './test/mimc7test.js';
import ClockDisplay from "./test/clockDisplay.js";
import WalletCard from "./test/WalletCard.js";
import EncDataTest from './test/encryptionTest.js';
import FileUpload from './test/fileUploadTest.js';
import UserKey from './test/keyTest.js';
import './test/WalletCard.css'
 
export default function App() {
  return (
    <div>
      <h1 className="App-text">Join/Login Test</h1>

     <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Join" element={<JoinApp />} />
          <Route path="Login" element={<LoginApp />} />
          <Route path="Logout" element={<Logout/>}/>
          <Route path="Regist" element={<RegistData/>}/>
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <nav>
        <ul className="App-text">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Join">Join</Link>
          </li>
          <li>
            <Link to="/Login">Login</Link>
          </li>
          <li>
            <Link to="/Logout">Logout</Link>
          </li>
          <li>
            <Link to="/Regist">Regist Data</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>

      <hr />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </div>
  );
}

function Home() {
  if(!sessionStorage.getItem("isLogin")){
    return (
      <div>
        <h2 className="App-text">Home</h2>
      </div>);
  }
  return(
    <div className='myCard'>
      <ClockDisplay />
      <MimcApp />
      <WalletCard />
      <UserKey.UserKeyTest />
      <EncDataTest.EncData />
      <FileUpload />
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2 className="App-text">no match link</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

function LoginCheck(flag=true){
  const isLogin = sessionStorage.getItem("isLogin");
  if(!isLogin ^ flag){
    if(flag){alert("you already login");}
    else{alert("login First");}
    return (
      <Navigate to="/"/>
    ); 
  }
  return undefined;
}

function JoinApp(){
  return( 
    LoginCheck()??
    <div className='myCard'>
      <JoinService />
    </div>
  );
}

function LoginApp(){
  return (
    LoginCheck()??
    <div className='myCard'>
      <LoginService />
    </div>
  );
}

function MimcApp(){

  return(
    <div className="myCard">
      <Mimc7Card />
    </div>
  );
}

function Logout(){
  
  if(sessionStorage.getItem("isLogin")){
    alert("logout sucess");
  }else{
    alert("login first");
  }
  sessionStorage.clear();
  return (
    <Navigate to="/"/>
  );
}

function RegistData(){
  return(
    LoginCheck(false)??
    <div className="myCard">
      <FileUpload/>
    </div>
  );
}

