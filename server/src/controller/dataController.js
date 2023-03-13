import _ from 'lodash'
import { 
    getAllDataList, 
    getDataList,
    getUserInfo,
    getMyData,
    getDataInfoFromHct,
    getUserKeysFromNickname
} from "../core/data/db.mysql.js";

import { getLoginTk } from "./registDataController.js";

export const getAlldataController = async (req, res) => {
    const metaData = await getAllDataList();
    res.send({
        data : metaData
    })
}


export const getDataController = async (req, res) => {
    const metaData = await getDataList(req.params.ind)
    console.log( metaData );
    res.send({
        data : metaData
    })
}


export const getMyDataController = async (req, res) => {
    const loginTk  = getLoginTk(req);
    const usrInfo = await getUserInfo(loginTk);

    const myData = await getMyData(usrInfo['nickname']);
    res.send({
        data:myData
    });
}

export const getInfoFromHct = async (req, res) => {
    const h_ct = req.params.h_ct;
    const dataInfo = (await getDataInfoFromHct(h_ct))[0];
    const usrInfo = await getUserKeysFromNickname(_.get(dataInfo, 'owner_nickname'));
    
    // console.log('getInfoFromHct',dataInfo);
    // console.log('user Info : ', usrInfo)
    console.log(_.merge(dataInfo, usrInfo))
    res.send(_.merge(dataInfo, usrInfo))
}