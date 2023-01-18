var fs = require('fs');

function hexToDex(hexStr){
  if(hexStr.slice(0,2) !== '0x'){
      return BigInt('0x' + hexStr).toString();
  }
  return BigInt(hexStr).toString();
}

const Groth16AltBN128Lib = artifacts.require('Groth16AltBN128');
const Groth16AltBN128Test = artifacts.require('Groth16AltBN128Test');
const RegistDataContract  = artifacts.require('RegistDataContract');
const DataTradeBase       = artifacts.require('DataTradeContract');

const vkJson = JSON.parse(fs.readFileSync(process.cwd()+'/../test/RegistData_crs_vk.json'));

let tmp = [];
for (let i = 0; i < 2; i++) {
  tmp.push(hexToDex(vkJson['alpha'][i]))
}

// reversed
for (let i = 0; i < 4; i++) {
  tmp.push(hexToDex(vkJson['beta'][Number.parseInt(i / 2)][(i+1) % 2]))
}

// reversed
for (let i = 0; i < 4; i++) {
  tmp.push(hexToDex(vkJson['delta'][Number.parseInt(i / 2)][(i+1) % 2]))
}

// console.log("ABC len : ", vkJson['ABC'].length)
for (let i = 0; i < vkJson['ABC'].length*2; i++) {
  tmp.push(hexToDex(vkJson['ABC'][Number.parseInt(i / 2)][i % 2]))
}
const vk = tmp;
console.log(vk, vk.length);

module.exports = function (deployer) {
  deployer.deploy(Groth16AltBN128Lib);
  deployer.link(Groth16AltBN128Lib, Groth16AltBN128Test);
  deployer.link(Groth16AltBN128Lib, RegistDataContract);
  deployer.link(Groth16AltBN128Lib, DataTradeBase);
  
  deployer.deploy(
    RegistDataContract,
    vk
  );

  deployer.deploy(
    DataTradeBase, 
    vk
  );
};

