/* global BigInt */
import Config from './config.js';
import CurveParam from '../crypto/curveParam.js';


function legendreSymbol(a, p) {
    let ls = modPow(a, (p - BigInt('1')) / BigInt('2'), p);

    if (ls === p - BigInt('1'))
        return BigInt('-1');
    else
        return ls;
}

export function modularSqrt(a, p) {
    const zero = BigInt('0');
    const one = BigInt('1');
    const two = BigInt('2');
    if (legendreSymbol(a, p) !== one) {
        return zero;
    }

    else if (a === zero) {
        return zero;
    }

    else if (p === two) {
        return zero;
    }

    else if (p % BigInt('4') === BigInt('3')) {
        return modPow(a, (p + one) / BigInt('4'), p);
    }

    let s = p - one;
    let e = zero;
    while (s % two === zero) {
        s /= two;
        e += one;
    }
    let n = two;
    while (legendreSymbol(n, p) !== BigInt(-1)) {
        n += one;
    }

    let x = modPow(a, (s + one) / two, p);
    let b = modPow(a, s, p);
    let g = modPow(n, s, p);
    let r = e;

    while (true) {
        let t = b;
        let m = zero;
        for (; m < r; m += one) {
            if (t === one) {
                break;
            }
            t = modPow(t, two, p);

        }
        if (m === zero) {
            return x;
        }
        let exp = modPow(two, r - m - one, p);
        let gs = modPow(g, exp, p);
        g = (gs * gs) % p;
        x = (x * gs) % p;
        b = (b * g) % p;
        r = m;
    }
}

export function modInv(a, n) {
    const egcd = eGcd(toZn(a, n), n);
    if (egcd.g !== BigInt('1')) {
        throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`); // modular inverse does not exist
    } else {
        return toZn(egcd.x, n);
    }
}

export function modPow(b, e, n) {
    if (typeof b === 'number') b = BigInt(b);
    if (typeof e === 'number') e = BigInt(e);
    if (typeof n === 'number') n = BigInt(n);

    if (n <= BigInt(0)) {
        throw new RangeError('n must be > 0');
    } else if (n === BigInt('1')) {
        return BigInt('0');
    }

    b = toZn(b, n);

    if (e < BigInt('0')) {
        return modInv(modPow(b, abs(e), n), n);
    }

    let r = BigInt(1);
    while (e > BigInt(0)) {
        if (e % BigInt('2') === BigInt('1')) {
            r = r * b % n;
        }
        e = e / BigInt(2);
        b = b * b % n;
    }
    return r;
}

export function mod(value, mod) {
    if (value <= BigInt('0')) {
        return ((value % mod) + mod) % mod;
    }
    else {
        return value % mod;
    }
}

function toZn(a, n) {
    if (n <= 0) {
        throw new RangeError('n must be > 0');
    }

    const aZn = a % n;
    return (aZn < 0) ? aZn + n : aZn;
}

function eGcd(a, b) {
    if (a <= 0 || b <= 0) throw new RangeError('a and b MUST be > 0'); // a and b MUST be positive

    let x = BigInt('0');
    let y = BigInt('1');
    let u = BigInt('1');
    let v = BigInt('0');

    while (a !== BigInt('0')) {
        const q = b / a;
        const r = b % a;
        const m = x - (u * q);
        const n = y - (v * q);
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }
    return {
        g: b,
        x: x,
        y: y
    };
}

function abs(a) {
    return (a >= 0) ? a : -a;
}

export function randomFieldElement( prime = CurveParam(Config.EC_TYPE).prime ) {
    let bitLength = parseInt(prime.toString(2).length);
    // let randomHex = crypto.randomBytes(bitLength).toString('hex');
    let randomBase = BigInt(0);
    let ten2i = 10;
    for(let i=1; i<=bitLength; i++){
        randomBase += BigInt(Math.ceil(Math.random() * ten2i));
        ten2i = ten2i * 10;
    }
    let randomHex = randomBase.toString(16);
    const random = BigInt('0x' + randomHex);
    return math.mod(random, prime);
}

const math = {
    modularSqrt,
    modPow,
    modInv,
    mod,
    randomFieldElement
};

export default math;