/* global BigInt */

var Config = {
    
    dataBlockNum    : '530',
    dataMaxBlockNum : '530',
    maxIdLen        : 32,

    EC_TYPE         : 'EC_ALT_BN128',
    R1CS_GG         : 1,
    R1CS_ROM_SE     : 2,

    EC_ALT_BN128    : 1,
    EC_BLS12_381    : 2
}

export const mysqlConfig = {
    host    : 'localhost',
    user    : 'dataTradeServer',
    password: 'Itsp7501`',
    database: 'trade_db',
};

export const fileStorePath = `/Users/kim/dataTrade-dev/server/db/`;
export const proofStorePath = ``

export default Config;