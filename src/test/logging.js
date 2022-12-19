import { render } from '@testing-library/react';
import React from 'react';

class LoggingButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {isLoggedIn : true};
    }

    handleClick(){
        this.setState(
            prevState => ({isLoggedIn : !prevState.isLoggedIn})
        );
    };

    handleLoginClick(){
        this.setState({isLoggedIn : true});
    }

    handleLogoutClick(){
        this.setState({isLoggedIn : false});
    }

    render() {
        const loginFlag = this.state.isLoggedIn;
        let button;
    
        return (
            <div>
                <br></br>
                <button onClick={() => this.handleClick()}>
                    {this.state.isLoggedIn ? 'i\'m logged In' : "Off"}
                </button>
                <div>{<Greeting isLoggedIn={this.state.isLoggedIn} name={"kim"}/>}</div>
                <MyButton 
                    onClick={
                        this.state.isLoggedIn? 
                            () => this.handleLogoutClick() :
                            () => this.handleLoginClick()
                    }
                    desc={this.state.isLoggedIn? "logOut" : "logIn"}
                />
            </div>
            
        );
    }
}

function MyButton(props){
    console.log(props);
    return (
        <button onClick={props.onClick}>
            {props.desc}
        </button>
    )
}

function UserGreeting(props){
    console.log(props.name)
    if(props.name) return <h3>Wellcome Back! {props.name}</h3>;
    return <h3>Wellcome Back!</h3>;
}

function GuestGreeting(props){
    return(
        <h3>Please Sign up.</h3>
    )
}

function Greeting(props){
    const flag = props.isLoggedIn;
    const name = props.name;
    if(flag){
        return <UserGreeting name={name}/>;
    }
    return <GuestGreeting name={name}/>;
}


export default {
    LoggingButton,
    Greeting
};