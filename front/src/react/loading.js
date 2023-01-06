import React from 'react';
import Spinner from '../Infinity.gif'
import '../test/WalletCard.css'
// import {Background, LoadingText} from './styles';

export default () => {
  return (
    <div>
      <h4>잠시만 기다려 주세요.</h4>
      <img src={Spinner} alt='생성중' width='35%'/>
    </div>
  );
};