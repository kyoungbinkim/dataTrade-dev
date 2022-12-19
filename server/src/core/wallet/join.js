import Config from "../utils/config.js";
import fs from 'fs';

export const userDBpath = '/Users/kim/dataTrade-dev/server/db/usrDB.json';

// True : DB에 존재하지 않는다
export function idDuplicateCheck(Id){
    const DB = JSON.parse( fs.readFileSync(userDBpath, 'utf-8') );
    return (DB[Id] === undefined);
}

export function idLengthCheck(id){
    return !(id.length > Config.maxIdLen);
}

export function writeDB(Id, PassWordToken){
    if(!idDuplicateCheck(Id)){
        console.log("already exist Id");
        return false;
    }
    const DB = JSON.parse(fs.readFileSync(userDBpath, 'utf-8'));
    DB[Id] = {"pw" : PassWordToken, h_ct:[]};
    console.log(JSON.stringify(DB));
    fs.writeFile(userDBpath, JSON.stringify(DB), err => {
        if (err) {
          console.error(err);
        }
    });
    return true
}

const JoinHelper = {
    userDBpath,
    idDuplicateCheck,
    idLengthCheck,
    writeDB,
}
export default JoinHelper;