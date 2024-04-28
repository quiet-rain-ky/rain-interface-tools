import Rbj from "./src/interfaceButtJoint.js";
import UniRbjTwo from "./src/uniRbjVueTwo.js";
import UniRbjThere from "./src/uniRbjVueThere.js";
import logObj from "./src/logs.js";
import StreamConversion from "./src/streamConversion.js";
import assistFun from "./src/assist.js";

// 用户配置融合函数
function importsConfigObj(requestObj) {
    var requests = {};
    if (!Array.isArray(requestObj) && typeof requestObj == "object") requestObj = [requestObj];
    for (const key in requestObj) {
        if (requestObj[key].default && requestObj[key].default.interfaceList) {
            for (const i in requestObj[key].default.interfaceList) {
                if (requestObj[key].default.moduleUrl && typeof requestObj[key].default.interfaceList[i] != "string" && !requestObj[key].default.isJointModuleUrl) requestObj[key].default.interfaceList[i].url = requestObj[key].default.moduleUrl + requestObj[key].default.interfaceList[i].url;
                requests[i] = requestObj[key].default.interfaceList[i];
            }
            if (!requestObj[key].default.isJointModuleUrl) requestObj[key].default.isJointModuleUrl = true;
        } else if (requestObj[key].interfaceList) {
            for (const i in requestObj[key].interfaceList) {
                if (requestObj[key].moduleUrl && typeof requestObj[key].interfaceList[i] != "string" && !requestObj[key].isJointModuleUrl) requestObj[key].interfaceList[i].url = requestObj[key].moduleUrl + requestObj[key].interfaceList[i].url;
                requests[i] = requestObj[key].interfaceList[i];
            }
            if (!requestObj[key].isJointModuleUrl) requestObj[key].isJointModuleUrl = true;
        } else if (requestObj[key].default) {
            for (const i in requestObj[key].default) {
                requests[i] = requestObj[key].default[i];
            }
        } else if (requestObj[key]) {
            for (const i in requestObj[key]) {
                requests[i] = requestObj[key][i];
            }
        } else {
            if (requestObj[key].moduleName) {
                logObj.ERROR(requestObj[key].moduleName, " --- 接口融合失败, 没有找到 interfaceList 接口列表");
            } else {
                logObj.ERROR("接口融合失败, 请检查你的接口配置文件中, 接口配置对象的格式是否正确");
            }
        }
    }
    return requests;
}

export { Rbj, UniRbjTwo, UniRbjThere, importsConfigObj, logObj, StreamConversion, assistFun };
