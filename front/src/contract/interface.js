import { ethers } from "ethers";

const provider  = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545')
const signer    = provider.getSigner(1);
let contractInstance = undefined;

export function setContractInstance(addr, abi){
    contractInstance = new ethers.Contract(addr, abi, provider);
}

export function getContractInstance(){
    return contractInstance;
}

export function getSinger(addr){
    return provider.getSigner(addr);
}

export async function getBalance(addr){
    const balance = await provider.getBalance(addr);
    return balance;
}

export async function getAllBalance(){
    const accounts = await getAccounts();
    let balanceList = [];
    for(let i=0; i<accounts.length ;i++){
        balanceList.push(await getBalance(accounts[i]));
    }
    return balanceList;
}

export async function getAccounts(){
    const accounts = await provider.listAccounts();
    return accounts;
}

export default getContractInstance;