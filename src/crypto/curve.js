import math from '../utils/math.js';
// import Config from 'react-native-config';
import Config from '../utils/config.js';
import CurveParam from './curveParam.js';
/* global BigInt */

BigInt.prototype.mod = function(n){
    return ((this % n) + n)%n;
};

class AffinePoint{
    constructor(x , y ){
        this.x = BigInt(x);
        this.y = BigInt(y);
    }

    show() {
        return '(' + this.x.toString(16) + ' , ' + this.y.toString(16) + ')';
    }
}

class MontgomeryCurve{
    constructor(CurveParam){
        this.prime = CurveParam.prime;
        this.g = CurveParam.g;
        this.coefA = CurveParam.coefA;
        this.coefB = CurveParam.coefB;
    }

    preprocess(p, exp){
        let preTable = [p];

        for(let i =0;i<exp.toString(2).length; i+= 1){
            let baseP = preTable[preTable.length-1];
            preTable.push(this.doubleAffinePoint(baseP));
        }

        return preTable;
    }

    mul(preTable, exp) {
        let expBit = exp.toString(2).split('').reverse().join('');
        let result = preTable[preTable.length -1];

        for(const [i, value] of preTable.entries()){
            if(expBit[i] === '1'){
                result = this.addAffinePoint(result, value);
            }
        }
        result = this.subAffinePoint(result, preTable[preTable.length -1]);

        return result;
    }

    preprocessBasePoint(p){
        let newX = math.mod(p.x, this.prime);
        let newY = math.mod(p.y, this.prime);

        return new AffinePoint(newX, newY);
    }

    doubleAffinePoint(p) {
        let tmpX = math.mod(BigInt('3') * p.x *p.x + BigInt('2')*p.x*this.coefA + BigInt('1'),this.prime);
        let l1 = this.fieldDivision(tmpX, p.y * BigInt('2') * this.coefB);
        let b_l2 = math.mod(l1 * l1 * this.coefB, this.prime);
        let tmp1 = b_l2 - this.coefA; // The wired bug exists, to be fixed it later (line 84 ~ 86)
        let tmp2 = BigInt('2') * p.x;
        let tmp3 = tmp1 - tmp2;
        let newX =  math.mod(tmp3, this.prime);
        let newY = math.mod(((p.x * BigInt('3') + this.coefA - b_l2) * l1 - p.y),this.prime);

        return new AffinePoint(newX, newY);
    }

    addAffinePoint(p1, p2){
        let diffY = math.mod((p1.y - p2.y) ,this.prime);
        let diffX = math.mod((p1.x - p2.x) ,this.prime);
        let q = this.fieldDivision(diffY, diffX);
        let b_q2 = math.mod(((q * q) * this.coefB) , this.prime);
        let newX = math.mod((b_q2 - this.coefA - p1.x - p2.x) , this.prime);
        let newY = math.mod((q * (p1.x - newX) - p1.y) , this.prime);

        return new AffinePoint(newX, newY);
    }

    subAffinePoint(p1, p2){
        let negP2 = new AffinePoint(p2.x, math.mod((-p2.y),this.prime));

        return this.addAffinePoint(p1, negP2);
    }

    fieldDivision(a, b) {
        return math.mod((a * math.modInv(b, this.prime)),this.prime);
    }

    checkScalar(value){
        return value.toString(2).length <= this.prime.toString(2).length;
    }

    computeYCoord(x) {
        let squared = math.mod(((x*x*x) + this.coefA * (x*x)+ x), this.prime);
        let ySquared = this.fieldDivision(squared, this.coefB);
        let y = math.modularSqrt(ySquared, this.prime);
        return y;
    }

    checkPointOnCurve(p) {
        let lhs = math.mod((math.modPow(p.y, BigInt('2'), this.prime) * this.coefB), this.prime);
        let rhs = math.mod((math.modPow(p.x , BigInt('3'), this.prime) + this.coefA * math.modPow(p.x, BigInt('2'), this.prime) + p.x), this.prime);
        console.assert(lhs === rhs, 'lsh != rhs');
    }

    computeScalarMul(p, exp) {
        let bp = this.preprocessBasePoint(p);
        this.checkPointOnCurve(bp);
        let preTable = this.preprocess(bp, exp);
        let output = this.mul(preTable, exp);
        return output;
    }
}


/**
 *
 * @param {BigInt}      baseX       base point's 'x' coord
 * @param {BigInt}      exp         expo value
 * @returns {BigInt}                computed point's 'x' coord
 */
export function multscalar(baseX, exp, curveOption){
    let cvParam = curveOption !== undefined ? CurveParam(curveOption) : CurveParam(Config.EC_TYPE);
    let curve = new MontgomeryCurve(cvParam);
    let baseY = curve.computeYCoord(baseX);
    let bp = new AffinePoint(baseX, baseY);
    curve.checkPointOnCurve(bp);
    let result = curve.computeScalarMul(bp, exp);
    curve.checkPointOnCurve(result);

    return result.x;
}

/**
 *
 * @param {BigInt}      exp         expo value
 * @returns {BigInt}                computed point's 'x' coord
 */
export function basePointMul(exp, curveOption){
    let cvParam = curveOption !== undefined ? CurveParam(curveOption) : CurveParam(Config.EC_TYPE);
    let curve = new MontgomeryCurve(cvParam);
    let baseY = curve.computeYCoord(curve.g);
    let bp = new AffinePoint(curve.g, baseY);
    curve.checkPointOnCurve(bp);
    let result = curve.computeScalarMul(bp, exp);
    curve.checkPointOnCurve(result);
    return result.x;
}

const Curve = {
    AffinePoint,
    MontgomeryCurve,
    multscalar,
    basePointMul
};

export default Curve;