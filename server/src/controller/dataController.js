import { 
    getAllDataList, 
    getDataList,
    getUserInfo,
    getMyData,
    getDataInfoFromHct
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
    const info = await getDataInfoFromHct(h_ct);
    res.send({
        info : info
    })
}