/* global BigInt */

import bluebird from 'bluebird';

var Config = {
    homePath        : '/Users/kim/dataTrade-dev-backup/server/',
    
    dataBlockNum    : '530',
    dataMaxBlockNum : '530',
    maxIdLen        : 32,

    serializeFormat : 3,
    EC_TYPE         : 'EC_ALT_BN128',
    R1CS_GG         : 1,
    R1CS_ROM_SE     : 2,

    EC_ALT_BN128    : 1,
    EC_BLS12_381    : 2,

    networkId       : '1234',

    testProvider    : 'http://127.0.0.1:7545', // ganache link
    testwsProvider  : 'http://127.0.0.1:7545',

    keys            : {
        sk_enc          : undefined,
        pk_enc          : undefined,
        sk_own          : undefined,
        pk_own          : undefined,
        addr            : undefined
    }
    
}

export const mysqlConfig = {
    host    : 'localhost',
    user    : 'dataTradeServer',
    password: 'Itsp7501`',
    database: 'trade_db',
    Promise : bluebird,
};



export let fileStorePath            = Config.homePath + `db/`;
export let ganacheAccountKeyPath    = Config.homePath + `../tradeContract/keys.json`;
export let contractsBuildPath       = Config.homePath + `../tradeContract/build/contracts/`
export let proofStorePath           = ``
// export let snarkPath                = Config.homePath + 'src/core/libsnark/js-libsnark-opt/libsnark/'
export let snarkPath                = fileStorePath
export let crsPath                  = Config.homePath + '../crs/'

export function initConfig(){
    fileStorePath               = Config.homePath + `db/`
    ganacheAccountKeyPath       = Config.homePath + `../tradeContract/keys.json`
    contractsBuildPath          = Config.homePath + `../tradeContract/build/contracts/`
    snarkPath                = fileStorePath
    crsPath                  = Config.homePath + '../crs/'
}


export default Config;