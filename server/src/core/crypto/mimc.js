/* global BigInt */
import types from '../utils/types.js';
import math from '../utils/math.js';
import {keccak256} from '@ethersproject/keccak256';
import {toUtf8Bytes} from '@ethersproject/strings';


const SEED = 'mimc7_seed';
const BN256_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

/**
 * 
 * @param {Array} data_bytes    bytes array
 * @returns {string}            hexadecimal string
 */
function _keccak256(data_bytes) {
    return keccak256(types.hexToBytes(data_bytes));
}

class MiMCBase{
    /**
     * 
     * @param {string} seed_str     MiMC's seed string
     * @param {BigInt} prime        modulo prime
     * @param {int} num_rounds      # of MiMC's round
     */
    constructor(seed_str = SEED, prime =BN256_FIELD_PRIME, num_rounds){
        this.seed = keccak256(toUtf8Bytes(seed_str));
        this.prime = prime;
        this.num_rounds = num_rounds;
        this.tmp =[];
    }

    /**
     * 
     * @param {BigInt}      msg     message 
     * @param {BigInt}      ek      key
     * @returns {BigInt}
     */
    encrypt(msg, ek) {
        var msg = math.mod(BigInt(msg),this.prime);
        var ek = math.mod(BigInt(ek), this.prime);
        let round_constant = this.seed;
        let result = this.mimc_round(msg, ek, BigInt(0));

        for(let i =0;i < this.num_rounds-1;i++){
            round_constant = _keccak256(round_constant);
            result = this.mimc_round(BigInt(result), BigInt(ek), types.hexToInt(round_constant));
        }
        return math.mod((result + ek) ,this.prime);
    }

    /**
     * 
     * @param {BigInt}      left        hash target message
     * @param {BigInt}      right       hash target message
     * @returns 
     */
    _hash(left, right)
    {
        let x = math.mod(left, this.prime);
        let y = math.mod(right,this.prime);
        return math.mod((this.encrypt(x,y) + x + y),this.prime);
    }

    /**
     * 
     * @param  {...string}     args        The target messages, its type is hexadecimal string
     * @returns {string}                   Hexadecimal string
     */
    hash(...args) {
        var args = types.hexListToIntList(args);
        if(args.length == 1)
            return BigInt(this._hash(args[0], args[0])).toString(16);
        else{
            let result = this._hash(args[0], args[1]);
            for(let i = 0;i<args.length-2;i++){
                result = this._hash(result, args[i+2]);
            }
            return BigInt(result).toString(16);
        }
    }

    // update tmp
    hashUpdate(arg){
        this.tmp.push(arg);
        return ;
    }
    hashGetOuptut(){
        if (this.tmp.length == 0){return -1;}
        var args = types.hexListToIntList(this.tmp);
        var ans;
        if(args.length == 1)
            ans = BigInt(this._hash(args[0], args[0])).toString(16);
        else{
            let result = this._hash(args[0], args[1]);
            for(let i = 0;i<args.length-2;i++){
                result = this._hash(result, args[i+2]);
            }
            ans = BigInt(result).toString(16);
        }
        this.tmp = [];
        return ans;
    }
}

class MiMC7 extends MiMCBase{
    constructor(seed_str, prime, num_rounds = 91){
        super(seed_str,prime, num_rounds);
    }

    mimc_round(msg, key, rc){
        let xored = math.mod((msg + key + rc),this.prime);
        return math.modPow(xored, BigInt(7), this.prime);
    }
}

class MiMC31 extends MiMCBase {
    constructor(seed_str, prime, num_rounds = 51){
        super(seed_str,prime, num_rounds);
    }

    mimc_round(msg, key, rc){
        let a = math.mod((msg + key + rc), this.prime);
        let a_2 = math.mod((a*a), this.prime);
        let a_4 = math.mod((a_2 * a_2), this.prime);
        let a_8 = math.mod((a_4 * a_4) , this.prime);
        let a_16 = math.mod((a_8 * a_8), this.prime);
        return math.mod((a_16 * a_8 * a_4 * a_2 * a),this.prime); 
    }
}

export default {MiMC7, MiMC31};