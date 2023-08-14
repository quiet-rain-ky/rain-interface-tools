/**
 * @author   作者: Rain
 * @date 创建于 2021年 11月02日  00:50:41  星期二
 * @file_path  文件磁盘路径: D:\Files\repositorys\rain-interface-tools\src\interfaceButtJoint.js
 * @file_path  文件项目路径: src\interfaceButtJoint.js
 * @description 系统接口对接工具类
 */
import rain_logs from "./logs.js";
import StreamConversion from "./streamConversion.js";
import assistFun from "./assist.js";
import axios from "axios";
// #ifndef APP-NVUE
import qs from "qs";
// #endif
import packages from "../package.json";

/**
 * 获取全局对象
 */
function getGlobalFun() {
    if (typeof global !== "undefined") {
        return global;
    } else if (typeof window !== "undefined") {
        return window;
    } else if (typeof self !== "undefined") {
        return self;
    } else if (typeof this !== "undefined") {
        return this;
    } else {
        throw new Error("无法识别全局对象！");
    }
}

// 系统接口对接工具类
export default class interfaceButtJoint {
    // 初始化配置
    constructor(config = {}) {
        this.$reqAddress = config.reqAddress !== undefined ? (/^http/.test(config.reqAddress) ? config.reqAddress : "http://" + config.reqAddress) : "http://localhost:8080"; // 接口请求地址
        this.$userConfig = config.userConfig !== undefined ? config.userConfig : null; // 用户接口配置对象
        this.$useFetch = config.useFetch !== undefined ? config.useFetch : false; // 是否使用 fetch 来进行请求
        rain_logs.setIsConsole(config.logs !== undefined ? config.logs : false); // 是否打印日志
        rain_logs.setIsConsoleStyle(config.isLogStyle !== undefined ? config.isLogStyle : false); // 是否开彩色日志
        this.$falseDataMode = config.falseDataMode !== undefined ? config.falseDataMode : false; // 是否开启模拟数据模式
        this.$globalRequestConfig = config.globalRequestConfig !== undefined ? config.globalRequestConfig : null; // 全局请求配置对象
        this.$setNullString = config.setNullString !== undefined ? config.setNullString : undefined; // 是否开启空字符串
        this.$isEnableCache = config.isEnableCache !== undefined ? config.isEnableCache : false; // 是否对接口开启缓存模式
        this.$interceptor = config.interceptor !== undefined ? config.interceptor : undefined; // 全局拦截器
        this._globalRequestFilterFun = config.globalRequestFilterFun !== undefined ? config.globalRequestFilterFun : () => false; // 全局请求过滤器函数
        this._globalResponseFilterFun = config.globalResponseFilterFun !== undefined ? config.globalResponseFilterFun : () => false; // 全局响应过滤器函数
        this._globalRequestErrorFun = config.globalRequestErrorFun !== undefined ? config.globalRequestErrorFun : () => false; // 全局请求异常回调函数
        this.globalFun = config.globalFun !== undefined ? config.globalFun : {}; // 全局函数对象
        this.globalFun.$rbj = this; // 设置全局函数内, 默认可以直接使用当前 interfaceButtJoint 对象
        this.rbjGlobalThis = getGlobalFun(); // 在不同环境中, 获取并设置统一的 全局对象
        if (this.rbjGlobalThis && !this.rbjGlobalThis.uni && this.rbjGlobalThis.wx) this.rbjGlobalThis.uni = this.rbjGlobalThis.wx; // 如果处于 微信环境, 让 uni 等于 wx
        this.$isUniApp = typeof uni !== "undefined" ? true : false; // 上方已经 uni 已经等于 wx, 所以不管是 uni 环境还是 wx 环境, $isUniApp 都等于 true
        this.$tokenName = config.tokenName !== undefined ? config.tokenName : "Authorization"; // 设置请求头 token 的属性名
        this.$dynamicGlobalHeaderObj = {}; // 动态全局请求头
        this.$dynamicHeaderObj = {}; // 局部接口动态请求头
        this._customSetTokenFun = config.customSetTokenFun !== undefined ? config.customSetTokenFun : undefined; // 自定义设置 token 的函数
        this._customGetTokenFun = config.customGetTokenFun !== undefined ? config.customGetTokenFun : undefined; // 自定义获取 token 的函数
        this._customRemoveTokenFun = config.customRemoveTokenFun !== undefined ? config.customRemoveTokenFun : undefined; // 自定义删除 token 的函数
        this.$globalComponent = config.globalComponent !== undefined ? config.globalComponent : undefined; // 全局组件
        this._globalData = {}; // 缓存模式的数据存储对象
        this._tempNullString = ""; // 临时空值过滤变量
        this.$freshInterfaceData = {
            // 刷新标记对象
            flag: {}, // 标记对象
            groupFlag: {}, // 组标记对象
        };
    }

    // 执行接口的请求参数过滤函数
    _executiveParamsDataFun(config = {}) {
        let { interfaceDefinedName, paramsObj, currentObj, pathParams, isAppendData, frontORback } = config;

        if (this._getUserConfigObj(interfaceDefinedName).paramsData) {
            // 对传入的参数进行自定义过滤
            let paramsDatas = {
                paramsObj,
                pathParams,
            };
            let setParamsData = this._getUserConfigObj(interfaceDefinedName).paramsData(paramsDatas, this, currentObj, isAppendData, frontORback);
            return setParamsData !== undefined && (setParamsData.paramsObj || setParamsData.pathParams) ? setParamsData : paramsDatas;
        }
    }

