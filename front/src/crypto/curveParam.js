/* global BigInt */

const curveParam = {
    EC_TYPE: null,
    prime: null,
    g: null,
    coefA: null,
    coefB: null,
    primeLen : null,
    blockBytes : null,
};

export default function CurveParam(EC_TYPE) {
    if (curveParam.EC_TYPE !== EC_TYPE) {
        if (EC_TYPE === 'EC_ALT_BN128') {
            curveParam.prime = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
            curveParam.g = BigInt('10398164868948269691505217409040279103932722394566360325611713252123766059173');
            curveParam.coefA = BigInt('126932');
            curveParam.coefB = BigInt('1');
            curveParam.primeLen = curveParam.prime.toString(2).length;
            curveParam.blockBytes = parseInt(curveParam.primeLen / 8);
        } else if (EC_TYPE === 'EC_BLS12_381') {
            curveParam.prime = BigInt('52435875175126190479447740508185965837690552500527637822603658699938581184513');
            curveParam.g = BigInt('46937548361816886563847943541604243346921840144669283775907349952397536703416');
            curveParam.coefA = BigInt('29978822694968839326280996386011761570173833766074948509196803838190355340952');
            curveParam.coefB = BigInt('21732574493545642452588025716306585039145419364997213261322953924237652797223');
            curveParam.primeLen = curveParam.prime.toString(2).length;
            curveParam.blockBytes = parseInt(curveParam.primeLen / 8);
        }
    }
    return curveParam;
}