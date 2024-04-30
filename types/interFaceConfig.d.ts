import { interfaceButtJoint } from "./interfaceButtJoint";
/**
 * 非模块化接口配置
 */
declare interface interFaceConfig<GLOBAL_FUN_TYPE> {
    [index: string]: string | {
        /**
         * (可选) 接口描述说明, 一般用作提示使用
         */
        description?: string;
        /**
         * 自定义当前接口的请求服务地址(注意: 自定义当前接口的请求服务地址时, 必须要带上 http:// 或 https:// 协议前缀), 默认使用全局的 reqAddress 路径
         */
        reqAddress?: string;
        /**
         * 当全局是别的请求对象时是否临时使用 fetch 为请求对象, 注意: 当处于 uniapp 项目时此选项不可用
         */
        tempUseFetch?: boolean;
        /**
         * 当前接口是否开启模拟数据模式, 开启后 接口不再发送请求, 我们可以在接口配置的 interfaceData() 函数中, 自定义一些模拟数据返回, 并在组件中使用, 默认值: false
         * 注意: 当前接口的 falseDataMode 配置属性, 比全局 falseDataMode 配置属性的优先级高, 当然前提是你在当前接口设置了 falseDataMode 属性的情况下, 如果没有在当前接口设置 falseDataMode 则默认以全局的 falseDataMode 配置属性为主
         * 注意: 假数据模式下, 接口的数据变成了自定义的模拟数据, autoButtJoint() 和 buttJoint() 函数在接收请求数据时, 接收的数据也会变成我们自定义的模拟数据
         */
        falseDataMode?: boolean;
        /**
         * 设置请求路径, 示例: /user/info
         */
        url: string;
        /**
         * 请求的方法类型, 注意: GET 方法默认是 application/x-www-form-urlencoded 的方式, 进行传参, POST 默认是 application/json 的形式, 进行传参
         */
        method: string;
        /**
         * 当前接口的请求配置对象
         */
        requestConfig?: {
            /**
             * 配置当前接口的请求头
             */
            headers?: {
                /**
                 * 注意: 设置属性名时, 必须加上双引号, 才会生效, 示例: "Content-Type": "application/x-www-form-urlencoded"
                 */
                [index: string]: string;
            };
        };
        /**
         * 当声明了此函数时 会对参数进行过滤, 此函数返回什么数据, 请求时就发送什么样的参数给服务器
         * @param data | Object 说明: data 包含 paramsObj 主体参数, pathParams 路径参数, 可以直接修改 data 对象中 属性的引用数据, 进行达到修改请求参数的作用
         * @param rbjObj 当前 rbj 对象的实例
         * @param operandObj | Object 说明: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         * @param isAppendData | boolean 说明: 当前接口是否处于追加模式, 非自动对接时此值为 null, 注意: 处于自动对接时除非你在 autoButtJoint() 的 options 对象中设置了此 isAppendData 属性, 否则此处的 isAppendData 还是为空
         * @param frontORback | boolean 说明: 处于追加模式时, 确认向前追加数据 还是 向后追加数据, 非自动对接时此值为 null, 默认值: false 向后追加
         * @return 如有返回值请按照 {paramsObj: {}, pathParams: ""} 的格式进行返回
         * <p>
         * 注意: 本函数只具有, 修改请求参数的功能, 不具备拦截并中断请求的功能
         * </p>
         */
        paramsData?(data: { paramsObj: any, pathParams: string }, rbjObj: interfaceButtJoint<GLOBAL_FUN_TYPE>, operandObj: object, isAppendData: boolean, frontORback: boolean): {
            /**
             * 此返回值对 paramsObj 参数对象进行重新设置
             */
            paramsObj: object;
            /**
             * 此返回值对 pathParams 参数进行重新设置
             */
            pathParams: string;
        } | void; // void 代表这个函数可以不 return 返回数据
        /**
         * @description 过滤响应数据, 不管是 buttJoint() 手动对接, 还是 autoButtJoint() 自动对接, 此 interfaceData() 函数都会运行(即都可以正常的进行响应数据的过滤操作)
         * @param data 响应的数据对象
         * @param rbjObj 当前 rbj 对象的实例
         * @param operandObj | Object 说明: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         * @return 数据对接操作, 返回什么数据, 组件中的数据就会接收什么数据
         * <p>
         * 注意: 本函数只具有修改响应数据的功能, 不具有拦截响应的功能
         * 注意: 如果 return 返回的是未定义的属性 或 undefined , Rbj插件对象则会当作此函数没有返回数据, 且响应的数据会不经过 interfaceData 函数的过滤, 直接返回的页面上, 所以 return 前最好先判断一个返回的属性是否存在
         * 注意: 如果返回的是 null, Rbj插件对象则会当作此函数已返回数据, 即 返回 null 是有效的
         * </p>
         */
        interfaceData?(data: any, rbjObj: interfaceButtJoint<GLOBAL_FUN_TYPE>, operandObj: object): Object | void; // void 代表这个函数可以不 return 返回数据
    }
}

export default interFaceConfig;