/**
 * @author   作者: Rain
 * @date 创建于 2023年 02月25日  11:24:42  星期六
 * @file_path  文件磁盘路径: E:\repository\rain-interface-tools\src\uniappRbjVueThere.js
 * @file_path  文件项目路径: src\uniappRbjVueThere.js
 * @description uniapp Vue3 兼容对象
 */
import interfaceButtJoint from "./interfaceButtJoint.js";
import rain_logs from "./logs.js";
import StreamConversion from "./streamConversion.js";
import assistFun from "./assist.js";

export default class uniappRbjVueThere extends interfaceButtJoint {
    // Vue 安装插件的方法
    install(Vue, ...val) {
        // #ifndef APP-NVUE
        this._initFun();
        this._globalComponentFun(Vue);
        Vue.config.globalProperties.$rbj = this;
        Vue.provide("rbj", this);
        Vue.config.globalProperties.$rbj.logs = rain_logs;
        Vue.config.globalProperties.$rbj.customRequest = this._useAxios;
        Vue.config.globalProperties.$rbj.assistFun = assistFun;
        Vue.config.globalProperties.$rbj.StreamConversion = StreamConversion;
        // #endif
    }
}
