var fs = require('fs');
var path = require('path');
var process = require('process');



describe('', () => {

    function hexToDex(hexStr){
        if(hexStr.slice(0,2) !== '0x'){
            return BigInt('0x' + hexStr).toString();
        }
        return BigInt(hexStr).toString();
    }

    const vkPath = process.cwd()
    const vkJson = JSON.parse(fs.readFileSync(vkPath+'/RegistData_crs_vk.json'));


    it('Json test', () => {
        console.log(vkPath)
        
        let tmp = [];
        for (let i = 0; i < 2; i++) {
            tmp.push(vkJson['alpha'][i])
        }
        for(let i=0; i<4; i++){
            tmp.push(vkJson['beta'][Number.parseInt(i/2)][i%2])
        }
        for(let i=0; i<4; i++){
            tmp.push(vkJson['delta'][Number.parseInt(i/2)][i%2])
        }

        console.log("ABC len : ",vkJson['ABC'].length)
        for(let i=0; i<vkJson['ABC'].length; i++){
            tmp.push(vkJson['ABC'][Number.parseInt(i/2)][i%2])
        }
        const vk = tmp;
        console.log(vk, vk.length);

    })

    it('zklay vk test', ()=>{
        const zklayVk = JSON.parse(
            fs.readFileSync('/Users/kim/workspace/nodejs-web3/zklay_contracts/test/ZKlay_crs_vk.json')
        );
        console.log(zklayVk.ABC.length)

        // console.log(hexToDex(zklayVk.ABC[0][0]).reverse())
        console.log(zklayVk.ABC[0].reverse(), typeof zklayVk.ABC[0][0] )
    })
})