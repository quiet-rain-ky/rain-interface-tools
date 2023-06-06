import { interfaceButtJoint } from "./types/interfaceButtJoint";
import { uniRbjVueTwo } from "./types/uniRbjVueTwo";
import { uniRbjVueThere } from "./types/uniRbjVueThere";
import streamConversion from "./types/streamConversion";
import assist from "./types/assist";
import logs from "./types/logs";

// 定义接口, 让接口继承类, 这样 类就有了和接口一样的特性
export declare interface RbjVueType extends interfaceButtJoint {
    /**
     * 流数据转换类, 支持 base64, file, blob, arrayBuffer, canvas 互转
     */
    StreamConversion: streamConversion;
    /**
     * 日志对象
     */
    logs: logs;
    /**
     * 辅助函数
     */
    assistFun: assist
}

// 扩展 vue 的类型, 让插件在 Vue 的组件内有提示效果
declare module "vue/types/vue" {
    // 扩展 Vue2 的类型
    interface Vue {
        $rbj: RbjVueType;
    }
}
declare module "vue" {
    // 扩展 Vue3 的类型
    interface ComponentCustomProperties { // 这种方式只针对 Vue3, Vue2 不支持
        $rbj: RbjVueType
    }
}

// 扩展全局类型
declare global {
    // 全局定义 rbj 类型
    const $rbj: RbjVueType
}

declare module "rain-interface-tools" {
    /**
     * 核心类
     */
    export class Rbj extends interfaceButtJoint { }
    /**
     * @description 融合多个 (普通接口对象) 或 (模块接口对象), 也可以直接对单个模块接口对象进行处理
     * @param requestObj 可以是数组或对象
     */
    export function importsConfigObj(requestObj: Array<any> | object): object;
    /**
     * 导出已继承核心类的 uniapp Vue2 对象
     */
    export class UniRbjTwo extends uniRbjVueTwo { }
    /**
     * 已继承核心类的 uniapp Vue3 对象
     */
    export class UniRbjThere extends uniRbjVueThere { }
    /**
     * 日志对象
     */
    export let logObj: logs;
}
