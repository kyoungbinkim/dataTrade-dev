import React, {useEffect, useState} from 'react';

export default class ClockDisplay extends React.Component{
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
            <p> {this.state.rand}</p>
          </div>
        </div>
      );
    }
  }