    // 请求头设置
    _requestHeader(config = {}) {
        let { interfaceDefinedName, paramsObj, pathParams, isUrlEncode, tempUseFetch, isFileUpload, isUniappUpload, isUseToken } = config;
        // 获取用户的接口配置对象
        let interfaceDefinedObj = this._getUserConfigObj(interfaceDefinedName);

        // 获取用户请求的服务器地址
        let reqAddressUrl = interfaceDefinedObj.reqAddress || this.$reqAddress;

        // 获取用户请求配置
        let userRequestObj = interfaceDefinedObj.requestConfig || {};

        // 获取用户的全局请求头配置
        let globalRequestConfig = this.$globalRequestConfig ? this.$globalRequestConfig(this) : {};

        // 获取用户动态请求头的配置
        let userDynamicHeader = this.$dynamicHeaderObj[interfaceDefinedName] ? this.$dynamicHeaderObj[interfaceDefinedName] : {};

        // 判断是否是 Fetch 请求
        let isFetchRequest = this.$useFetch || interfaceDefinedObj.tempUseFetch || tempUseFetch;

        // 定义配置对象
        let requestObj = null;
        if (isUniappUpload) {
            requestObj = {
                headers: {},
            };
        } else {
            // 设置默认配置对象
            if (interfaceDefinedObj.url && interfaceDefinedObj.method) {
                requestObj = {
                    url: reqAddressUrl + interfaceDefinedObj.url,
                    method: interfaceDefinedObj.method,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                };
            } else {
                rain_logs.WARN(`在 ${interfaceDefinedName} 接口配置对象中, 未找到请求的 url 或 method`);
                return;
            }

            // 判断是否使用 路径参数 是否存在, 存在就使用, 不存在则不使用
            if (pathParams) requestObj.url = requestObj.url + pathParams;
            // 判断 参数对象 是否存在, 存在就使用, 不存在则不使用
            if (paramsObj) {
                // 判断是否 GET 请求
                if (["GET", "get"].includes(interfaceDefinedObj.method)) {
                    if (isFetchRequest) {
                        // #ifndef APP-NVUE
                        requestObj.url = requestObj.url + "?" + qs.stringify(paramsObj);
                        // #endif
                    } else if (this.$isUniApp) {
                        requestObj.data = paramsObj;
                    } else {
                        requestObj.params = paramsObj;
                    }
                } else {
                    if (isUrlEncode) {
                        // #ifndef APP-NVUE
                        requestObj.url = requestObj.url + `?${qs.stringify(paramsObj)}`;
                        // #endif
                    } else {
                        // 默认 application/json 数据
                        if (isFetchRequest && isFileUpload) {
                            // fetch 文件上传时, 不可设置 headers
                            requestObj.body = paramsObj;
                        } else {
                            requestObj.headers = {
                                "Content-Type": isFileUpload ? "multipart/form-data" : "application/json",
                            };
                            if (isFetchRequest) {
                                requestObj.body = JSON.stringify(paramsObj);
                            } else {
                                requestObj.data = paramsObj;
                            }
                        }
                    }
                }
            }
        }

        // 放入 token
        if (this.getToken() && isUseToken) requestObj.headers[this.$tokenName] = this.getToken();
        // 按照请求头配置的优先级, 融合三种配置对象, 依次是 默认配置对象 -> 全局配置对象 -> 用户对单一接口的单独配置对象
        // 先融合请求头
        requestObj.headers = Object.assign(requestObj.headers, globalRequestConfig.headers, this.$dynamicGlobalHeaderObj, userRequestObj.headers, userDynamicHeader);

        // 判断是否是 uniapp 文件上传
        if (isUniappUpload) {
            return requestObj.headers;
        } else {
            // 因为上方已经融合了所有的请求头, 为了防止下方请求配置对象融合时, 会再次重复融合请求头, 导致上方已经融合好的请求头被覆盖的问题, 故需要先把 全局配置对象 和 局部用户配置对象 中的请求头 给删除掉
            if (globalRequestConfig.headers) delete globalRequestConfig.headers;
            if (userRequestObj.headers) delete userRequestObj.headers;
            // 再融合请求配置对象
            let configObj = Object.assign(requestObj, globalRequestConfig, userRequestObj);
            // fetch 上传文件, 删除 headers 属性
            if (isFetchRequest && isFileUpload) {
                delete configObj.headers;
            } else {
                // 判断是否 uniapp 请求, 转换请求头属性名
                if (this.$isUniApp) configObj.header = configObj.headers;
            }
            return configObj;
        }
    }

    // 对象转路径参数
    objToPathParams(pathObj) {
        // #ifndef APP-NVUE
        return qs.stringify(pathObj);
        // #endif
    }

    // 路径参数转对象
    pathParamsToObj(urlPath) {
        // #ifndef APP-NVUE
        return qs.parse(urlPath);
        // #endif
    }

