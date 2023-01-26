import fs from 'fs';
import { isRegistered, getContractAddr } from '../core/contracts/registdata.js';
import {compileContract, deploy, } from '../core/contracts/deploy.js';
import {
    getContractFormatVk, web3Ins 
} from '../core/contracts/utils.js'
import Config, {ganacheAccountKeyPath} from '../core/utils/config.js';
import Web3 from 'web3';

describe('contracts test',  () => {

    const web3 = new Web3();
    web3.setProvider(new Web3.providers.HttpProvider(Config.testProvider));

    it('create usr', () => {
        const ret = web3.eth.accounts.create('id');
        console.log(ret);
    })

    it('get Accounts', async () =>{
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
    })
})