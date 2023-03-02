let _       = require('lodash');
let fs      = require('fs');
let process = require('process');
let exec    = require('node:child_process').exec;

const ALL = '0';
const ABI = '1';
const KEY = '2';

const copyAll =() => {
    copyAbiToApp();
    copyKeysToApp();
}

const copyAbiToApp = () =>{
    try {
        const abi = _.get( JSON.parse(fs.readFileSync('build/contracts/DataTradeContract.json').toString('utf-8')), 'abi');
    
        fs.writeFileSync(
            '/Users/kim/dataTradeApp/src/core/web3/abi.js',
            'export default abi = {"abi" :'+ JSON.stringify(abi,null, 2) +'}'
        )
        
    } catch (error) {
        console.log(error);
        throw error;
    }
    
}

const copyKeysToApp = () => {
    try {
        exec("cp ./keys.json /Users/kim/dataTradeApp/src/core/web3/", (err, stdout, stderr) =>{})
    } catch (error) {
        console.log(error);
        throw error;
    }
}


const cmd = process.argv[2];

if (cmd === ALL) { copyAll(); }
else if(cmd === ABI) { copyAbiToApp(); }
else if(cmd === KEY) { copyKeysToApp(); }
else{console.log('cmd num err');}