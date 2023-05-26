import { RbjVueType } from "../main";
import interFaceConfig from "./interFaceConfig";

/**
 * 全局函数对象类型
 */
declare interface globalFunType {
    /**
     * 在当前全局函数对象中, 可以直接利用 this 关键字, 来引用 rbj 对象, 例如: this.$rbj...
     */
    $rbj: RbjVueType;
}

/**
 * 自动对接引用标记对象
 */
declare interface autoQuoteMark {
    /**
     * @description 给当前接口定义, 分组类型的 flag 刷新标记
     * @param groupName 给当前接口定义 group 组标记
     * @param uniqueTagName 给当前接口在刷新组内定一个，不重复的唯一标识
     */
    refRefreshGroup(groupName: string, uniqueTagName: string): autoQuoteMark;
    /** 
     * @description 给当前接口定义 flag 刷新标记
     * @param freshTagName 给当前接口在刷新组内定一个，不重复的唯一标识
     */
    refRefreshFlag(freshTagName: string): autoQuoteMark;
}

/**
 * 手动对接引用标记对象
 */
declare interface QuoteMark extends Promise<any>, autoQuoteMark { }

/**
 * 正则参数对象类型
 */
declare interface interceptorRegular {
    /**
     * @description 正则表达式
     */
    str: string;
    /**
     * @description 正则的验证模式, 示例: 'g' 全局模式...
     */
    pattern: string;
}

/**
 * 定义拦截器对象类型
 */
declare interface interceptorArrType {
    /**
     * @description 正则表达式, string 类型, 只对用户接口配置对象中的请求路径进行正则验证拦截, 不包括 https 协议 和 域名主机地址
     */
    regular: string | interceptorRegular | Array<interceptorRegular> | Array<string>,
    /**
     * @description 正则反转拦截, 会拦截验证失败的, 放行验证成功的, 默认: false 不进行反转操作
     */
    reversalVerify: boolean,

    /**
     * @description 请求拦截器
     * @param reqParams 当前请求的参数对象, 可以直接对参数的数据进行设置, 以此来改变请求的参数数据
     * @param pathParams 路径参数
     * @param regularData 上一个请求拦截器 return 返回值
     * @param rbjObj 当前 rbj 对象的实例
     * @param currentUserConfigObjData 当前用户的配置数据对象
     * @param operandObj 自动化对接时要操作的对象, 非自动对接时此值为 null
     * @returns boolean 当你返回 boolean, 会进行拦截或放行
     */
    requestRegular(reqParams: object, pathParams: string, regularData: object, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): any;

    /**
     * @description 响应拦截器
     * @param respData 当前请求的响应数据
     * @param regularData 上一个响应拦截器 return 返回值
     * @param rbjObj 当前 rbj 对象的实例
     * @param currentUserConfigObjData 当前用户的配置数据对象
     * @param operandObj 自动化对接时要操作的对象, 非自动对接时此值为 null
     * @returns 当你返回 boolean, 会进行拦截或放行, 返回非 boolean, 会进行数据过滤操作
     */
    responseRegular(respData: object | Array<any>, regularData: object, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): any;
}

/**
 * 声明构造参数类型
 */
