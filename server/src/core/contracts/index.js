import _ from 'lodash';
import contract from "./contract.js";
import Config from "../utils/config.js";
import { spawn } from "child_process";

let tradeContract = undefined

export const initTradeContract = () => {
    const contractAddr      = _.get(Config, 'contractAddress')
    const testProvider    = _.get(Config, 'testProvider')

    tradeContract = new contract(testProvider, contractAddr)
}

export const getTradeContract = () => {
    return tradeContract
}

export default tradeContract