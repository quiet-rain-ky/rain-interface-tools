/**
 * @author   作者: Rain
 * @date 创建于 2023年 02月25日  11:25:07  星期六
 * @file_path  文件磁盘路径: E:\repository\rain-interface-tools\src\uniappRbjVueTwo.js
 * @file_path  文件项目路径: src\uniappRbjVueTwo.js
 * @description uniapp Vue2 兼容对象
 */
import interfaceButtJoint from "./interfaceButtJoint.js";
import rain_logs from "./logs.js";
import StreamConversion from "./streamConversion.js";
import assistFun from "./assist.js";

export default class uniappRbjVueTwo extends interfaceButtJoint {
    // Vue 安装插件的方法
    install(Vue, ...val) {
        // #ifndef APP-NVUE
        this._initFun();
        this._globalComponentFun(Vue);
        Vue.prototype.$rbj = this;
        Vue.prototype.$rbj.logs = rain_logs;
        Vue.prototype.$rbj.customRequest = this._useAxios;
        Vue.prototype.$rbj.assistFun = assistFun;
        Vue.prototype.$rbj.StreamConversion = StreamConversion;
        // #endif
    }
}