declare interface configParamsType {
    /**
     * 请求的主机地址, 默认值: "localhost:8080", 当需要使用 https 时, 可以直接在请求地址前面加 https://localhost:8080
     */
    reqAddress?: string;
    /**
     * 用户的数据对接配置文件, userConfigs 即直接导入的对象, configObj 即 使用上方的 importsConfigObj 函数导入多个 js 文件合成的对象, 两种方式可任选其一即可
     */
    userConfig?: interFaceConfig;
    /**
     * 设置全局组件, 注意: 自定义的全局组件必须要有 name 属性, 作用: 即是全局组件的名字, 也是全局组件的标签名
     */
    globalComponent?: object;
    /**
     * 是否全局使用 fetch 为 数据请求对象, 默认值: false
     * 注意: fetch 请求是不进行空数据过滤的
     */
    useFetch?: boolean;
    /**
     * 控制台是否进行日志输出, 默认值: false
     */
    logs?: boolean;
    /**
     * 控制台打印的日志是否, 携带样式进行输出, 此配置需搭配上方的 logs 属性配置进行使用, 且此样式仅在 H5模式 下才能正常生效, 默认值: false
     */
    isLogStyle?: boolean;
    /**
     * 是否开启假数据模式, 默认值: false
     */
    falseDataMode?: boolean;
    /**
     * 全局请求配置函数
     * @param rbjObj | 即 Rbj 对象
     */
    globalRequestConfig?: (rbjObj: RbjVueType) => {
        /**
         * 设置全局请求头
         */
        headers: object;
    };
    /**
     * 配置请求响应时, 对响应的数据进行过滤时的空值补全字符串, 也可以调用 dataFilter() 函数对指定的数据对象进行空值过滤, 注意: 默认不进行响应时的空值过滤
     */
    setNullString?: string;
    /**
     * 开启请求数据的缓存模式 (开启后假数据模式也会生效), 默认值: false
     * 缓存模式的主要作用是对接口请求后的数据进行一个临时缓存 可以使用 getCacheData("接口配置名") 函数, 来获取指定接口临时缓存的数据, 临时缓存是时效是同一个接口的下一次请求之前都可以获取, 因为同一个接口的下一次请求的数据会覆盖这个临时缓存的数据
     */
    isEnableCache?: boolean;
    /**
     * 设置拦截器, 根据正则表达式, 对指定的请求进行拦截或放行, 数组类型, 数组中可以设置多个拦截器对象
     * 注意: 只对用户接口配置对象中的请求路径进行正则验证拦截, 不包括 https 协议 和 域名主机地址
     */
    interceptor?: Array<interceptorArrType>;
    /**
     * 全局, 请求过滤器函数
     * @param reqParams 当前请求的参数对象, 可以直接对参数的数据进行设置, 以此来改变请求的参数数据
     * @param pathParams 路径参数
     * @param rbjObj 当前 rbj 对象的实例
     * @param currentUserConfigObjData 当前用户的配置数据对象
     * @param operandObj 自动化对接时要操作的对象, 非自动对接时此值为 null
     * @returns boolean 当你返回 boolean, 会进行拦截或放行
     */
    globalRequestFilterFun?: (reqParams: object, pathParams: string, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object) => any;
    /**
     * 全局, 响应过滤器函数
     * @param respData 当前请求的响应数据
     * @param rbjObj 当前 rbj 对象的实例
     * @param currentUserConfigObjData 当前用户的配置数据对象
     * @param operandObj 自动化对接时要操作的对象, 非自动对接时此值为 null
     * @returns 当你返回 boolean, 会进行拦截或放行, 返回非 boolean, 会进行数据过滤操作
     */
    globalResponseFilterFun?: (respData: object | Array<any>, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object) => any;
    /**
     * 初始化全局自定义调用函数, 可以在任何组件内使用 this.$rbj.globalFun.自定义的函数名(); 来调用
     * 注意: 也可以自定义一些, 常用的全局变量, 也可以用 this.$rbj.globalFun.变量名, 的方式来调用
     */
    globalFun?: globalFunType;
    /**
     * 自定义 token 在请求头上的名字，默认值："Authorization"
     */
    tokenName?: string,
    /**
     * 自定义设置 token 方式的函数
     * 参数1: 要进行设置的 token 字符串
     * 参数2: 当前 rbj 实例对象
     * 注意: 有默认设置 token 的函数, 所以也可以不进行设置
     * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认设置 token 函数的执行
     */
    customSetTokenFun?: (rbjObj: RbjVueType) => void;
    /**
     * 自定义获取 token 方式的函数
     * 参数: 当前 rbj 实例对象
     * @return 注意: 自定义获取方式后需要返回获取的 token 字符串
     * 注意: 有默认获取 token 的函数, 所以也可以不进行设置
     * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认获取 token 函数的执行
     */
    customGetTokenFun?: (rbjObj: RbjVueType) => string;
    /**
     * 自定义移除 token 方式的函数
     * 参数: 当前 rbj 实例对象
     * 注意: 有默认移除 token 的函数, 所以也可以不进行设置
     * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认移除 token 函数的执行
     */
    customRemoveTokenFun?: (rbjObj: RbjVueType) => void;
}

/**
 * 系统接口对接工具类
 */
export declare class interfaceButtJoint {
    /**
     * @description rbj 的全局函数变量对象
     * <p>
     * 初始化全局自定义调用函数, 可以在任何组件内使用 this.$rbj.globalFun.自定义的函数名(); 来调用
     * 注意: 也可以自定义一些, 常用的全局变量, 也可以用 this.$rbj.globalFun.变量名, 的方式来调用
     * </p>
     */
    globalFun: globalFunType;

    /**
     * @description Rbj 类的构造函数
     * @param config Rbj 配置对象
     */
    constructor(config: configParamsType);

    /**
     * @description 对象转路径参数
     * @param pathObj 参数对象
     */
    objToPathParams(pathObj: object): void;

    /**
     * @description 路径参数转对象
     * @param urlPath 字符串路径参数
     * @return 返回转换后的对象
     */
    pathParamsToObj(urlPath: string): object;

