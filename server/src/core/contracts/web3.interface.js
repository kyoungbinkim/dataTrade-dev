import Web3 from 'web3';
// import Constants from '../constants';
import types, { addPrefixHex } from '../utils/types'
import _ from 'lodash';

export default class Web3Interface extends Web3 {
    /**
     * @param {String} endpoint address of endpoint
     */
    constructor(endpoint) {
        super(endpoint);
    }

    /**
     * @param {string} contractAddress
     * @param {string} signature        Method definition (ex. 'transferFrom(address,address,uint256)' )
     * @return {Promise<boolean>}
     */
    async hasMethod(contractAddress, signature) {
        const code = await this.eth.getCode(contractAddress);
        const functionSignature = this.eth.abi.encodeFunctionSignature(signature);
        // remove "0x" prefixed in 0x<4bytes-selector>
        return code.indexOf(functionSignature.slice(2, functionSignature.length)) > 0;
    }

    /**
     *
     * @param {Object} call The transaction object: call/send/estimateGas/encodeABI.
     * @param {String} senderEthAddr The address the transaction should be sent from.
     * @param {String} senderEthPrivateKey (Optional) The private key to sign with.
     * @param {Number} gas (Optional) The gas provided by transaction.
     * @param {String} value (Optional) The value of the transaction in wei.
     * @returns {Promise<TransactionReceipt>} A promise combined event emitter. Resolves when the transaction receipt is available.
     */
    async sendContractCall(
        call,
        senderEthAddr,
        senderEthPrivateKey,
        gas = Constants.DEFAULT_GAS_VALUE,
        value,
    ) {
        /*
        Broadcast a transaction for a contract call, handling the difference
        between hosted keys(senderEthPrivateKey is None) and local keys
        (senderEthPrivateKey is not None).Returns the hash of the broadcast
        transaction.
        */
        let txDescription = {
            from: senderEthAddr,
            gas: gas,
        };
        if (value !== undefined) {
            txDescription['value'] = value;
        }
        if (senderEthPrivateKey !== undefined) {
            const encodedABI = call.encodeABI();
            const txCount = await this.eth.getTransactionCount(senderEthAddr, 'pending');
            const chainId = await this.eth.getChainId();
            const rawTx = {
                ...txDescription,
                data: encodedABI,
                nonce: addPrefixHex(txCount.toString(16)),
                to: call._parent._address,
                common: {
                    customChain: {
                        networkId: chainId,
                        chainId: chainId,
                    },
                },
            };

            const signedTx = await this.eth.accounts.signTransaction(rawTx, senderEthPrivateKey);

            return this.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', function (txHash) {
                    console.log('txHash:', txHash);
                })
                .on('receipt', function (receipt) {
                    console.log('gasUsed:', receipt.gasUsed);
                });
        } else {
            return call.send(txDescription);
        }
    }

    /**
     *
     * @param {Object} call The transaction object
     * @returns {Promise<any>} Promise returns Mixed: The return value(s) of the smart contract method
     */
    localContractCall(call) {
        return call.call();
    }

    /**
     *
     * @param {string} senderEthAddr The sender's address
     * @param {string} receiverEthAddr The receiver's address
     * @param {string} value The value (.ether)
     * @param {String} senderEthPrivateKey (Optional) The private key to sign with.
     * @param {Number} gas (Optional) The gas provided by transaction.
     * @returns { Promise<TransactionReceipt>} A promise combined event emitter. Resolves when the transaction receipt is available.
     */
    async sendTransaction(
        senderEthAddr,
        receiverEthAddr,
        value,
        senderEthPrivateKey,
        gas = Constants.DEFAULT_GAS_VALUE,
    ) {
        try {
            let txDescription = {
                from: senderEthAddr,
                to: receiverEthAddr,
                value: value,
                gas: gas,
            };
            if (senderEthPrivateKey !== undefined) {
                const txCount = await this.eth.getTransactionCount(senderEthAddr, 'pending');
                const chainId = await this.eth.getChainId();
                const rawTx = {
                    ...txDescription,
                    nonce: addPrefixHex(txCount.toString(16)),
                    common: {
                        customChain: {
                            networkId: chainId,
                            chainId: chainId,
                        },
                    },
                };

                const signedTx = await this.eth.accounts.signTransaction(rawTx, senderEthPrivateKey);

                return this.eth.sendSignedTransaction(signedTx.rawTransaction)
                    .on('transactionHash', function (txHash) {
                        console.log('txHash:', txHash);
                    })
                    .on('receipt', function (receipt) {
                        console.log('gasUsed:', receipt.gasUsed);
                    });
            } else {
                return this.eth.sendTransaction(txDescription);
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     *
     * @param {string} from     sender's address
     * @param {string} to       receiver's address
     * @param {string|number|BigInt} amount
     * @param {string} privateKey not required in test context
     * @param {number} gas
     * @return {Promise<TransactionReceipt|undefined>}
     */
    async transfer(
        from,
        to,
        amount,
        privateKey,
        gas = Constants.DEFAULT_LEGACY_TRANSFER_GAS,
    ) {
        return this.sendTransaction(
            from,
            to,
            this.utils.toWei(amount),
            privateKey,
            gas,
        );
    }

    /**
     *
     * @param {string} deployer deployer's address
     * @param {string} bytecode contract bytecode
     * @param {any} args        contract arguments
     * @param {any} abi
     * @returns {Promise<string>}   deployed Address
     */
    async deploy(deployer, bytecode, args, abi) {
        let deployedAddress;
        const instantiate = new this.eth.Contract(abi);

        await instantiate
            .deploy({
                data: bytecode,
                arguments: args,
            })
            .send({
                from: deployer,
                gas: Constants.DEFAULT_DEPLOY_GAS,
            })
            .on('receipt', function (receipt) {
                console.log('deployed:', receipt.contractAddress);
                console.log('gasUsed:', receipt.gasUsed);
                deployedAddress = receipt.contractAddress;
            });
        return deployedAddress;
    }

    /**
     *
     * @param {string}      address     EOA address 20byte
     * @returns {boolean}
     */
    static isValidAddress(address) {
        if (!types.isBigIntFormat(address)) {
            return false;
        }
        if (address.substring(0, 2) !== '0x') {
            address = types.addPrefixAndPadHex(address, 20);
        }
        if (!this.utils.isAddress(address)) {
            return false;
        }
        const checkSumAddr = this.utils.toChecksumAddress(address);
        return this.utils.checkAddressChecksum(checkSumAddr);
    }

    /**
     *
     * @param {string}     privateKey     The private key of 'address' 32byte
     * @returns {Promise<boolean>}
     */
    async isValidPrivateKey(privateKey) {
        if (!types.isBigIntFormat(privateKey)) {
            return false;
        }
        if (privateKey.substring(0, 2) !== '0x') {
            privateKey = types.addPrefixAndPadHex(privateKey, 32);
        }
        if (privateKey.length !== 66) {
            return false;
        }
        const data = await this.eth.accounts.privateKeyToAccount(privateKey);
        return !_.isNil(data);
    }

    /**
     *
     * @param {string|number} blockHashOrBlockNumber block hash or block number
     * @param {string} locale specify the language
     * @returns {Promise<string>} block generation time
     */
    async getBlockDateTime(blockHashOrBlockNumber, locale){

        const block = (await this.eth.getBlock(blockHashOrBlockNumber));
        const timeStamp = block.timestamp * 1000;
        const date = new Intl.DateTimeFormat(locale, {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }).format(timeStamp);
        return date;
    }
}
