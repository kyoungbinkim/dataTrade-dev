const _ = require('lodash');
const Web3 = require('web3');
const fs = require('fs');

const RPC = 'https://rpc.sepolia.org/';
const keyJSON = {
    "address": "0xa59c5a004f397ecf24FaA8105C523f0484Df514f",
    "privateKey": "0x59ad5215ff2aaf389eee6bed469924b324b04280e6473de4eb66ae379c0520d0"
}

const contractJSON = JSON.parse(fs.readFileSync('./build/contracts/dataTradeContract.json', 'utf-8'))
const contractAddressJSON = JSON.parse(fs.readFileSync('./sepoliaContractAddress.json', 'utf-8'))

const deploySepolia = async () => {
    try {
        let web3 = new Web3();
        web3.setProvider(new Web3.providers.HttpProvider(RPC));

        const contractINS = new web3.eth.Contract(contractJSON.abi)

        web3.eth.getBalance(_.get(keyJSON, 'address')).then(
            (bal) => {
                console.log('before balance : ', bal)
            }
        ).catch(
            (err) => {
                console.log("err : ", err)
            }
        )

        const deployTx = contractINS.deploy({
            data: contractJSON.bytecode,
            arguments: [
                getContractFormatVk('RegistData'),
                getContractFormatVk('GenTrade'),
                getContractFormatVk('AcceptTrade')
            ]
        })
        const estimateGas = await deployTx.estimateGas();
        const getGasPrice = await web3.eth.getGasPrice()
        console.log('get Gas Price \t: ', getGasPrice)
        console.log('estimate Gas \t: ',estimateGas);

        const signedTx = await web3.eth.accounts.signTransaction({
            from: _.get(keyJSON, 'address'),
            data: deployTx.encodeABI(),
            gas: estimateGas,
            gasPrice: '1100000000'
        }, _.get(keyJSON, 'privateKey'))

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);
        
        _.set(contractAddressJSON, _.get(contractAddressJSON, 'cnt'), receipt)
        _.set(contractAddressJSON, 'cnt', _.get(contractAddressJSON, 'cnt')+1)
        fs.writeFileSync('./sepoliaContractAddress.json', JSON.stringify(contractAddressJSON, null, 2), 'utf-8')
    } catch (error) {
        console.log(error)
    }

}

const getVk = (circuitName) => {
    try {
        return JSON.parse(
            fs.readFileSync('../crs/' + circuitName + '_crs_vk.json', 'utf-8')
        );
    } catch (error) {
        console.log(error)
        return undefined
    }
}

const getContractFormatVk = (circuitName) => {
    const vkJson = getVk(circuitName);
    let tmp = [];
    for (let i = 0; i < 2; i++) {
        tmp.push(hexToDec(vkJson['alpha'][i]))
    }

    // reversed
    for (let i = 0; i < 4; i++) {
        tmp.push(hexToDec(vkJson['beta'][Number.parseInt(i / 2)][(i + 1) % 2]))
    }

    // reversed
    for (let i = 0; i < 4; i++) {
        tmp.push(hexToDec(vkJson['delta'][Number.parseInt(i / 2)][(i + 1) % 2]))
    }

    // console.log("ABC len : ", vkJson['ABC'].length)
    for (let i = 0; i < vkJson['ABC'].length * 2; i++) {
        tmp.push(hexToDec(vkJson['ABC'][Number.parseInt(i / 2)][i % 2]))
    }
    const vk = tmp;
    console.log(circuitName, 'vk len : ', vk.length);
    return vk;
}

function hexToDec(hexStr) {
    if (hexStr.slice(0, 2) !== '0x') {
        return BigInt('0x' + hexStr).toString();
    }
    return BigInt(hexStr).toString();
}

deploySepolia();
