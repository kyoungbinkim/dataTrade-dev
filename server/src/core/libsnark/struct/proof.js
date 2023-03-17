export default class Proof {
    constructor(a,b,c){
        this.a = a;
        this.b = b;
        this.c = c;
    }

    toJson() { return JSON.stringify(this, null,2); }

    static fromJson(proofJson){
        let dataJson = JSON.parse(proofJson);
        return new Proof(
            dataJson.a,
            dataJson.b,
            dataJson.c
        );
    }

    static fromLibsnark(rawProof){
        let proofObj = JSON.parse(rawProof);
        
        proofObj.b = [
            proofObj.b[0].reverse(),
            proofObj.b[1].reverse()
        ];

        return new Proof(
            proofObj.a,
            proofObj.b,
            proofObj.c
        );
    }
}