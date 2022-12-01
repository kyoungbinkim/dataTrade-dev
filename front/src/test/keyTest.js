import React, { useState } from "react";
import UserKey from "../wallet/keyStruct.js";
import './WalletCard.css'


class UserKeyTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            userKey : null,
            inputSk : null,
            recoveredUserKey : null
        };
        this.changeRandomKeyGenHandler = this.changeRandomKeyGenHandler.bind(this);
        this.changeInputKeyHandler = this.changeInputKeyHandler.bind(this);
        this.recoverFromUserSkHandler = this.recoverFromUserSkHandler.bind(this);
    }

    changeRandomKeyGenHandler(e){
        const userKey = UserKey.UserKey.keyGen();
        console.log(userKey);
        this.setState({userKey: userKey.toJson()})
    }

    changeInputKeyHandler(e){
        this.setState({inputSk : e.target.value});
        console.log(this.state.inputSk);
    }

    recoverFromUserSkHandler(e){
        console.log("input Sk : ", this.state.inputSk);
        const userPublicKey = UserKey.UserKey.recoverFromUserSk(this.state.inputSk);
        const userKey = new UserKey.UserKey(
            {
                ena : userPublicKey.ena,
                pkOwn : userPublicKey.pkOwn,
                pkEnc : userPublicKey.pkEnc
            }, this.state.inputSk);
        this.setState({recoveredUserKey: userKey.toJson()});
    }

    render(){
        return(
            <div className="Card">
                <div>
                    <text>random Key Generation</text>
                    <button onClick={this.changeRandomKeyGenHandler}> KeyGen </button>
                    <h4>return : {this.state.userKey}</h4>
                </div>
                <div>
                    <text>UserKey recoverFromUserSk <br></br></text>
                    <input onChange={this.changeInputKeyHandler} placeholder="write your sk"></input>
                    <button onClick={this.recoverFromUserSkHandler}>recover</button>
                    <h4>return : {this.state.recoveredUserKey}</h4>
                </div>
            </div>
        );
    }

}

export default {
    UserKeyTest
};