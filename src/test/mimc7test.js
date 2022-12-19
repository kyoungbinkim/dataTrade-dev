import React, { useState } from "react";
import mimc from "../crypto/mimc.js";
import './WalletCard.css'

class Mimc7Class extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: '',
            dist : ''
        };
        this.mimc7 = new mimc.MiMC7();
        this.changeValueHandler = this.changeValueHandler.bind(this);
        this.changeSubmitHandler = this.changeSubmitHandler.bind(this);
    }

    changeValueHandler(e){
        this.setState({value : e.target.value});
        console.log(this.state);
    }

    changeSubmitHandler(e){
        console.log("!", typeof(this.state.value), e.target.value);
        const dist = this.mimc7.hash(this.state.value);
        console.log("dist : "+ dist); 
        this.setState({dist: [dist]});
    }


    render(){
        return (
            <form className="mimcCard" onSubmit={() => this.changeSubmitHandler(this)}>
              <p></p>
              <label>
                <input className="input" type="text" value={this.state.value} onChange={this.changeValueHandler} placeholder="mimc7 input" />
              </label>
              <input type="submit" value="Submit" />
              <p> Return : {this.state.dist}</p>
            </form>
          );
    }
}

export const Mimc7Card = () => {
    const mimc7 = new mimc.MiMC7();
    const [val,  setVal]  = useState(null);
    const [dist, setDist] = useState(null);

    const changeDistHandler = () => {
        try {
            setDist(mimc7.hash(val));    
        } catch (error) {
            alert(error);
        }
        
    };

    const changeValHandler = (event) => {   
        console.log(event.target.value);
        setVal(event.target.value);
    };

    return (
        <div>
            <h2>-- MiMC7 TEST --</h2>
            <input name="input" onChange={(event) => changeValHandler(event)} placeholder="only hex"></input>
            <button onClick={()=>changeDistHandler()} name="hash"> hash </button>
            <div><h4>return : {dist}</h4></div>
        </div>
    );
}

export default { 
    Mimc7Class,
    Mimc7Card
};