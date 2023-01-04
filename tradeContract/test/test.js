var fs = require('fs');
var Web3 = require('web3');
var path = require('path');
var process = require('process');

// deploy gas used : 1041360 (0xfe3d0)

describe('', () => {

    function hexToDex(hexStr) {
        if (hexStr.slice(0, 2) !== '0x') {
            return BigInt('0x' + hexStr).toString();
        }
        return BigInt(hexStr).toString();
    }

    function proofFlat(proofJson) {
        let tmp = []
        for (let i = 0; i < 2; i++) {
            tmp.push(hexToDex(proofJson['a'][i]));
        }
        for (let i = 0; i < 4; i++) {
            tmp.push(hexToDex(proofJson['b'][Number.parseInt(i / 2)][(i + 1) % 2]));
        }
        for (let i = 0; i < 2; i++) {
            tmp.push(hexToDex(proofJson['c'][i]));
        }
        return tmp;
    }

    const vkJson = JSON.parse(fs.readFileSync(process.cwd() + '/RegistData_crs_vk.json'));
    const proofJson = JSON.parse(fs.readFileSync(process.cwd() + '/RegistData_proof.json'));
    const inputJson = JSON.parse(fs.readFileSync(process.cwd() + '/RegistData_sampleInput.json'));


    // you fix contract Address
    let contractAddr = '0x9F208F3BacFC4F85cA02391dbF1c01273C2E0521';
    const web3 = new Web3('http://127.0.0.1:7545');
    const contractJson = JSON.parse(fs.readFileSync(process.cwd() + '/../build/contracts/RegistDataContract.json', 'utf-8'));
    const contractIns = new web3.eth.Contract(contractJson.abi, contractAddr);

    let tmp = ['1']
    tmp.push(hexToDex(inputJson['RegistData'][0]['pk_own']));
    tmp.push(hexToDex(inputJson['RegistData'][0]['h_k']));
    tmp.push(hexToDex(inputJson['RegistData'][0]['h_ct']));
    tmp.push(hexToDex(inputJson['RegistData'][0]['id_data']));
    const contractInput = tmp;
    console.log('Input : ', contractInput);

    it('gas Estimate', () => {
        web3.eth.getAccounts((err, accounts) => {
            if (err) {
                console.log(err);
                return;
            }
            contractIns.methods.registData(
                    proofFlat(proofJson),
                    contractInput
                ).estimateGas({
                    from: `${accounts[1]}`
                })
                .then((gasAmount) => {
                    console.log("gasAmount : ", gasAmount);
                })
                .catch((error) => {
                    console.log('gas Estimate', error);
                });
        })
    })

    it('registData', () => {

        web3.eth.getAccounts((err, accounts) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(accounts);

            contractIns.methods.registData(
                proofFlat(proofJson),
                contractInput
            ).send(
                {
                    from: `${accounts[0]}`,
                    gas: `27604`,
                    gasPrice: `0x1`
                },
                (err, ret) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('registData result : ', ret);
                }
            )
        })


    }).timeout(10000);

    it('send ', async ()=>{

        const accounts = await web3.eth.getAccounts();

        const receipt = await contractIns.methods.registData(
            proofFlat(proofJson),
            contractInput
        ).send(
            {
                from: `${accounts[9]}`,
                gas: `27604`,
                gasPrice: `0x1`
            }
        )
        console.log(receipt)
    })


    it('register check', () => {

        web3.eth.getAccounts((err, accounts) => {
            if (err) {
                console.log(err);
                return;
            }

            contractIns.methods.isRegistered(
                hexToDex(inputJson['RegistData'][0]['h_ct'])
            ).call({
                    from: `${accounts[1]}`
                },
                (err, ret) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('registData result : ', ret);
                }
            )
        })

    }).timeout(10000);
})