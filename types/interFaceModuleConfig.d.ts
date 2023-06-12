import interFaceConfig from "./interFaceConfig";
/**
 * 模块化接口配置
 */
declare interface interFaceModuleConfig {
    /**
     * (可选) 仅用作控制台错误提示使用
     */
    moduleName?: string;
    /**
     * (可选) 默认为空, 即设置当前接口对象的模块路径, 会自动添加到请求服务器地址 reqAddress 的后面 和 每个接口 url 的前面, 仅对于当前模块对象中的 interfaceList 接口列表中的接口生效
     */
    moduleUrl?: string;
    /**
     * 接口列表
     */
    interfaceList: interFaceConfig;
}

export default interFaceModuleConfig;