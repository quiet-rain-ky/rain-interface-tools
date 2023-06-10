import { interfaceButtJoint } from "./types/interfaceButtJoint";
import { uniRbjVueTwo } from "./types/uniRbjVueTwo";
import { uniRbjVueThere } from "./types/uniRbjVueThere";
import streamConversion from "./types/streamConversion";
import assist from "./types/assist";
import logs from "./types/logs";

/**
 * 全局函数对象类型
 */
declare interface globalFunType {
    /**
     * 在当前全局函数对象中, 可以直接利用 this 关键字, 来引用 rbj 对象, 例如: this.$rbj...
     */
    $rbj: RbjVueType;
}

// 定义 Vue 的 Rbj 类型接口, 让接口继承类, 这样 类就有了和接口一样的特性
export declare interface RbjVueType<GLOBAL_FUN_TYPE = globalFunType> extends interfaceButtJoint<GLOBAL_FUN_TYPE> {
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
    assistFun: assist;
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
    const $rbj: RbjVueType;
    // 定义 window 对象内的 rbj 类型
    interface Window {
        $rbj: RbjVueType;
    }
    // 定义全局的 globEager 函数, 防止让 typeScript 报错
    interface ImportMeta {
        globEager(pattern: string): Record<string, any>;
    }
}

declare module "rain-interface-tools" {
    /**
     * 核心类
     */
    export class Rbj<GLOBAL_FUN_TYPE = globalFunType> extends interfaceButtJoint<GLOBAL_FUN_TYPE> { }
    /**
     * @description 融合多个 (普通接口对象) 或 (模块接口对象), 也可以直接对单个模块接口对象进行处理
     * @param requestObj 可以是数组或对象
     */
    export function importsConfigObj(requestObj: Array<any> | object): object;
    /**
     * 导出已继承核心类的 uniapp Vue2 对象
     */
    export class UniRbjTwo<GLOBAL_FUN_TYPE = globalFunType> extends uniRbjVueTwo<GLOBAL_FUN_TYPE> { }
    /**
     * 已继承核心类的 uniapp Vue3 对象
     */
    export class UniRbjThere<GLOBAL_FUN_TYPE = globalFunType> extends uniRbjVueThere<GLOBAL_FUN_TYPE> { }
    /**
     * 日志对象
    */
    export const logObj: logs;
    /**
     * 流数据转换类, 支持 base64, file, blob, arrayBuffer, canvas 互转
     */
    export const StreamConversion: streamConversion;
    /**
     * 辅助函数
     */
    export const assistFun: assist;
}