    // 手动对接
    buttJoint(interfaceDefinedName, paramsObj, optionsObj = {}) {
        // 处理参数
        let { pathParams, isUrlEncode = false, tempUseFetch = false, isFileUpload = false, globalFilterInterCept, isUseToken = true, descriptionStr } = optionsObj;
        // 请求拦截器
        let requestInterceptorVal = this._requestOrResponseInterceptor(interfaceDefinedName, paramsObj, pathParams, null, true);
        if (typeof requestInterceptorVal == "boolean") {
            if (requestInterceptorVal) return new Promise((resolve, reject) => reject(`${interfaceDefinedName} 的请求操作被请求拦截器拦截了`));
        } else if (requestInterceptorVal !== undefined) {
            if (requestInterceptorVal.paramsObj) paramsObj = requestInterceptorVal.paramsObj;
            if (requestInterceptorVal.pathParams) pathParams = requestInterceptorVal.pathParams;
        }
        // 全局请求过滤器
        let globalReqFunData = this._globalRequestFilterFun(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName));
        if (globalReqFunData !== undefined && typeof globalReqFunData == "boolean") {
            if (globalReqFunData) {
                rain_logs.WARN(`${interfaceDefinedName} 的请求操作被全局请求过滤器拦截了`);
                if (globalFilterInterCept && globalFilterInterCept.requestCallback) globalFilterInterCept.requestCallback(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName));
                return new Promise((resolve, reject) => reject(`${interfaceDefinedName} 的请求操作被全局请求过滤器拦截了`));
            }
        } else if (globalReqFunData !== undefined) {
            if (globalReqFunData.paramsObj) paramsObj = globalReqFunData.paramsObj;
            if (globalReqFunData.pathParams) pathParams = globalReqFunData.pathParams;
        }
        let requestParamsData = this._executiveParamsDataFun({ interfaceDefinedName, paramsObj, pathParams });
        if (requestParamsData !== undefined && requestParamsData.paramsObj) paramsObj = requestParamsData.paramsObj;
        if (requestParamsData !== undefined && requestParamsData.pathParams) pathParams = requestParamsData.pathParams;
        let refRefreshFlagObj = null;
        if (this.$isUniApp) {
            refRefreshFlagObj = this._uniappButtJoint(interfaceDefinedName, paramsObj, pathParams, isUrlEncode, tempUseFetch, null, globalFilterInterCept, isUseToken, descriptionStr);
        } else {
            refRefreshFlagObj = this._buttJoint(interfaceDefinedName, paramsObj, pathParams, isUrlEncode, tempUseFetch, isFileUpload, globalFilterInterCept, isUseToken, descriptionStr);
        }
        // 记录刷新标记
        let self = this;
        let params = [interfaceDefinedName, paramsObj, optionsObj];
        let paramsObjFlag = {
            params,
            execute: [],
        };
        // 深拷贝一个新的返回对象
        let refVal = Object.assign({}, refRefreshFlagObj);
        // 重写拷贝后返回对象的 then 方法, 用以记录传入的 then 方法函数
        refVal.then = (func) => {
            // 调用 (原返回对象) 的 then 方法
            refRefreshFlagObj.then((data) => {
                // 判断 data 是否为 ISNULL, 因为 this._assignment() 函数, 如果全局拦截了一定会返回一个 ISNULL
                if (data !== "ISNULL") func(data);
            });
            paramsObjFlag.execute.push({
                then: func,
            });
            return refVal;
        };
        // 此函数和上方重写的 then 是一样的逻辑
        refVal.catch = (func) => {
            // 如果全局拦截了, 即使 refRefreshFlagObj 所代表的 Promise 没有报错即抛出异常, 用户调用的 catch 函数也会运行
            refRefreshFlagObj.then((data) => {
                if (data === "ISNULL") func(data);
            });
            refRefreshFlagObj.catch(func);
            paramsObjFlag.execute.push({
                catch: func,
            });
            return refVal;
        };

        refVal.refRefreshGroup = (groupName, uniqueTagName) => {
            if (self.$freshInterfaceData.groupFlag[groupName]) {
                self.$freshInterfaceData.groupFlag[groupName][uniqueTagName] = paramsObjFlag;
            } else {
                self.$freshInterfaceData.groupFlag[groupName] = {};
                self.$freshInterfaceData.groupFlag[groupName][uniqueTagName] = paramsObjFlag;
            }
            return refVal;
        };
        refVal.refRefreshFlag = (freshTagName) => {
            self.$freshInterfaceData.flag[freshTagName] = paramsObjFlag;
            return refVal;
        };
        return refVal;
    }

    // 自动对接 (dataName 和 currentObj 不直接合并为一个, 即传入一个对象的原因: 我们可以在别的地方从 currentObj 对象中操作或获取一些其他的数据)
    autoButtJoint(interfaceDefinedName, paramsObj, dataName, currentObj, optionsObj = {}) {
        // 处理参数
        let { pathParams, callbackFunc, isAppendData = false, isUrlEncode = false, tempUseFetch = false, frontORback = false, globalFilterInterCept, isUseToken = true, descriptionStr } = optionsObj;
        // 请求拦截器
        let requestInterceptorVal = this._requestOrResponseInterceptor(interfaceDefinedName, paramsObj, pathParams, currentObj, true);
        if (typeof requestInterceptorVal == "boolean") {
            if (requestInterceptorVal) return null;
        } else if (requestInterceptorVal !== undefined) {
            if (requestInterceptorVal.paramsObj) paramsObj = requestInterceptorVal.paramsObj;
            if (requestInterceptorVal.pathParams) pathParams = requestInterceptorVal.pathParams;
        }
        // 全局请求过滤器
        let globalReqFunData = this._globalRequestFilterFun(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName), currentObj);
        if (globalReqFunData !== undefined && typeof globalReqFunData == "boolean") {
            if (globalReqFunData) {
                rain_logs.WARN(`${interfaceDefinedName} 的请求操作被全局请求过滤器拦截了`);
                if (globalFilterInterCept && globalFilterInterCept.requestCallback) globalFilterInterCept.requestCallback(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName), currentObj);
                return null;
            }
        } else if (globalReqFunData !== undefined) {
            if (globalReqFunData.paramsObj) paramsObj = globalReqFunData.paramsObj;
            if (globalReqFunData.pathParams) pathParams = globalReqFunData.pathParams;
        }
        let requestParamsData = this._executiveParamsDataFun({
            interfaceDefinedName,
            paramsObj,
            currentObj,
            pathParams,
            isAppendData,
            frontORback,
        });
        if (requestParamsData !== undefined && requestParamsData.paramsObj) paramsObj = requestParamsData.paramsObj;
        if (requestParamsData !== undefined && requestParamsData.pathParams) pathParams = requestParamsData.pathParams;
        if (this.$isUniApp) {
            this._uniappAutoButtJoint(interfaceDefinedName, paramsObj, dataName, currentObj, pathParams, callbackFunc, isAppendData, isUrlEncode, tempUseFetch, frontORback, globalFilterInterCept, isUseToken, descriptionStr);
        } else {
            this._autoButtJoint(interfaceDefinedName, paramsObj, dataName, currentObj, pathParams, callbackFunc, isAppendData, isUrlEncode, tempUseFetch, frontORback, globalFilterInterCept, isUseToken, descriptionStr);
        }
        let self = this;
        let params = [interfaceDefinedName, paramsObj, dataName, currentObj, optionsObj];
        return {
            refRefreshGroup(groupName, uniqueTagName) {
                if (self.$freshInterfaceData.groupFlag[groupName]) {
                    self.$freshInterfaceData.groupFlag[groupName][uniqueTagName] = params;
                } else {
                    self.$freshInterfaceData.groupFlag[groupName] = {};
                    self.$freshInterfaceData.groupFlag[groupName][uniqueTagName] = params;
                }
                return this;
            },
            refRefreshFlag(freshTagName) {
                self.$freshInterfaceData.flag[freshTagName] = params;
                return this;
            },
        };
    }

    // 请求拦截器函数
    _requestOrResponseInterceptor(interfaceDefinedName, paramsObj, pathParams, currentObj, isReqOResp) {
        let userObj = this._getUserConfigObj(interfaceDefinedName);
        let regularData = null;
        // 执行请求拦截器
        if (Array.isArray(this.$interceptor)) {
            for (let i = 0; i < this.$interceptor.length; i++) {
                let interceptorObj = this.$interceptor[i];
                let regexpParams = null;
                if (interceptorObj.regular) {
                    regexpParams = interceptorObj.regular;
                } else {
                    rain_logs.WARN(`第 ${i + 1} 个 拦截器的正则表达式为空, 自动放行`);
                    return false;
                }
                let regexpValue = false;
                if (Array.isArray(regexpParams)) {
                    for (let j = 0; j < regexpParams.length; j++) {
                        let regexpVal = null;
                        if (typeof regexpParams[j] == "object") {
                            regexpVal = new RegExp(regexpParams[j].str, regexpParams[j].pattern).test(userObj.url);
                        } else if (regexpParams[j] && typeof regexpParams[j] == "string") {
                            regexpVal = new RegExp(regexpParams[j]).test(userObj.url);
                        } else {
                            rain_logs.WARN(`第 ${i + 1} 个 拦截器中的, 第${j + 1} 个元素的正则表达式为空`);
                        }
                        if (regexpVal) {
                            regexpValue = regexpVal;
                            break;
                        }
                    }
                } else {
                    if (typeof regexpParams == "object") {
                        regexpValue = new RegExp(regexpParams.str, regexpParams.pattern).test(userObj.url);
                    } else if (regexpParams && typeof regexpParams == "string") {
                        regexpValue = new RegExp(regexpParams).test(userObj.url);
                    } else {
                        rain_logs.WARN(`第 ${i + 1} 个 拦截器的正则表达式为空, 自动放行`);
                        return false;
                    }
                }
                if ((regexpValue && !interceptorObj.reversalVerify) || (!regexpValue && interceptorObj.reversalVerify)) {
                    let requestORresponseRegularVal = undefined;
                    if (isReqOResp) {
                        if (this.$interceptor[i].requestRegular) requestORresponseRegularVal = this.$interceptor[i].requestRegular(paramsObj, pathParams, regularData, this, userObj, currentObj);
                    } else {
                        if (this.$interceptor[i].responseRegular) requestORresponseRegularVal = this.$interceptor[i].responseRegular(paramsObj, regularData, this, userObj, currentObj);
                    }
                    if (requestORresponseRegularVal !== undefined && typeof requestORresponseRegularVal == "boolean") {
                        if (requestORresponseRegularVal) {
                            rain_logs.WARN(`${interfaceDefinedName} 的${isReqOResp ? "请求" : "响应"}操作被第 ${i + 1} 个拦截器, 拦截了`);
                            return true;
                        }
                    } else if (requestORresponseRegularVal !== undefined) {
                        regularData = requestORresponseRegularVal;
                    }
                }
            }
        } else if (this.$interceptor !== undefined) {
            rain_logs.WARN(`拦截器类型错误, 当前拦截器不是数组类型, 需要设置成数组类型, 注意: 不管一个还是多个拦截器, 都需要放在一个数组内, 并配置到 Rbj 对象上`);
        }
        if (regularData) {
            return regularData;
        } else {
            return false;
        }
    }

    // 自动刷新标记接口调用
    refreshFlagInterface(freshTagName) {
        if (this.$freshInterfaceData.flag[freshTagName]) {
            if (Array.isArray(this.$freshInterfaceData.flag[freshTagName])) {
                this.autoButtJoint(...this.$freshInterfaceData.flag[freshTagName]);
            } else if (typeof this.$freshInterfaceData.flag[freshTagName] == "object") {
                // 获取标记刷新所需要的数据
                let paramsObj = this.$freshInterfaceData.flag[freshTagName];
                // 发送刷新标记的请求
                let flagFun = this.buttJoint(...paramsObj.params);
                // 执行标记接口的 then, catch 函数
                paramsObj.execute.forEach((item) => {
                    if (item.then) {
                        flagFun.then(item.then);
                    } else {
                        flagFun.catch(item.catch);
                    }
                });
            } else {
                rain_logs.ERROR(freshTagName, " 的接口标记刷新错误");
            }
        } else {
            rain_logs.ERROR("没有找到 " + freshTagName + " 指定的引用刷新标记");
        }
    }

    // 自动刷新标记组内所有的接口调用
    refreshGroupInterface(groupName) {
        let self = this;
        if (self.$freshInterfaceData.groupFlag[groupName]) {
            let groupFlagData = self.$freshInterfaceData.groupFlag[groupName];
            for (const keys in groupFlagData) {
                if (Array.isArray(groupFlagData[keys])) {
                    self.autoButtJoint(...groupFlagData[keys]);
                } else if (typeof groupFlagData[keys] == "object") {
                    // 获取标记刷新所需要的数据
                    let paramsObj = groupFlagData[keys];
                    // 发送刷新标记的请求
                    let flagFun = self.buttJoint(...paramsObj.params);
                    // 执行标记接口的 then, catch 函数
                    paramsObj.execute.forEach((item) => {
                        if (item.then) {
                            flagFun.then(item.then);
                        } else {
                            flagFun.catch(item.catch);
                        }
                    });
                } else {
                    rain_logs.ERROR(groupName, " 组的接口标记刷新错误");
                }
            }
        } else {
            rain_logs.ERROR("没有找到 " + groupName + " 指定的引用刷新标记组");
        }
    }

    // 自动刷新标记组内指定的 flag 的接口调用
    refreshGroupFlagInterface(groupName, freshTagName) {
        let self = this;
        if (self.$freshInterfaceData.groupFlag[groupName] && self.$freshInterfaceData.groupFlag[groupName][freshTagName]) {
            let groupFlagData = self.$freshInterfaceData.groupFlag[groupName];
            if (Array.isArray(groupFlagData[freshTagName])) {
                self.autoButtJoint(...groupFlagData[freshTagName]);
            } else if (typeof groupFlagData[freshTagName] == "object") {
                // 获取标记刷新所需要的数据
                let paramsObj = groupFlagData[freshTagName];
                // 发送刷新标记的请求
                let flagFun = self.buttJoint(...paramsObj.params);
                // 执行标记接口的 then, catch 函数
                paramsObj.execute.forEach((item) => {
                    if (item.then) {
                        flagFun.then(item.then);
                    } else {
                        flagFun.catch(item.catch);
                    }
                });
            } else {
                rain_logs.ERROR(groupName + " 组内的 " + freshTagName + " 接口标记刷新错误");
            }
        } else {
            rain_logs.ERROR("没有找到 " + groupName + " 组内的 " + freshTagName + " 指定的引用刷新标记");
        }
    }

    // 删除刷新标记
    refreshFlagTagDelete(freshTagName) {
        let self = this;
        if (Array.isArray(freshTagName)) {
            freshTagName.forEach((item) => {
                delete self.$freshInterfaceData.flag[item];
            });
        } else {
            delete self.$freshInterfaceData.flag[freshTagName];
        }
    }

    // 删除组刷新标记
    refreshGroupTagDelete(freshTagName) {
        let self = this;
        if (Array.isArray(freshTagName)) {
            freshTagName.forEach((item) => {
                delete self.$freshInterfaceData.groupFlag[item];
            });
        } else {
            delete self.$freshInterfaceData.groupFlag[freshTagName];
        }
    }

    // 删除组内指定的 flag 刷新标记
    refreshGroupFlagTagDelete(groupName, freshTagName) {
        let self = this;
        if (self.$freshInterfaceData.groupFlag[groupName][freshTagName]) {
            delete self.$freshInterfaceData.groupFlag[groupName][freshTagName];
        } else {
            rain_logs.ERROR(groupName, " :组内指定的 flag 标记删除失败 ");
        }
    }

    // 删除全部的刷新标记
    refreshFlagTagDeleteAll() {
        this.$freshInterfaceData.flag = {};
    }

    // 删除标记组全部的刷新标记
    refreshGroupTagDeleteAll() {
        this.$freshInterfaceData.groupFlag = {};
    }

    // 删除全部的刷新标记
    refreshTagDeleteAll() {
        this.$freshInterfaceData.flag = {};
        this.$freshInterfaceData.groupFlag = {};
    }

    // 文件上传
    upload(interfaceDefinedName, Files, optionsObj = {}) {
        // 处理参数
        let { paramsObj, pathParams, reqPropertyName, isFilePathUpload = this.$isUniApp, globalFilterInterCept, isUseToken = true } = optionsObj;
        // 请求拦截器
        let requestInterceptorVal = this._requestOrResponseInterceptor(interfaceDefinedName, paramsObj, pathParams, null, true);
        if (typeof requestInterceptorVal === "boolean") {
            if (requestInterceptorVal) return new Promise((resolve, reject) => reject(`${interfaceDefinedName} 的请求操作被请求拦截器拦截了`));
        } else if (requestInterceptorVal !== undefined) {
            if (requestInterceptorVal.paramsObj) paramsObj = requestInterceptorVal.paramsObj;
            if (requestInterceptorVal.pathParams) pathParams = requestInterceptorVal.pathParams;
        }
        // 全局过滤器
        let globalReqFunData = this._globalRequestFilterFun(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName));
        if (globalReqFunData !== undefined && typeof globalReqFunData == "boolean") {
            if (globalReqFunData) {
                rain_logs.WARN(`${interfaceDefinedName} 的请求操作被 -全局过滤器- 拦截了`);
                if (globalFilterInterCept && globalFilterInterCept.requestCallback) globalFilterInterCept.requestCallback(paramsObj, pathParams, this, this._getUserConfigObj(interfaceDefinedName));
                return new Promise((resolve, reject) => reject(`${interfaceDefinedName} 的请求操作被全局过滤器拦截了`));
            }
        } else if (globalReqFunData !== undefined) {
            if (globalReqFunData.paramsObj) paramsObj = globalReqFunData.paramsObj;
            if (globalReqFunData.pathParams) pathParams = globalReqFunData.pathParams;
        }
        if (this.$isUniApp) {
            return this._uniappUpload(interfaceDefinedName, Files, paramsObj, pathParams, reqPropertyName, isFilePathUpload, globalFilterInterCept, isUseToken).catch((err) => {
                this._globalRequestErrorFun(err, this);
                throw err;
            });
        } else {
            return this._upload(interfaceDefinedName, Files, paramsObj, pathParams, reqPropertyName, null, globalFilterInterCept, isUseToken).catch((err) => {
                this._globalRequestErrorFun(err, this);
                throw err;
            });
        }
    }

    // web浏览器上传文件
    _upload(interfaceDefinedName, Files, paramsObj, pathParams, reqPropertyName, isFilePathUpload, globalFilterInterCept, isUseToken) {
        let formData = new FormData();

        // 判断是多文件还是单文件上传
        if (Array.isArray(Files)) {
            // 传入的文件数组内部必须是 File 类型的对象, 文件才能上传成功
            Files.forEach((item, index) => {
                if (item instanceof File) {
                    formData.append(reqPropertyName, item);
                } else {
                    rain_logs.ERROR(interfaceDefinedName, " 文件数组中 索引值为" + index + " 的文件类型错误, 请先把此索引的元素数据类型 转换为 File 类型的对象, 再尝试进行上传操作");
                    return;
                }
            });
        } else {
            // 传入的文件对象参数, 必须是 File 类型的对象, 文件才能上传成功
            if (Files instanceof File) {
                formData.append(reqPropertyName, Files);
            } else {
                rain_logs.ERROR(interfaceDefinedName, " 文件对象类型错误, 请先把传入的 “ 文件对象 ” 的类型转换为 File 类型的对象, 再尝试进行上传操作");
                return;
            }
        }
        if (paramsObj) {
            // 把请求的主体数据放到 formData 对象中
            for (const key in paramsObj) {
                formData.append(key, paramsObj[key]);
            }
        }
        return this._buttJoint(interfaceDefinedName, formData, pathParams, null, null, true, globalFilterInterCept, isUseToken);
    }

    // uniapp 文件上传
    _uniappUpload(interfaceDefinedName, Files, paramsObj, pathParams, reqPropertyName, isFilePathUpload, globalFilterInterCept, isUseToken) {
        // 获取用户请求的服务器地址
        let reqAddressUrl = (this._getUserConfigObj(interfaceDefinedName).reqAddress || this.$reqAddress) + this._getUserConfigObj(interfaceDefinedName).url;
        // 判断是否进行的是多文件上传
        let isMultipartFile = !!Array.isArray(Files);
        // 获取请求头配置
        let headers = this._requestHeader({ interfaceDefinedName, paramsObj, pathParams, isUniappUpload: true, isUseToken });
        return new Promise((resolve, reject) => {
            if (isMultipartFile) {
                if (isFilePathUpload) {
                    rain_logs.ERROR("你已开启 isFilePathUpload 模式, 请不要传入一个 或 多个 文件对象, 请传入 string 类型的 临时路径或 blob 路径");
                } else {
                    Files = Files.map((item) => {
                        return {
                            name: reqPropertyName ? reqPropertyName : "file",
                            file: item,
                        };
                    });
                    // 多文件上传
                    uni.uploadFile({
                        url: reqAddressUrl,
                        header: headers,
                        files: Files,
                        formData: paramsObj,
                        success: (uploadFileRes) => {
                            resolve(uploadFileRes);
                        },
                        fail(err) {
                            reject(err);
                        },
                    });
                }
            } else {
                if (isFilePathUpload) {
                    if (typeof Files === "string") {
                        // 单文件 filePath 上传
                        uni.uploadFile({
                            url: reqAddressUrl,
                            header: headers,
                            filePath: Files,
                            name: reqPropertyName ? reqPropertyName : "file",
                            formData: paramsObj,
                            success: (uploadFileRes) => {
                                resolve(uploadFileRes);
                            },
                            fail(err) {
                                reject(err);
                            },
                        });
                    } else {
                        rain_logs.ERROR("你已开启 isFilePathUpload 上传模式, Files 文件参数必须是 string 类型的临时路径 或 blob 路径, 但你传入的并不是我们需要的类型");
                    }
                } else {
                    // 单文件上传
                    uni.uploadFile({
                        url: reqAddressUrl,
                        header: headers,
                        file: Files,
                        name: reqPropertyName ? reqPropertyName : "file",
                        formData: paramsObj,
                        success: (uploadFileRes) => {
                            resolve(uploadFileRes);
                        },
                        fail(err) {
                            reject(err);
                        },
                    });
                }
            }
        })
            .then((data) => {
                rain_logs.WARN(this._getUserConfigObj(interfaceDefinedName).url, " 请求成功了 :  ", data);
                return this._assignment(false, interfaceDefinedName, data, null, null, null, null, null, globalFilterInterCept);
            })
            .catch((err) => {
                rain_logs.ERROR(`${this._getUserConfigObj(interfaceDefinedName).url} 操作: 文件上传错误`, err);
                throw err;
            });
    }

    // 判断接口的描述是否存在
    _isDescription(interfaceInfo, descriptionStr) {
        if (interfaceInfo.description) {
            return " ----------- " + interfaceInfo.description;
        } else if (descriptionStr) {
            return " ----------- (" + descriptionStr + ")";
        } else {
            return " ----------- " + interfaceInfo.description + "(" + descriptionStr + ")";
        }
    }

    // 手动对接
    _buttJoint(interfaceDefinedName, paramsObj, pathParams, isUrlEncode, tempUseFetch, isFileUpload, globalFilterInterCept, isUseToken, descriptionStr) {
        if (!interfaceDefinedName) {
            // 判断是否为空
            rain_logs.ERROR("buttJoint 缺少参数");
        } else if (this._getUserConfigObj(interfaceDefinedName).falseDataMode !== undefined ? this._getUserConfigObj(interfaceDefinedName).falseDataMode : this.$falseDataMode) {
            // 判断是否假数据模式
            return new Promise((resolve, reject) => {
                resolve(this._assignment(false, interfaceDefinedName, {}, null, null, null, null, null, globalFilterInterCept));
            });
        } else {
            let self = this;
            let interfaceInfo = this._getUserConfigObj(interfaceDefinedName);
            let configObj = this._requestHeader({
                interfaceDefinedName,
                paramsObj,
                pathParams,
                isUrlEncode,
                tempUseFetch,
                isFileUpload,
                isUseToken,
            });
            // 判断是否使用 fetch, 或 临时使用 fetch
            if (self.$useFetch || self._getUserConfigObj(interfaceDefinedName).tempUseFetch || tempUseFetch) {
                return fetch(configObj.url, configObj)
                    .then((data) => {
                        rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                        return self._assignment(true, interfaceDefinedName, data, null, null, null, null, null, globalFilterInterCept);
                    })
                    .catch((err) => {
                        rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                        self._globalRequestErrorFun(err, self);
                        throw err;
                    });
            } else {
                return axios(configObj)
                    .then((data) => {
                        rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                        return self._assignment(false, interfaceDefinedName, data, null, null, null, null, null, globalFilterInterCept);
                    })
                    .catch((err) => {
                        rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                        self._globalRequestErrorFun(err, self);
                        throw err;
                    });
            }
        }
    }

    // 自动对接
    _autoButtJoint(interfaceDefinedName, paramsObj, dataName, currentObj, pathParams, callbackFunc, isAppendData, isUrlEncode, tempUseFetch, frontORback, globalFilterInterCept, isUseToken, descriptionStr) {
        if (!this._oneParams(interfaceDefinedName, dataName, currentObj)) {
            // 判断是否为空
            rain_logs.ERROR("autoButtJoint 缺少参数");
        } else if (this._getUserConfigObj(interfaceDefinedName).falseDataMode !== undefined ? this._getUserConfigObj(interfaceDefinedName).falseDataMode : this.$falseDataMode) {
            // 判断是否假数据模式
            this._assignment(false, interfaceDefinedName, {}, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept);
        } else {
            let interfaceInfo = this._getUserConfigObj(interfaceDefinedName);
            // 请求头配置
            let configObj = this._requestHeader({
                interfaceDefinedName,
                paramsObj,
                pathParams,
                isUrlEncode,
                tempUseFetch,
                isUseToken,
            });
            // 判断是否使用 fetch, 或 临时使用 fetch
            if (this.$useFetch || this._getUserConfigObj(interfaceDefinedName).tempUseFetch || tempUseFetch) {
                fetch(configObj.url, configObj)
                    .then((data) => {
                        rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                        this._assignment(true, interfaceDefinedName, data, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept);
                    })
                    .catch((err) => {
                        rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                        this._globalRequestErrorFun(err, this);
                    });
            } else {
                axios(configObj)
                    .then((data) => {
                        rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                        this._assignment(false, interfaceDefinedName, data, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept);
                    })
                    .catch((err) => {
                        rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                        this._globalRequestErrorFun(err, this);
                    });
            }
        }
    }

    // uniapp 手动对接
    _uniappButtJoint(interfaceDefinedName, paramsObj, pathParams, isUrlEncode, tempUseFetch, isFileUpload, globalFilterInterCept, isUseToken, descriptionStr) {
        if (!interfaceDefinedName) {
            // 判断是否为空
            rain_logs.ERROR("buttJoint 缺少参数");
        } else if (this._getUserConfigObj(interfaceDefinedName).falseDataMode !== undefined ? this._getUserConfigObj(interfaceDefinedName).falseDataMode : this.$falseDataMode) {
            // 判断是否假数据模式
            return new Promise((resolve, reject) => {
                resolve(this._assignment(false, interfaceDefinedName, {}, null, null, null, null, null, globalFilterInterCept));
            });
        } else {
            let self = this;
            let configObj = this._requestHeader({
                interfaceDefinedName,
                paramsObj,
                pathParams,
                isUrlEncode,
                tempUseFetch,
                isUseToken,
            });
            let interfaceInfo = self._getUserConfigObj(interfaceDefinedName);
            return new Promise((resolve, reject) => {
                uni.request({
                    ...configObj,
                    success(data) {
                        resolve(data);
                    },
                    fail(err) {
                        reject(err);
                    },
                });
            })
                .then((data) => {
                    rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                    return self._assignment(false, interfaceDefinedName, data, null, null, null, null, null, globalFilterInterCept);
                })
                .catch((err) => {
                    rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                    self._globalRequestErrorFun(err, self);
                    throw err;
                });
        }
    }

    // uniapp 自动对接
    _uniappAutoButtJoint(interfaceDefinedName, paramsObj, dataName, currentObj, pathParams, callbackFunc, isAppendData, isUrlEncode, tempUseFetch, frontORback, globalFilterInterCept, isUseToken, descriptionStr) {
        if (!this._oneParams(interfaceDefinedName, dataName, currentObj)) {
            // 判断是否为空
            rain_logs.ERROR("autoButtJoint 缺少参数");
        } else if (this._getUserConfigObj(interfaceDefinedName).falseDataMode !== undefined ? this._getUserConfigObj(interfaceDefinedName).falseDataMode : this.$falseDataMode) {
            // 判断是否假数据模式
            this._assignment(false, interfaceDefinedName, {}, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept);
        } else {
            let configObj = this._requestHeader({
                interfaceDefinedName,
                paramsObj,
                pathParams,
                isUrlEncode,
                tempUseFetch,
                isUseToken,
            });
            let interfaceInfo = this._getUserConfigObj(interfaceDefinedName);
            new Promise((resolve, reject) => {
                uni.request({
                    ...configObj,
                    success(data) {
                        resolve(data);
                    },
                    fail(err) {
                        reject(err);
                    },
                });
            })
                .then((data) => {
                    rain_logs.WARN(interfaceInfo.url, " 请求成功了 :  ", data, this._isDescription(interfaceInfo, descriptionStr));
                    this._assignment(false, interfaceDefinedName, data, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept);
                })
                .catch((err) => {
                    rain_logs.ERROR(interfaceInfo.url, " 请求失败了 : ", err, this._isDescription(interfaceInfo, descriptionStr));
                    this._globalRequestErrorFun(err, this);
                });
        }
    }

    // 自动化数据处理
    _assignment(isFetch, interfaceDefinedName, data, dataName, currentObj, callbackFunc, isAppendData, frontORback, globalFilterInterCept) {
        // 判断是否对响应的数据开启缓存模式
        if (this.$isEnableCache) {
            this._globalData[interfaceDefinedName] = data;
        }
        // 执行响应拦截器
        let responseInterceptorVal = this._requestOrResponseInterceptor(interfaceDefinedName, data, currentObj, false);
        if (typeof responseInterceptorVal == "boolean") {
            if (responseInterceptorVal) return "ISNULL";
        } else if (responseInterceptorVal !== undefined) {
            data = responseInterceptorVal;
        }
        // 全局响应过滤器处理
        let globalRespFunData = this._globalResponseFilterFun(data, this, this._getUserConfigObj(interfaceDefinedName), currentObj);
        if (globalRespFunData !== undefined && typeof globalRespFunData == "boolean") {
            if (globalRespFunData) {
                rain_logs.WARN(`${interfaceDefinedName} 的响应操作被全局响应过滤器拦截了`);
                if (globalFilterInterCept && globalFilterInterCept.responseCallback) globalFilterInterCept.responseCallback(data, this, this._getUserConfigObj(interfaceDefinedName), currentObj);
                return "ISNULL";
            }
        } else if (globalRespFunData !== undefined) {
            data = globalRespFunData;
        }
        // 组件数据变量赋值    调用用户配置的回调函数
        if (dataName || currentObj) {
            let respData = undefined;
            if (this._getUserConfigObj(interfaceDefinedName).interfaceData) respData = this._getUserConfigObj(interfaceDefinedName).interfaceData(data, this, currentObj);
            let apiData = null;
            if ([true, false, 0, 1].includes(respData)) {
                apiData = respData;
            } else {
                // typeof 会把 对象和数组, 都识别为 object
                if (respData && typeof respData == "object" && this.$setNullString) {
                    // 判断是否为对象或数组, 如果为对象或数组, 则进行 空值过滤
                    apiData = this.dataFilter(respData);
                } else {
                    // 如果 respData 等于 undefined, 说明没有 return 返回数据, 则我们可以直接把 data 赋值给 apiData, 注意: 此处如果 respData 为 null, 且在判断时使用 null == undefined 只使用了两个等于号最终结果会为 true, 所以我们需要使用三个等于号来进行判断
                    if (respData === undefined) {
                        apiData = data;
                    } else {
                        // 如果不等于 undefined, 则说明 interfaceData() return 返回了数据, 并且上方已经做了 是否对象判断, 运行到此步说明它不是个对象, 只是一个基本数据类型(也有可能是 undefined 类型), 直接 赋值给 apiData 即可
                        apiData = respData;
                    }
                }
            }
            if (callbackFunc) {
                // 如果回调函数返回数据时, 则使用回调函数返回的数据
                let callData = callbackFunc(apiData, currentObj);
                if (callData !== undefined) apiData = callData;
            }
            // 在 App 端使用 instanceof 关键字, 会判断失败, 故使用 Array.isArray 来判断数组, 使用 typeof 来判断对象
            if (apiData && isAppendData && Array.isArray(currentObj[dataName]) && Array.isArray(apiData)) {
                // 判断向前追加, 还是向后追加
                if (frontORback) {
                    apiData.forEach((item) => {
                        currentObj[dataName].unshift(item);
                    });
                } else {
                    apiData.forEach((item) => {
                        currentObj[dataName].push(item);
                    });
                }
            } else if (apiData && isAppendData && typeof currentObj[dataName] == "object" && typeof apiData == "object") {
                for (const key in apiData) {
                    currentObj[dataName][key] = apiData[key];
                }
            } else {
                if (isAppendData) {
                    if (apiData !== null && apiData !== undefined) {
                        rain_logs.ERROR(`${interfaceDefinedName} 追加失败, 数据对象 与 追加目标对象类型不一致, 已取消此接口的数据追加, 已改为默认的直接赋值模式`);
                        rain_logs.WARN("友情提示: 数据对象 和 要追加的目标对象, 类型必须一致 (都为 Array 或 都为 Object)");
                    } else {
                        rain_logs.ERROR(`${interfaceDefinedName} 追加失败, 数据对象为 null 或 undefined, 已取消此接口的数据追加模式, 已改为默认的直接赋值模式`);
                    }
                }
                currentObj[dataName] = apiData;
            }
            return apiData;
        } else {
            let respData = undefined;
            if (this._getUserConfigObj(interfaceDefinedName).interfaceData) respData = this._getUserConfigObj(interfaceDefinedName).interfaceData(data, this);
            // 判断 interfaceData() 函数, 是否 return 后返回的 null, 还是没有 return 默认返回的 null
            return respData ? respData : respData === undefined ? data : respData;
        }
    }

    // 获取指定接口的用户配置对象
    _getUserConfigObj(interfaceDefinedName) {
        let resObj = null;
        if (typeof this.$userConfig[interfaceDefinedName] == "string") {
            resObj = this.$userConfig[this.$userConfig[interfaceDefinedName]];
        } else {
            resObj = this.$userConfig[interfaceDefinedName];
        }
        if (!resObj) rain_logs.ERROR(`找不到指定的 ${interfaceDefinedName} 接口配置对象, 请检查 (接口配置名 | 接口配置别名) 是否设置的正确`);
        return resObj;
    }

    // 参数判断是否为空
    _oneParams(interfaceDefinedName, dataName, currentObj) {
        let result = interfaceDefinedName ? (dataName ? (currentObj ? true : "没有传入要进行数据操作的对象") : "没有传入要操作的数据变量名") : "没有传入接口对接的对象名";
        if (typeof result == "boolean") {
            return true;
        } else {
            rain_logs.ERROR("提示: ", result);
            return false;
        }
    }

    // 获取缓存的数据
    getCacheData(params) {
        return this._globalData[params];
    }

    // 动态获取全局的请求头对象
    getDynamicGlobalHeader() {
        if (this.$globalRequestConfig.headers) {
            return Object.assign(this.$globalRequestConfig.headers, this.$dynamicGlobalHeaderObj);
        } else {
            return this.$dynamicGlobalHeaderObj;
        }
    }

    // 动态追加设置全局请求头的属性
    dynamicAddSetGlobalHeader(attributeName, attributeVal) {
        if (attributeName && attributeVal) {
            this.$dynamicGlobalHeaderObj[attributeName] = attributeVal;
        } else {
            rain_logs.WARN("动态设置全局头属性失败, 属性名或属性值为空");
        }
    }

    // 动态删除全局请求头的指定属性, 包括(全局请求头 和 动态全局请求头)
    dynamicDeleteGlobalHeader(attributeName) {
        if (this.$dynamicGlobalHeaderObj[attributeName]) delete this.$dynamicGlobalHeaderObj[attributeName];
        if (this.$globalRequestConfig.headers && this.$globalRequestConfig.headers[attributeName]) delete this.$globalRequestConfig.headers[attributeName];
    }

    // 动态删除全部, 全局请求头的属性
    dynamicClearAllGlobalHeader() {
        this.$dynamicGlobalHeaderObj = {};
        if (this.$globalRequestConfig.headers) this.$globalRequestConfig.headers = {};
    }

    // 动态获取指定接口的请求头对象 (注意: 不包括全局请求头)
    getDynamicInterfaceHeader() {
        let userConfigObj = this._getUserConfigObj(interfaceDefinedName);
        if (userConfigObj.requestConfig && userConfigObj.requestConfig.headers) {
            return Object.assign(userConfigObj.requestConfig.headers, this.$dynamicHeaderObj);
        } else {
            return this.$dynamicHeaderObj;
        }
    }

    // 动态追加设置指定接口的请求头属性 (要在具体的接口请求之前运行)
    dynamicAddSetInterfaceHeader(interfaceDefinedName, attributeName, attributeVal) {
        if (interfaceDefinedName && attributeName && attributeVal) {
            this.$dynamicHeaderObj[interfaceDefinedName][attributeName] = attributeVal;
        } else {
            rain_logs.WARN("动态追加设置指定接口的请求头失败");
        }
    }

    // 动态删除指定接口的请求头属性(要在具体的接口请求之前运行)
    dynamicDeleteInterfaceHeader(interfaceDefinedName, attributeName) {
        if (interfaceDefinedName && attributeName) {
            if (this.$dynamicHeaderObj[interfaceDefinedName]) delete this.$dynamicHeaderObj[interfaceDefinedName][attributeName];
            let userConfigObj = this._getUserConfigObj(interfaceDefinedName);
            if (userConfigObj.requestConfig && userConfigObj.requestConfig.headers && userConfigObj.requestConfig.headers[attributeName]) delete this._getUserConfigObj(interfaceDefinedName).requestConfig.headers[attributeName];
        } else {
            rain_logs.WARN("动态设置指定接口的请求头失败");
        }
    }

    // 动态删除指定接口的所有请求头属性(要在具体的接口请求之前运行), 注意: 不包括全局请求头设置的属性
    dynamicClearAllInterfaceHeader(interfaceDefinedName) {
        if (interfaceDefinedName) {
            if (this.$dynamicHeaderObj[interfaceDefinedName]) this.$dynamicHeaderObj = {};
            let userConfigObj = this._getUserConfigObj(interfaceDefinedName);
            if (userConfigObj.requestConfig && userConfigObj.requestConfig.headers) this._getUserConfigObj(interfaceDefinedName).requestConfig.headers = {};
        } else {
            rain_logs.WARN("动态设置指定接口的请求头失败, 接口配置名为空");
        }
    }

    // 设置 token
    setToken(token) {
        if (this._customSetTokenFun) {
            this._customSetTokenFun(token, this);
        } else if (this.$isUniApp) {
            uni.setStorageSync("token", token);
        } else if (this.rbjGlobalThis.localStorage) {
            this.rbjGlobalThis.localStorage.setItem("token", token);
        } else {
            rain_logs.WARN("当前设备不支持 localStorage, 可以自定义设置 token 函数");
        }
    }

    // 获取 token
    getToken() {
        if (this._customGetTokenFun) {
            return this._customGetTokenFun(this);
        } else if (this.$isUniApp) {
            return uni.getStorageSync("token");
        } else if (this.rbjGlobalThis.localStorage) {
            return this.rbjGlobalThis.localStorage.getItem("token");
        } else {
            rain_logs.WARN("当前设备不支持 localStorage, 可以自定义设置 token 函数");
        }
    }

    // 移除 token
    removeToken() {
        if (this._customGetTokenFun) {
            return this._customRemoveTokenFun(this);
        } else if (this.$isUniApp) {
            uni.removeStorageSync("token");
        } else if (this.rbjGlobalThis.localStorage) {
            return this.rbjGlobalThis.localStorage.removeItem("token");
        } else {
            rain_logs.WARN("当前设备不支持 localStorage, 可以自定义设置 token 函数");
        }
    }

    // 将 axios 加强过的此方法 绑定到 Vue 的实例上
    _useAxios(obj) {
        if (this.getToken()) obj.headers.Authorization = this.getToken();
        if (this.$isUniApp) {
            obj.header = obj.headers;
            return uni.request(obj);
        } else if (this.$useFetch) {
            return fetch(obj.url, obj);
        } else {
            return axios(obj);
        }
    }

    // 动态设置全局函数
    setGlobalFun(funName, func) {
        this.globalFun[funName] = func;
    }

    // 设置全局组件
    _globalComponentFun(VueObj) {
        if (this.$globalComponent) {
            // require.context() 形式
            if (Array.isArray(this.$globalComponent)) {
                this.$globalComponent.forEach((item) => {
                    if ("default" in item) {
                        let componentName = item.default.name;
                        if (componentName) {
                            VueObj.component(componentName, item.default);
                        } else {
                            rain_logs.ERROR(item.default, " 组件没有定义 name 属性");
                        }
                    } else {
                        let componentName = item.name;
                        if (componentName) {
                            VueObj.component(componentName, item);
                        } else {
                            rain_logs.ERROR(item, " 组件没有定义 name 属性");
                        }
                    }
                });
            } else {
                // import.meta.glob() 形式
                for (const key in this.$globalComponent) {
                    if ("default" in this.$globalComponent[key]) {
                        let componentName = this.$globalComponent[key].default.name;
                        if (componentName) {
                            VueObj.component(componentName, this.$globalComponent[key].default);
                        } else {
                            rain_logs.ERROR(this.$globalComponent[key].default, " 组件没有定义 name 属性");
                        }
                    } else {
                        let componentName = this.$globalComponent[key].name;
                        if (componentName) {
                            VueObj.component(componentName, this.$globalComponent[key]);
                        } else {
                            rain_logs.ERROR(this.$globalComponent[key], " 组件没有定义 name 属性");
                        }
                    }
                }
            }
        }
    }

    // 初始化函数
    _initFun() {
        rain_logs.version_logs(packages.version, packages.repository.url, "rgb(255, 154, 38)");
        this.$falseDataMode ? rain_logs.ALL("当前模式: API 模拟数据模式, 运行环境: " + process.env.NODE_ENV) : rain_logs.ALL("当前模式: API 请求模式, 请求地址: ", this.$reqAddress, ", 运行环境: " + process.env.NODE_ENV);
        if (this.$userConfig === undefined || this.$userConfig == null) rain_logs.WARN("注意: ----||||||||------- 检测不到配置的 userConfig 属性, 所有请求接口不可用 -------||||||||----");
    }

    // Vue 安装插件的方法
    install(Vue, ...val) {
        this._initFun();
        let vue_version = Vue.constructor.version ? Vue.constructor.version.substring(0, 1) : Vue.version.substring(0, 1);
        if (vue_version === "2") {
            this._globalComponentFun(Vue);
            Vue.prototype.$rbj = this;
            Vue.prototype.$rbj.logs = rain_logs;
            Vue.prototype.$rbj.customRequest = this._useAxios;
            Vue.prototype.$rbj.assistFun = assistFun;
            Vue.prototype.$rbj.StreamConversion = StreamConversion;
        } else if (vue_version === "3") {
            this._globalComponentFun(Vue);
            Vue.config.globalProperties.$rbj = this;
            Vue.provide("rbj", this);
            Vue.config.globalProperties.$rbj.logs = rain_logs;
            Vue.config.globalProperties.$rbj.customRequest = this._useAxios;
            Vue.config.globalProperties.$rbj.assistFun = assistFun;
            Vue.config.globalProperties.$rbj.StreamConversion = StreamConversion;
        } else {
            rain_logs.WARN("当前项目不兼容此 ButtJoint 插件");
        }
    }

    // 将 rbj 对象手动安装到 任何指定的对象上, 例如: 可以安装到, 全局的 window 对象上, 来全局使用 window 对象
    // 注意: 手动安装不支持 全局组件功能
    Install_rbj(useToolObj, ...val) {
        this._initFun();
        useToolObj.$rbj = this;
        useToolObj.$rbj.logs = rain_logs;
        useToolObj.$rbj.customRequest = this._useAxios;
        useToolObj.$rbj.assistFun = assistFun;
        useToolObj.$rbj.StreamConversion = StreamConversion;
    }

    // 空数据过滤补全字符串的方法
    dataFilter(data, nullStr) {
        this._tempNullString = nullStr;
        let copyData;
        this._$rain_object_copy(data, (copyData = Array.isArray(data) ? [] : typeof data == "object" ? {} : {}));
        return copyData;
    }

    // 深拷贝
    _$rain_object_copy(g, h) {
        for (const s in g) {
            if (Array.isArray(g[s])) {
                this._$rain_object_copy(g[s], (h[s] = []));
            } else if (typeof g[s] == "object") {
                this._$rain_object_copy(g[s], (h[s] = {}));
            } else {
                if (g[s] || g[s] == 0) {
                    h[s] = g[s];
                } else {
                    h[s] = this._tempNullString || this.$setNullString || "-暂无数据-";
                }
            }
        }
    }
}
