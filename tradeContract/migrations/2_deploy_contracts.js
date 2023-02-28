// var fs = require('fs');

// function hexToDex(hexStr){
//   if(hexStr.slice(0,2) !== '0x'){
//       return BigInt('0x' + hexStr).toString();
//   }
//   return BigInt(hexStr).toString();
// }

// const Groth16AltBN128Lib = artifacts.require('Groth16AltBN128');
// const Groth16AltBN128Test = artifacts.require('Groth16AltBN128Test');

// const vkJson = JSON.parse(fs.readFileSync('../test/RegistData_crs_vk.json'));

// let tmp = [];
// for (let i = 0; i < 2; i++) {
//   tmp.push(hexToDex(vkJson['alpha'][i]))
// }

// // reversed
// for (let i = 0; i < 4; i++) {
//   tmp.push(hexToDex(vkJson['beta'][Number.parseInt(i / 2)][(i+1) % 2]))
// }

// // reversed
// for (let i = 0; i < 4; i++) {
//   tmp.push(hexToDex(vkJson['delta'][Number.parseInt(i / 2)][(i+1) % 2]))
// }

// console.log("ABC len : ", vkJson['ABC'].length)
// for (let i = 0; i < vkJson['ABC'].length*2; i++) {
//   tmp.push(hexToDex(vkJson['ABC'][Number.parseInt(i / 2)][i % 2]))
// }
// const vk = tmp;
// console.log(vk, vk.length);

// module.exports = function (deployer) {
//   deployer.deploy(Groth16AltBN128Lib);
//   deployer.link(Groth16AltBN128Lib, Groth16AltBN128Test);
//   deployer.deploy(
//     Groth16AltBN128Test,
//     vk
//   );
// };

var fs = require('fs');

function hexToDex(hexStr){
  if(hexStr.slice(0,2) !== '0x'){
      return BigInt('0x' + hexStr).toString();
  }
  return BigInt(hexStr).toString();
}

const Groth16AltBN128Lib = artifacts.require('Groth16AltBN128');
const TradeDataContract = artifacts.require('TradeDataContract');
const MiMC7 = artifacts.require('MiMC7');

const vkJson = JSON.parse(fs.readFileSync('../test/RegistData_crs_vk.json'));

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

console.log("ABC len : ", vkJson['ABC'].length)
for (let i = 0; i < vkJson['ABC'].length*2; i++) {
  tmp.push(hexToDex(vkJson['ABC'][Number.parseInt(i / 2)][i % 2]))
}
const vk1 = tmp;
const vk2 = tmp;
const vk3 = tmp;

const merkleDepth = 8;
const merkleHash_type = 1; //mimc

module.exports = function (deployer) {
  //
  deployer.deploy(Groth16AltBN128Lib);
  deployer.link(Groth16AltBN128Lib, TradeDataContract);
  deployer.deploy(MiMC7);
  deployer.link(MiMC7, TradeDataContract);
  deployer.deploy(
    TradeDataContract,
    vk1,
    vk2,
    vk3,
    merkleDepth,
    merkleHash_type
  );
};


