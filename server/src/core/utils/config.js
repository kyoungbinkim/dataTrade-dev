/* global BigInt */

var Config = {
    EC_TYPE : 'EC_ALT_BN128',
    dataBlockNum : '530',
    dataMaxBlockNum : '530',
    R1CS_GG       : 1,
    R1CS_ROM_SE : 2,

    EC_ALT_BN128  : 1,
    EC_BLS12_381  : 2
}

export const mysqlConfig = {
    host    : "localhost",
    user    : "dataTradeServer",
    password: `itsp7501`,
    database: `dataTradeDB`,
};

export const fileStorePath = `/Users/kim/dataTrade-dev/server/db/`;

export default Config;