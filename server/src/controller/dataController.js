import { 
    getAllDataList, 
    getDataList,
    getUserInfo,
    getMyData,
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