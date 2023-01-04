import fs from 'fs';
import { isDeployed, isRegistered } from '../core/contracts/registdata.js';
import {compileContract, deploy} from '../core/contracts/deploy.js';
import {getContractFormatVk, web3Ins} from '../core/contracts/utils.js'
import Config, {ganacheAccountKeyPath} from '../core/utils/config.js';


describe('contracts test',  () => {

    const keys = JSON.parse(fs.readFileSync(ganacheAccountKeyPath, 'utf-8'));
    
    it('key list', async () => {
        const accountList = await web3Ins.eth.getAccounts();

        // console.log(keys.addresses[accountList[0].toLocaleLowerCase()], accountList)
        const privKeyTest = new Buffer.from(
            keys.addresses[accountList[0].toLocaleLowerCase()].secretKey.data, 'utf-8'
        ).toString('Hex')
        console.log(privKeyTest)

        console.log(new Buffer.from(
            keys.addresses[accountList[0].toLocaleLowerCase()].publicKey.data, 'utf-8'
        ).toString('Hex'))
    
    })

    it('test isDeployed', () => {
        console.log(isDeployed());
    })

    it('deploy contracts', async () => {
        const addr = (await web3Ins.eth.getAccounts())[0];
        const privKey = new Buffer.from(
            keys.addresses[addr.toLocaleLowerCase()].secretKey.data, 'utf-8'
        ).toString('Hex')
        console.log('addr : ', addr);

        const receipt = await deploy(addr, privKey);
        console.log(receipt)
    })

    it('test isDeployed', async () => {
        console.log(isDeployed());
        const isR = await isRegistered('0xffaaaa');
        console.log(isR)
    })

    it('test registData', async () => {


        const test = JSON.parse(
            fs.readFileSync('/Users/kim/dataTrade-dev-backup/server/db/adb537d14b839ad6e7da1049310fd3658a0e72d3ff8359fb216e1d403955b23.json')
        )
        // console.log(test)
    })

    
})