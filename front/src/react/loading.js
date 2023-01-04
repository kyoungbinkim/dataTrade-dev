import React from 'react';
import Spinner from '../../public/Infinity.gif'
import '../test/WalletCard.css'
import {Background, LoadingText} from './styles';

export default () => {
  return (
    <div className='myCard'>
      <LoadingText>잠시만 기다려 주세요.</LoadingText>
      <img src={Spinner} alt='생성중' width='10%'/>
    </div>
  );
};