    /**
     * @description 手动对接
     * @param interfaceDefinedName 接口配置名
     * @param paramsObj 请求参数对象, 可为 null
     * @param optionsObj 可选属性对象
     * @return 返回手动对接引用标记对象
     */
    buttJoint(interfaceDefinedName: String, paramsObj: Object, optionsObj?: {
        /**
         * 直接在路径上拼接字符串, get, post 都可以使用
         */
        pathParams?: string;
        /**
         * 是否对 post 请求的请求主体进行键值编码, 注意: 只针对 post 请求, get 请求无效, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此参数不可用
         */
        isUrlEncode?: boolean;
        /**
         * 注意: 当处于 uniapp 项目时此选项不可用
         */
        tempUseFetch?: boolean;
        /**
         * 全局过滤拦截回调函数对象 (注意: 仅对当前接口生效)
         */
        globalFilterInterCept?: {
            /**
             * @description 说明: 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
             * @param reqParams 当前请求的参数
             * @param pathParams 路径参数
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            requestCallback(reqParams: object, pathParams: string, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
            /**
             * @description 说明: 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
             * @param respData 当前请求的响应数据
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            responseCallback(respData: object | Array<any>, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
        },
        /**
         * 是否允许当前请求在请求头加上 token, 默认值: true 允许
         */
        isUseToken: boolean;
    }): QuoteMark;

    /**
     * @description 自动对接
     * @param interfaceDefinedName 接口配置名
     * @param paramsObj 请求参数对象, 可为 null
     * @param dataName 把数据装配到对象中的哪个属性上
     * @param currentObj 当前要进行装配数据的对象
     * @param optionsObj 可选属性对象
     * @return 返回自动对接引用标记对象
     */
    autoButtJoint(interfaceDefinedName: String, paramsObj: Object, dataName: String, currentObj: Object, optionsObj?: {
        /**
         * 直接在路径上拼接字符串, get, post 都可以使用
         */
        pathParams?: string,
        /**
         * @description 注意: 如果被全局过滤器或拦截器, 拦截住没有放行时, 此函数不会运行
         * @param data 响应的数据对象
         * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         * <p>
         * 此回调函数 和 用户的请求配置中的 interfaceData() 函数是一样的作用, 区别是 这个回调函数使用的是 interfaceData() 函数已经过滤返回的数据, 然后可以对其再次进行过滤
         * </p>
         */
        callbackFunc(data: object, operandObj: object): any | object;
        /**
         * 是否对 post 请求的请求主体进行键值编码, 默认值 false, 注意: 只针对 post 请求, get 请求无效, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此参数不可用
         */
        isUrlEncode?: boolean;
        /**
         * 注意: 当处于 uniapp 项目时此选项不可用, 默认值 false
         */
        tempUseFetch?: boolean;
        /**
         * 进行数据追加, 默认值 false
         */
        isAppendData?: boolean;
        /**
         * 向前追加数据, 还是向后追加数据, 默认值: false 向后追加数据, 注意: 需结合 isAppendData 使用
         */
        frontORback?: boolean;
        /**
         * 全局过滤拦截回调函数对象 (注意: 仅对当前接口生效)
         */
        globalFilterInterCept?: {
            /**
             * @description 说明: 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
             * @param reqParams 当前请求的参数
             * @param pathParams 路径参数
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            requestCallback(reqParams: object, pathParams: string, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
            /**
             * @description 说明: 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
             * @param respData 当前请求的响应数据
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            responseCallback(respData: object | Array<any>, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
        },
        /**
         * 是否允许当前请求在请求头加上 token, 默认值: true 允许
         */
        isUseToken: boolean;
    }): autoQuoteMark;

    /**
     * @description 自动刷新标记接口调用
     * @param freshTagName 标记名
     */
    refreshFlagInterface(freshTagName: String): void;

    /**
     * @description 自动刷新标记组内所有的接口调用
     * @param groupName 标记的组名
     */
    refreshGroupInterface(groupName: String): void;

    /**
     * @description 自动刷新标记组内指定的 flag 的接口调用
     * @param groupName 标记的组名
     * @param freshTagName 组内的标记名
     */
    refreshGroupFlagInterface(groupName: String, freshTagName: String): void;

    /**
     * @description 删除刷新标记
     * @param freshTagName 标记名
     */
    refreshFlagTagDelete(freshTagName: String): void;

    /**
     * @description 删除组刷新标记
     * @param freshTagName 标记名
     */
    refreshGroupTagDelete(freshTagName: String): void;

    /**
     * @description 删除组内指定的 flag 刷新标记
     * @param groupName 标记的组名
     * @param freshTagName 组内的标记名
     */
    refreshGroupFlagTagDelete(groupName: String, freshTagName: String): void;

    /**
     * @description 删除全部的刷新标记
     */
    refreshFlagTagDeleteAll(): void;

    /**
     * @description 删除标记组全部的刷新标记
     */
    refreshGroupTagDeleteAll(): void;

    /**
     * @description 删除全部的刷新标记
     */
    refreshTagDeleteAll(): void;

    /**
     * @description 文件上传
     * @param interfaceDefinedName 用户接口配置名
     * @param Files File 对象 或 File 数组对象
     * @param optionsObj 可选的参数对象
     * @return 返回 Promise 对象
     * <p>
     * 注意: 当你处于 fetch 请求模式, 进行文件上传时, 你设置的请求头将会失效, 解释说明: 因为 fetch 请求进行文件上传时如果设置请求头, 则会导致上传文件失败, 也就是说如果你使用 fetch 进行文件上传则不能在请求头上带 token 或其他参数
     * </p>
     */
    upload(interfaceDefinedName: String, Files: Object, optionsObj?: {
        /**
         * 文件上传时附带的参数
         */
        paramsObj?: object;
        /**
         * 文件上传时文件的属性名, 默认值: "file"
         */
        reqPropertyName?: string;
        /**
         * (是否使用 filePath (即 单个临时路径) 进行文件上传, 此选项只针对 uniapp) 注意: uniapp 中必须此将此参数 设置为 true 文件才能上传成功
         */
        isFilePathUpload?: boolean;
        /**
         * 全局过滤拦截回调函数对象 (注意: 仅对当前接口生效)
         */
        globalFilterInterCept?: {
            /**
             * @description 说明: 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
             * @param reqParams 当前请求的参数
             * @param pathParams 路径参数
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            requestCallback(reqParams: object, pathParams: string, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
            /**
             * @description 说明: 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
             * @param respData 当前请求的响应数据
             * @param rbjObj 当前 rbj 对象的实例
             * @param currentUserConfigObjData 当前用户的配置数据对象
             * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @return 此函数不需要返回值
             */
            responseCallback(respData: object | Array<any>, rbjObj: RbjVueType, currentUserConfigObjData: object, operandObj: object): void;
        },
        /**
         * 是否允许当前请求在请求头加上 token, 默认值: true 允许
         */
        isUseToken: boolean;
    }): Promise<any>;

    /**
     * @description 获取缓存的数据
     * @param params 接口配置名
     * @return 返回响应的数据对象
     */
    getCacheData(params: string): object | any;

    /**
     * 动态获取全局请求头对象
     */
    getDynamicGlobalHeader(): object;

    /**
     * @description 动态追加设置全局请求头的属性
     * @param attributeName 属性名
     * @param attributeVal 属性值
     */
    dynamicAddSetGlobalHeader(attributeName: string, attributeVal: string): void;

    /**
     * @param attributeName 属性名
     * @description 删除全局请求头的指定属性
     */
    dynamicDeleteGlobalHeader(attributeName: string): void;

    /**
     * 动态删除全部, 全局请求头的属性
     */
    dynamicClearAllGlobalHeader(): void;

    /**
     * 动态获取指定接口的请求头对象 (注意: 不包括全局请求头)
     */
    getDynamicInterfaceHeader(): object;

    /**
     * @param interfaceDefinedName 接口配置名
     * @param attributeName 属性名
     * @param attributeVal 属性值
     * @description 动态追加设置指定接口的请求头属性 (要在具体的接口请求之前运行)
     */
    dynamicAddSetInterfaceHeader(interfaceDefinedName: string, attributeName: string, attributeVal: string): void;

    /**
     * @param interfaceDefinedName 属性名
     * @param attributeName 属性值
     * @description 动态删除指定接口的请求头属性(要在具体的接口请求之前运行)
     */
    dynamicDeleteInterfaceHeader(interfaceDefinedName: string, attributeName: string): void;

    /**
     * @param interfaceDefinedName 接口配置名
     * @description 动态删除指定接口的所有请求头属性(要在具体的接口请求之前运行), 注意: 不包括全局请求头设置的属性
     */
    dynamicClearAllInterfaceHeader(interfaceDefinedName: string): void;

    /**
     * @description 设置 token
     * @param token 即 token 字符串
     */
    setToken(token: string): void;

    /**
     * @description 获取 token
     */
    getToken(): void;

    /**
     * @description 移除 token
     */
    removeToken(): void;

    /**
     * @description 动态设置全局函数
     * @param funName 自定义函数名
     * @param func 自定义的全局函数
     */
    setGlobalFun(funName: string, func: Function): void;

    /**
     * @description 将 rbj 对象手动安装到 任何指定的对象上, 例如: 可以安装到, 全局的 window 对象上, 来全局使用 window 对象, 注意: 手动安装不支持 全局组件功能
     */
    Install_rbj(useToolObj: object, ...val: any): void;

    /**
     * @description 空数据过滤补全字符串的方法
     * @param data 要进行过滤的数据
     * @param nullStr 用来补全空的字符串
     * @return 返回空值补全后的数据对象
     */
    dataFilter(data: object, nullStr: string): any;
}
