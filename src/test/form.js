import { render } from '@testing-library/react';
import React from 'react';


let myList = [1,2,3,4,5];
const myListItems = myList.map((n) => <li>{n}</li>)

function myListDisplay(props){
    const myList = props.mylist;
    const myListItems = myList.map((m) => <li key={m.toString()}>{m}</li>);
    return (
        <ul>{myListItems}</ul>
    );
}

class NameForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {value: 'Write Your Name'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event){
        this.setState({value: event.target.value});
    }
    handleSubmit(event){
        alert("A name wass submitted : " + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
          <form onSubmit={() => this.handleSubmit(this)}>
            <p></p>
            <label>
              Name:
              <input type="text" value={this.state.value} onChange={this.handleChange} />
              <textarea type="text" value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        );
    }
}

class selectTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {value: 'coconut'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event){
        this.setState({value: event.target.value});
    }
    handleSubmit(event){
        alert("A name wass submitted : " + this.state.value);
        event.preventDefault();
    }

    Option(props){
        return <option value={props.name}>{props.name}</option>;
    }

    render(){
        return(
            <form onSubmit={this.handleSubmit}>
                <p></p>
                <label>
                    pick your favorate :
                    <select value={this.state.value} onChange={this.handleChange}>
                        <this.Option name={"coconut"} />  
                        <this.Option name={"grape"} />
                        <this.Option name={"mango"} /> 
                        <this.Option name={"banana"} />
                    </select> 
                </label>
                <input type="submit" />
             </form>
        );
    }
}

class multiInputTest extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          isGoing: true,
          numberOfGuests: 2
        };
    
        this.handleInputChange = this.handleInputChange.bind(this);
      }
    
      handleInputChange(event) {
        const target = event.target;
        const value = target.name === 'isGoing' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
      }
    
      render() {
        return (
        <div>
          <form>
            <p></p>
            <label>
              multiInputTest
              Is going:
              <input
                name="isGoing"
                type="checkbox"
                checked={this.state.isGoing}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label>
              Number of guests:
              <input
                name="numberOfGuests"
                type="number"
                value={this.state.numberOfGuests}
                onChange={this.handleInputChange} />
            </label>
          </form>
          <p>{this.state.isGoing.toString()+" "+this.state.numberOfGuests.toString()}</p>
        </div>
        );
      }
}


export default{
    myListDisplay,
    NameForm,
    selectTest,
    multiInputTest
};