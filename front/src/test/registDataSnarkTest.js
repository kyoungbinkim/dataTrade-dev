import react, { useState } from 'react';
import Encryption from '../crypto/encryption.js';
import math from '../utils/math.js';
import Config from '../utils/config.js';
import types from '../utils/types.js';
import EncDataTest from './encryptionTest.js';
import './WalletCard.css'


function RegistDataSnarkTest() {
    
    return (
        <div className='mimcCard'>
            <h4>{EncDataTest.EncData}</h4>
        </div>
    );
}