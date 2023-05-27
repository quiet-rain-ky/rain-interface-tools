# rain-interface-tools

## 介绍

这是一个前端页面接口工具, 简化后台数据接口对接时的步骤, 支持 H5 和 uniapp 的使用

## 安装

npm install rain-interface-tools -D

## 简单使用

### 创建配置目录和文件

```js
1. 在 根目录创建 /config/subConfig
2. 在 /config 目录中创建 index.js 文件
3. 在 /config/subConfig 目录下创建一些自定义的接口文件

注意：目录名可以不一样上方只是示例，但在使用 require.context() 和 import.meta.globEager() 时, 注意要修改扫描的文件路径
```

### /config/subConfig/xxx.js

```js
/**
 * @description 这是接口配置文件， 接口配置文件可以有多个, 但是最后都要使用 importsConfigObj() 来融合到一起，因为需要融合到一起，所以尽量不要让每个接口的配置名重复
 * @type {import('rain-interface-tools/types/interFaceConfig').default}
 * 说明: @type 用作类型提示使用, 上方的 @type 是非模块化类型提示, 模块化配置可以使用 @type {import('rain-interface-tools/types/interFaceModuleConfig').default} 来进行类型提示
 * 注意: 接口的配置名是自定义的, 所以不会有类型提示
 */
export default { // 注意: 这里演示, 使用的是非模块化接口配置对象, 你也可以使用 模块化接口配置对象
    // 定义接口时, 不要出现相同的配置名, 当有相同配置名的接口时, 下方的接口会覆盖上方的接口, 因为最后所有的接口都会融合到一起, 所以就算是不同的接口文件, 也不能有相同的配置名
    one: {
        description: "接口描述说明", // (可选) 接口描述说明, 一般用作提示使用
        url: "/one/one", // 接口的请求路径
        method: "GET", // 接口的请求方法类型
        paramsData(data, operandObj) {
            // data 请求的参数数据
        },
        interfaceData(data, operandObj) {
            // data 响应的参数数据
        }
    },
    upload: { // 定义文件上传接口
        description: "接口描述说明", // (可选) 接口描述说明, 一般用作提示使用
        url: "/upload/fileUpload", // 接口的请求路径
        method: "POST", // 接口的请求方法类型
        paramsData(data, operandObj) {
            // data 请求的参数数据
        },
        interfaceData(data, operandObj) {
            // data 响应的参数数据
        }
    }
}
```

### /config/globalFun.js

```js
/**
 * @type {import('rain-interface-tools/types/interfaceButtJoint').globalFunType} 说明: @type 用作类型提示使用
 */
export default {
    // 设置默认值
    dfVal(data, defaultVal = "暂无数据") {
        return data ? data : defaultVal;
    }
}
```

### /config/index.js

```js
import {  Rbj, UniRbjTwo, UniRbjThere, importsConfigObj } from "rain-interface-tools";
import globalFun from "./globalFun.js";
// 把 /config/subConfig/ 目录下的所有的接口配置文件都导入进来，注意：目录路径和下方配置的不一致的需要修改要进行扫描的文件路径
// --- vue2 使用此项 ---
const configObj = importsConfigObj(require.context("configs/subConfig/", true, /.js$/).keys().map(item => require("configs/subConfig/" + item.substr(2, item.length)))); // require.context() 会扫描指定目录下的所有文件, 仅在 Vue2 使用
// --- vue3 使用此项 ---
const configObj = importsConfigObj(import.meta.globEager("configs/subConfig/**.js")); // import.meta.globEager() 会扫描指定目录下的所有文件, 仅在 Vue3 使用


// 创建 rbj 插件对象, 注意：uniapp 项目可以使用 UniRbjTwo 或 UniRbjThere 对象来进行创建
export default new Rbj({ // 导出此插件, 在 main.js 文件中, 安装此插件
    reqAddress: "https://xxx.xxx.com", // 接口请求的服务器地址
    userConfig: configObj, // 设置接口配置
    logs: process.env.NODE_ENV === "development",
    tokenName: "token", // 自定义 token 在请求头上的名字, 默认名字为: Authorization
    globalFun: globalFun // 自定义全局函数
});
```

### /main.js

```js
import Rbj from "configs/index.js";
Vue.use(Rbj); // 把 rain-interface-tools 插件, 安装到 Vue 上
```

### App.vue

```vue
<template>
 <div>
  <text>{{oneData}}</text>
        <img :src="imgUrl"></img>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                oneData: {},
                oneParams: {
                    name: "xxx",
                    age: 20
                },
                imgUrl: "",
            }
        },
        mounted() {
            let self = this;
            
            // 使用自动装配接口数据的请求函数
            this.$rbj.autoButtJoint("one", this.oneParams, "oneData", this);
            
            // 也可以手动装配数据
            this.$rbj.buttJoint("one", this.oneParams).then((resData)=>{
                // resData 即 响应的数据
                self.oneData = resData;
            });
            
            // 上方两种请求方式二选一即可

            // 使用文件上传函数
            this.$rbj.upload("upload", fileObj, { reqPropertyName: "file", isFilePathUpload: true }).then((resData)=>{
                // resData 即 服务器响应的数据
                self.imgUrl = resData;
            });
        }
    }
</script>

<style lang="scss">
</style>
```

### uniapp Nvue 使用说明

```vue
<template>
    <div>
        <text>{{oneData}}</text>
        <img :src="imgUrl"></img>
    </div>
</template>
<script>
    import rbj from "../../configs/index.js"; // 导入上方指定路径的 rbj 核心对象, 注意: 核心对象不包括 rbj日志对象, 所以要想使用 rbj 日志对象, 我们需要单独导入日志对象
    import { logObj } from "rain-interface-tools"; // 导入 rbj 日志对象
    export default {
        data() {
            return {
                oneData: {},
                oneParams: {
                    name: "xxx",
                    age: 20
                },
                imgUrl: "",
            }
        },
        mounted() {
            let self = this;
            
            // 使用自动装配接口数据的请求函数
            rbj.autoButtJoint("one", this.oneParams, "oneData", this);
            
            // 也可以手动装配数据
            rbj.buttJoint("one", this.oneParams).then((resData)=>{
                // resData 即 响应的数据
                self.oneData = resData;
            });
            
            // 上方两种请求方式二选一即可

            // 使用文件上传函数
            rbj.upload("upload", fileObj, { reqPropertyName: "file", isFilePathUpload: true }).then((resData)=>{
                // resData 即 服务器响应的数据
                self.imgUrl = resData;
            });
        }
    }
</script>

<style lang="scss">
</style>
```

## 详细配置说明

```js
1. 接口配置对象
(一) 模块化接口配置对象
const userConfigs = {
    moduleName: "User 用户模块", // (可选) 仅用作控制台错误提示使用
    moduleUrl: "/user", // (可选) 默认为空, 即设置当前接口对象的模块路径, 会自动添加到请求服务器地址 reqAddress 的后面 和 每个接口 url 的前面, 仅对于当前模块对象中的 interfaceList 接口列表中的接口生效
    interfaceList: { // 定义当前模块中的接口列表 (注意: 只有 importsConfigObj() 函数才会对 模块化接口对象处理, 所以如果你使用了模块化接口对象, 就一定要使用 importsConfigObj() 函数)
        // 接口对接对象 one, 此属性名是自定义的
        one: {
            // (可选) 接口描述说明, 一般用作提示使用
            description: "接口描述说明",
            // 自定义当前接口的请求服务地址(注意: 自定义当前接口的请求服务地址时, 必须要带上 http:// 或 https:// 协议前缀), 默认使用全局的 reqAddress 路径
            reqAddress: "https://localhost:8080/",
            // 当全局是别的请求对象时是否临时使用 fetch 为请求对象, 注意: 当处于 uniapp 项目时此选项不可用
            tempUseFetch: true,
            // 设置请求路径
            url: "/user/home",
            // 请求的方法类型
            method: "GET", // GET 方法默认是 application/x-www-form-urlencoded 的方式, 进行传参, POST 默认是 application/json 的形式, 进行传参
            // 当前接口的请求配置对象
            requestConfig: {
                // 配置当前接口的请求头
                headers: {
                    // 注意: 设置属性名时, 必须加上双引号, 才会生效
                    // "Content-Type": "application/x-www-form-urlencoded",
                }
                //... 还可以配置一些其他的属性
            },
            /**
             * 当声明了此函数时 会对参数进行过滤, 此函数返回什么数据, 请求时就发送什么样的参数给服务器
             * @param data | Object 说明: data 包含 paramsObj 主体参数, pathParams 路径参数, 可以直接修改 data 对象中 属性的引用数据, 进行达到修改请求参数的作用
             * @param operandObj | Object 说明: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
             * @param isAppendData | boolean 说明: 当前接口是否处于追加模式, 非自动对接时此值为 null, 注意: 处于自动对接时除非你在 autoButtJoint() 的 options 对象中设置了此 isAppendData 属性, 否则此处的 isAppendData 还是为空
             * @param frontORback | boolean 说明: 处于追加模式时, 确认向前追加数据 还是 向后追加数据, 非自动对接时此值为 null, 默认值: false 向后追加
             */
            paramsData(data, operandObj, isAppendData, frontORback) {
                // data.paramsObj = {names: "小明"};
                // data.pathParams = 1;
                // data.paramsObj = JSON.stringify(data.paramsObj); // 也可以将整个参数转成 json 字符串
                // 注意: 本函数只具有, 修改请求参数的功能, 不具备拦截并中断请求的功能
                return { // 如有返回值请按照下方格式进行返回
                    paramsObj: {}, // 此返回值对 paramsObj 参数对象进行重新设置
                    pathParams: "" // 此返回值对 pathParams 参数进行重新设置
                }
            },
            // 过滤响应数据, 不管是 buttJoint 手动对象, 还是 autoButtJoint 自动对接, 此 interfaceData() 函数都会运行(即都可以正常的进行响应数据的过滤操作)
            interfaceData(data, operandObj) { // data 服务器响应的对象, operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null, 注意: 只有接口对接时才能使用此函数, 或者假数据模式下也可以使用, 但是 假数据模式下 此 data 没有数据
                // 数据对接操作, 返回什么数据, 组件中的数据就会接收什么数据
                // return {}
                // 注意: 本函数只具有修改响应数据的功能, 不具有拦截响应的功能
                // 注意: 如果 return 返回的是未定义的属性 或 undefined , Rbj插件对象则会当作此函数没有返回数据, 且响应的数据会不经过 interfaceData 函数的过滤, 直接返回的页面上, 所以 return 前最好先判断一个返回的属性是否存在
                // 注意: 如果返回的是 null, Rbj插件对象则会当作此函数已返回数据, 即 返回 null 是有效的
            }
        },
        two: 'one' // 把 one 接口定义一个 two 别名, 即支持对一个接口加一个别名, 主要是为了一个接口在不同页面使用，会造成不知道这是哪个页面的接口，所以给同一个接口定义多个别名，可以让你在进行 多模块或多页面 式的开发时，更容易分辨出不同模块或不同页面的接口
    }
}

(二) 非模块化接口配置对象, 直接不使用 moduleUrl 和 interfaceList 即可
const userConfigs = {
    // 对接对象 one, 此属性名是自定义的
    one: {
        // 可选, 默认为 ''
        description: "接口描述说明",
        // 自定义当前接口的请求服务地址(注意: 自定义当前接口的请求服务地址时, 必须要带上 http:// 或 https:// 协议前缀), 默认使用全局的 reqAddress 路径
        reqAddress: "https://localhost:8080/",
        // 当全局是别的请求对象时是否临时使用 fetch 为请求对象, 注意: 当处于 uniapp 项目时此选项不可用
        tempUseFetch: true,
        // 设置请求路径
        url: "/user/home",
        // 请求的方法类型
        method: "GET", // GET 方法默认是 application/x-www-form-urlencoded 的方式, 进行传参, POST 默认是 application/json 的形式, 进行传参
        // 当前接口的请求配置对象
        requestConfig: {
            // 配置当前接口的请求头
            headers: {
                // 注意: 设置属性名时, 必须加上双引号, 才会生效
                // "Content-Type": "application/x-www-form-urlencoded",
            }
            //... 还可以配置一些其他的属性
        },
        /**
         * 当声明了此函数时 会对参数进行过滤, 此函数返回什么数据, 请求时就发送什么样的参数给服务器
         * @param data | Object 说明: data 包含 paramsObj 主体参数, pathParams 路径参数, 可以直接修改 data 对象中 属性的引用数据, 进行达到修改请求参数的作用
         * @param operandObj | Object 说明: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         * @param isAppendData | boolean 说明: 当前接口是否处于追加模式, 非自动对接时此值为 null, 注意: 处于自动对接时除非你在 autoButtJoint() 的 options 对象中设置了此 isAppendData 属性, 否则此处的 isAppendData 还是为空
         * @param frontORback | boolean 说明: 处于追加模式时, 确认向前追加数据 还是 向后追加数据, 非自动对接时此值为 null, 默认值: false 向后追加
         */
        paramsData(data, operandObj, isAppendData, frontORback) {
            // data.paramsObj = {names: "小明"};
            // data.pathParams = 1;
            // data.paramsObj = JSON.stringify(data.paramsObj); // 也可以将整个参数转成 json 字符串
            // 注意: 本函数只具有, 修改请求参数的功能, 不具备拦截并中断请求的功能
            return { // 如有返回值请按照下方格式进行返回
                paramsObj: {}, // 此返回值对 paramsObj 参数对象进行重新设置
                pathParams: "" // 此返回值对 pathParams 参数进行重新设置
            }
        },
        // 过滤响应数据, 不管是 buttJoint 手动对象, 还是 autoButtJoint 自动对接, 此 interfaceData() 函数都会运行(即都可以正常的进行响应数据的过滤操作)
        interfaceData(data, operandObj) { // data 服务器响应的对象, operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null, 注意: 只有接口对接时才能使用此函数, 或者假数据模式下也可以使用, 但是 假数据模式下 此 data 没有数据
            // 数据对接操作, 返回什么数据, 组件中的数据就会接收什么数据
            // return {}
            // 注意: 本函数只具有修改响应数据的功能, 不具有拦截响应的功能
            // 注意: 如果 return 返回的是未定义的属性 或 undefined , Rbj插件对象则会当作此函数没有返回数据, 且响应的数据会不经过 interfaceData 函数的过滤, 直接返回的页面上, 所以 return 前最好先判断一个返回的属性是否存在
            // 注意: 如果返回的是 null, Rbj插件对象则会当作此函数已返回数据, 即 返回 null 是有效的
        }
    },
    two: 'one' // 把 one 接口定义一个 two 别名, 即支持对一个接口加一个别名, 主要是为了一个接口在不同页面使用，会造成不知道这是哪个页面的接口，所以给同一个接口定义多个别名，可以让你在进行 多模块或多页面 式的开发时，更容易分辨出不同模块或不同页面的接口
}


2. 引入 (Rbj || UniRbjTwo || UniRbjThere) 插件对象, 使用 importsConfigObj 函数融合指定目录下所有的 (接口配置对象) 和 指定目录下所有的全局组件对象(uniapp 不建议使用此方式来注册全局组件, 建议使用 uniapp 内置的注册全局组件方式)
import { Rbj, UniRbjTwo, UniRbjThere, importsConfigObj, logObj } from 'rain-interface-tools';
// 注意: 除了 Rbj 基础核心对象外, 还有对 uniapp 做了兼容的 UniRbjTwo (即用于 uniapp Vue2 版本) 和 UniRbjThere (即用于 uniapp Vue3 版本) 的 rbj 对象, 建议在开发 uniapp 项目时使用 UniRbjTwo 或 UniRbjThere 对象来进行 uniapp 项目的开发, 核心的 rbj 对象可以在 web 或 H5 项目上进行使用
// 注意: 由于日志对象, 一般是自动挂载在 Vue 全局属性上的, 所以非 Vue 组件内, 不能使用 日志对象, 我们可以通过 import { logObj } from 'rain-interface-tools'; 直接导入的方式来使用 rbj日志对象

// importsConfigObj() 辅助函数的作用: 融合多个接口配置对象, 或者也可以 导入指定目录下所有的配置对象文件, 但导入文件要结合 require.context 或 import.meta.globEager 来使用, 详情使用方法可以看下方示例
// 参数示例 :
// [   // 这是文件导入 方式, 可以直接使用 require.context 或 import.meta.globEager 统一获取指定目录下的所有文件的接口配置对象, 就不用再手动一个一个的导入了, 详情使用方法可以看下方示例
//     require("one.js"),
//     require("two.js"),
//     require("there.js")
// ]
// 或多个配置对象, 配置对象可以是 模块化配置对象, 也可以是非模块化配置对象, 两者也可以混在一起用, importsConfigObj 函数会自动处理的
// [
//      {one: {url:''}},
//      {one: {url:''}},
//      {interfaceList: {one: {url:''}}}
// ]
// 或单个模块配置对象, 可以直接将单个模块化接口配置对象, 传入 importsConfigObj 函数, importsConfigObj 函数会直接对模块化接口配置对象进行处理
// {interfaceList: {one: {url:''}}}
// 返回值: {...} 把数组中所有模块的对象合成后 返回一个多个配置融合在一起的合成对象

// #ifndef VUE3
const configObj = importsConfigObj(require.context("configs/subConfig/", true, /.js$/).keys().map(item => require("configs/subConfig/" + item.substr(2, item.length)))); // 可以直接使用 webpack自带的 require.context() 方法来导入指定目录下的多个 js 文件
// 注意: 在开发 uniapp 项目中, 不用使用下方 vue全局组件的方式, 只要组件安装在项目 "根目录" 或 "uni_modules" 的 components 目录下，并符合 components/组件名称/组件名称.vue 或 uni_modules/插件ID/components/组件名称/组件名称.vue目录结构。 就可以直接在页面中使用, 注意: 在 uniapp 项目中, 组件外层要创建一个和组件同名的目录
const globalComponentObj = require.context("components/", true, /.vue$/).keys().map(item => require("components/" + item.substr(2, item.length))); // 使用 require.context() 来获取指定目录的组件
// #endif

// #ifdef VUE3
const configObj = importsConfigObj(import.meta.globEager("configs/subConfig/**.js")); // 或者使用 import.meta.globEager 的方式
// 注意: 在开发 uniapp 项目中, 不用使用下方vue全局组件的方式, 只要组件安装在项目 "根目录"或 "uni_modules" 的 components 目录下，并符合components/组件名称/组件名称.vue 或 uni_modules/插件ID/components/组件名称/组件名称.vue目录结构。 就可以直接在页面中使用, 注意: 在 uniapp 项目中, 组件外层要创建一个和组件同名的目录
const globalComponentObj = import.meta.glob("components/*.vue"); // 使用 import.meta.glob() 函数获取, 指定目录下的所有组件
// #endif

// ======== 注意: uniapp 在开发 手机APP 项目时不支持 Vue 的全局组件, 所以开发 uniapp 项目时最好用内置的 easycom 组件模式 ========

const configObj = importsConfigObj(userConfigs); // 可以直接将单个模块化接口配置对象, 传入 importsConfigObj 函数, importsConfigObj 函数会直接对模块化接口配置对象进行处理


3. 利用 (Rbj || UniRbjTwo || UniRbjThere) 插件对象, 在 Vue 上安装插件, 导入融合后的接口配置对象, 导入融合后的全局组件对象(uniapp 不建议使用此方式来注册全局组件, 建议使用 uniapp 内置的 easycom 方式, 来注册全局组件)
Vue.use(
    new Rbj({ // 此处除了可以使用核心的 Rbj 插件对象外, 还可以使用对 uniapp 做了兼容的 UniRbjTwo (即用于 uniapp Vue2 版本) 和 UniRbjThere (即用于 uniapp Vue3 版本) 的 rbj 插件对象, 建议在开发 uniapp 项目时使用 UniRbjTwo 或 UniRbjThere 对象来进行 uniapp 项目的开发, 核心的 Rbj 对象可以在 web 或 H5 项目上进行使用
        // 请求的主机地址, 默认值: "localhost:8080", 当需要使用 https 时, 可以直接在请求地址前面加 https://localhost:8080
        reqAddress: "localhost:8080",
        // 用户的接口配置对象, userConfigs 即直接导入的配置对象, configObj 即 使用上方的 importsConfigObj 函数导入多个 js 文件合成的对象, 两种方式可任选其一即可
        userConfig: configObj,
        // 设置全局组件, 注意: 自定义的全局组件必须要有 name 属性, 作用: 即是全局组件的名字, 也是全局组件的标签名
        globalComponent: globalComponentObj,
        // 是否全局使用 fetch 为 数据请求对象, 默认值: false
        // 注意: fetch 请求是不进行空数据过滤的
        useFetch: false,
        // 控制台是否进行日志输出, 默认值: false
        logs: process.env.NODE_ENV === "development", // 判断是否开发或生产环境, 开发环境即为 true 则打印日志, 生产环境即为 false 则不打印日志
        // 控制台打印的日志是否, 携带样式进行输出, 此配置需搭配上方的 logs 属性配置进行使用, 且此样式仅在 H5模式 下才能正常生效, 默认值: false
        isLogStyle: false,
        // 是否开启假数据模式, 默认值: false
        falseDataMode: false,
        // 全局请求配置函数
        globalRequestConfig(dataObj) {
            // dataObj 可以获取 rbj 对象
            // return { // 返回的对象即全局的请求头设置
            //     headers: {
            //         "Content-Type": "application/x-www-form-urlencoded",
            //     }
            // }
        },
        // 配置请求响应时, 对响应的数据进行过滤时的空值补全字符串, 也可以调用 dataFilter() 函数对指定的数据对象进行空值过滤, 注意: 默认不进行响应时的空值过滤
        setNullString: "-暂无数据-",
        // 开启请求数据的缓存模式 (开启后假数据模式也会生效), 默认值: false
        // 缓存模式的主要作用是对接口请求后的数据进行一个临时缓存 可以使用 getCacheData("接口配置名") 函数, 来获取指定接口临时缓存的数据, 临时缓存是时效是同一个接口的下一次请求之前都可以获取, 因为同一个接口的下一次请求的数据会覆盖这个临时缓存的数据
        isEnableCache: true,
        // 规则拦截器, 注意: 只对用户接口配置对象中的请求路径进行正则验证拦截, 不包括 https 协议 和 域名主机地址
        interceptor: [
            {
                // 正则表达式, 可传入 字符串 或 对象 或 数组(即多个规则可以用到一个拦截器上), 解释说明: 根据正则表达式进行拦截 请求和响应
                regular: "^ab$" | {
                    str: "^ab$", // 正则表达式
                    pattern: "g" // 正则的验证模式
                } | [{str: "^ab$", pattern: "g"}, "^ab$", ...], // 数组内也支持 字符串, 对象 两种方式
                reversalVerify: false, // 正则反转拦截, 会拦截验证失败的, 放行验证成功的, 默认: false 不进行反转操作
                /**
                 * @description 全局, 请求过滤器函数
                 * @param reqParams 当前请求的参数
                 * @param pathParams 路径参数
                 * @param regularData 如果多个拦截器, 都匹配到了同一个请求, 并且上一个拦截器 return 返回了非布尔值的数据, 那么 regularData 就是上一个拦截器返回的数据, 如果有三个拦截器 第一个返回了数据, 第二个没有返回数据 或者 返回了 boolean 值, 则第三个拦截器中的 regularData 参数, 接收的就是第一个拦截器返回的数据, 如果拦截器都没有返回数据则为 null
                 * @param rbjObj 当前 rbj 对象的实例
                 * @param currentUserConfigObjData 当前用户的配置数据对象
                 * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                 * @return 注意: 如果多个拦截器, 都匹配到了同一个请求, 并且都进行 return 返回了数据要进行数据过滤的话, 那么下方的拦截器 return 返回的数据 会 覆盖上方拦截器 return 返回的数据, 但是我们可以从参数 regularData 来获取上一个拦截器返回的数据, 注意: 如果不 return 返回任何东西, 则默认放行
                 */
                requestRegular(reqParams, pathParams, regularData, rbjObj, currentUserConfigObjData, operandObj) { // 请求拦截, 和 下方的 globalRequestFilterFun 使用方式类似, 注意: 当你不需要此函数时可以不写
                    if (Array.isArray(reqParams)) {
                        return [interfaceDefinedName, Files, paramsObj, reqPropertyName, isFilePathUpload];
                    } else {
                        return false; // 放行, 默认值: false, 不进行拦截
                        return true; // 拦截
                        return { // 也可以直接返回对象, 但请按照下方格式进行返回
                            paramsObj: {}, // paramsObj 即对请求参数对象进行重新设置
                            pathParams: "" // pathParams 即对路径参数重新设置参数进行重新设置
                        }
                    }
                },
                /**
                 * @description 全局, 响应过滤器函数
                 * @param respData 当前请求的响应数据
                 * @param regularData 如果多个拦截器, 都匹配到了同一个请求, 并且上一个拦截器 return 返回了非布尔值的数据, 那么 regularData 就是上一个拦截器返回的数据, 如果有三个拦截器 第一个返回了数据, 第二个没有返回数据 或者 返回了 boolean 值, 则第三个拦截器中的 regularData 参数, 接收的就是第一个拦截器返回的数据, 如果拦截器都没有返回数据则为 null
                 * @param rbjObj 当前 rbj 对象的实例
                 * @param currentUserConfigObjData 当前用户的配置数据对象
                 * @param operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                 * @return 注意: 如果多个拦截器, 都匹配到了同一个请求, 并且都进行 return 返回了数据要进行数据过滤的话, 那么下方的拦截器 return 返回的数据 会 覆盖上方拦截器 return 返回的数据, 但是我们可以从参数 regularData 来获取上一个拦截器返回的数据, 注意: 如果不 return 返回任何东西, 则默认放行
                 */
                responseRegular(respData, regularData, rbjObj, currentUserConfigObjData, operandObj) { // 响应拦截, 和 下方的 globalResponseFilterFun 使用方式类似, 注意: 当你不需要此函数时可以不写
                    return false;
                    return true;
                    // 可以直接返回对象或数组, 对响应的数据进行过滤
                    return {};
                    return [];
                }
            },
            ... // 可以设置多个拦截器
        ],
        /**
         * 全局, 请求过滤器函数, 无返回值时, 默认自动放行
         * 参数1: reqParams 当前请求的参数
         * 参数2: pathParams 路径参数
         * 参数3: rbjObj 当前 rbj 对象的实例
         * 参数4: currentUserConfigObjData 当前用户的配置数据对象
         * 参数5: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         */
        globalRequestFilterFun(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
            // currentUserConfigObjData 可以直接修改, 请求接口配置对象
            // 无论 reqParams是文件上传请求还是普通请求, 我们都可以直接修改参数数组, 或参数对象, 对内部的请求参数做一个小改动 (修改后的参数会自动生效并使用在请求的接口上), 也可以返回一个新的请求参数对象(即返回一个 对象 {} 或 数组 [] 来过滤请求参数)
            return false; // 放行
            return true; // 拦截
            return { // 也可以直接返回对象, 但请按照下方格式进行返回
                paramsObj: {}, // paramsObj 即对请求参数对象进行重新设置
                pathParams: "" // pathParams 即对路径参数重新设置参数进行重新设置
            }
        },
        /**
         * 全局, 响应过滤器函数, 无返回值时, 默认自动放行
         * 参数1: respData 当前请求的响应数据
         * 参数2: rbjObj 当前 rbj 对象的实例
         * 参数3: currentUserConfigObjData 当前用户的配置数据对象
         * 参数4: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
         */
        globalResponseFilterFun(respData, rbjObj, currentUserConfigObjData, operandObj) {
            return false; // 放行
            return true; // 拦截, 返回值: 是否对响应进行拦截, 类型: boolean, 默认值: false (不拦截), 如果拦截的是手动对接的请求响应, 则 then 不会执行, catch 会执行, 如果拦截的是 自动对接的 请求响应, 则自动对接则不会再默认进行自动赋值
            return {}; // 还可以返回 对象 {} 或 数组 [], 即对响应的数据进行过滤
            return [];
        },
        // 初始化全局自定义调用函数, 可以在任何组件内使用 this.$rbj.globalFun.自定义的函数名(); 来调用
        // 注意: 也可以自定义一些, 常用的全局变量, 也可以用 this.$rbj.globalFun.变量名, 的方式来调用
        globalFun: {
            one: 1, // 可以定义常用的全局变量

            fun_one(){
                console.log("这是全局初始化的第一个全局自定义函数", this.$rbj); // 当前 全局函数内, 也可以通过 this 来调用 $rbj 对象
                this.fun_two(); // 注意: 全局函数内, 可以直接使用 this 来调用其他全局函数
            },
            fun_two(){
                console.log("这是全局初始化的第二个全局自定义函数");
            }
        },
        /**
         * 自定义 token 在请求头上的名字，默认值："Authorization"
         */
        tokenName: "Authorization",
        /**
         * 自定义设置 token 方式的函数
         * 参数1: 要进行设置的 token 字符串
         * 参数2: 当前 rbj 实例对象
         * 注意: 有默认设置 token 的函数, 所以也可以不进行设置
         * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认设置 token 函数的执行
         */
        customSetTokenFun(token, rbjObj) {
            // 示例:
            // window.localStorage.setItem("token", token);
        },
        /**
         * 自定义获取 token 方式的函数
         * 参数: 当前 rbj 实例对象
         * @return 注意: 自定义获取方式后需要返回获取的 token 字符串
         * 注意: 有默认获取 token 的函数, 所以也可以不进行设置
         * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认获取 token 函数的执行
         */
        customGetTokenFun(rbjObj) {
            // return "LSJFKLSDJFLJSLKDJFLSDKF";
        },
        /**
         * 自定义移除 token 方式的函数
         * 参数: 当前 rbj 实例对象
         * 注意: 有默认移除 token 的函数, 所以也可以不进行设置
         * 注意: 不设置时, 需要在对象中把此函数进行删除, 防止此函数影响默认移除 token 函数的执行
         */
        customRemoveTokenFun(rbjObj) {
            // 示例:
            // window.localStorage.removeItem("token", token);
        }
    })
);




```

## 支持将配置好的 rbj 对象安装到任何对象上

```js

// 安装示例:
let toolsObj = {}; // 可以是已经存在的对象 或者 手动定义的新对象 都可以, 此处是手动定义的一个新对象
new Rbj({ rbj配置项 }).Install_rbj(toolsObj); // 把 rbj 对象安装到指定的对象身上

// 使用示例: toolsObj 对象中可以直接调用 $rbj 对象
toolsObj.$rbj.autoButtJoint("one", { age: 18 }, "listName", this);

```

## 组件中使用说明

```js
export default {
    data(){
        return {
            listName: []
        }
    },
    methods: {
        init_data_rbjData() {
            /**
             * @param interfaceDefinedName | String (必填), (非模块化接口配置对象中的每个接口配置的属性名) 或者也可以是 (模块化接口配置对象中的 interfaceList 接口列表中 的 每个接口配置的属性名)
             * @param paramsObj | Object (必填, 但非必传 即 可以不传任何数据, 但必须设置一个 null), 请求参数对象, 可为 null
             * @param dataName | String (必填), 把数据装配到对象中的哪个属性上, 即要操作的变量名, 注意: 此参数是字符串类型
             * @param currentObj | Object (必填), 要进行装配数据的对象, 一般在组件中都是当前组件的 this 对象
             *
             * @param options | Object 可选参数说明: ---
             *      参数1: pathParams(可选, 但可为 null), get 请求时 的 路径参数
             *      参数2: callbackFunc(可选), auto 自动对接时的回调函数, 此回调函数 和 用户的请求配置中的 interfaceData() 函数是一样的作用, 区别是 这个回调函数使用的是 interfaceData() 函数已经过滤返回的数据, 然后可以对其再次进行过滤
             *      参数3: isAppendData(可选), 是否让服务器响应的数据, 以追加的形式, 赋值到指定的变量中, 注意: 数组会追加元素, 对象会追加属性和属性值, 当然要进行追加的指定变量, 默认必须是一个数组或一个对象, 而且服务器响应的数据, 经过 过滤后 的数据必须也是一个数组或一个对象, 且数组只能向数组追加元素, 对象只能向对象追加属性
             *      参数4: isUrlEncode(可选) | boolean, post 请求时, 是否发送 内容类型为: application/x-www-form-urlencoded 的数据
             *      参数5: tempUseFetch(可选) | boolean 说明: 是否临时使用 fetch 请求对象, 一般在你使用了除 fetch 外的其他请求对象时使用, 注意: 当处于 uniapp 项目时此选项不可用
             *      参数6: frontORback(可选) | boolean 说明: 需结合 isAppendData 属性参数使用, 当处于追加模式时, 确认是 向前追加数据 还是 向后追加数据, 默认值: false 向后追加数据, 注意: 只有追加目标为数组时, 此属性才能生效
             *
             * @return 函数返回值类型说明: Object, 包含 refRefreshFlag(), refRefreshGroup() 引用刷新标记方法
             *          refRefreshFlag()  参数说明 : freshTagName 刷新标签名
             *          refRefreshFlag 方法说明: 标记当前接口, 然后可以在别的地方利用 $rbj.refreshFlagInterface("标记名") 重新调用此接口
             *                     使用场景: 引用刷新, 即当接收到后台的通知后, 自动刷新当前页的数据 (也就是重新调用当前页的接口), 此方法可以避免重新加载网页
             *          refRefreshGroup() 参数说明 ： groupName (刷新组名)，uniqueTagName (不重复的唯一标识)
             *          refRefreshGroup 方法说明: 标记当前接口到指定的组内, 然后可以在别的地方利用 $rbj.refreshGroupInterface("标记名") 重新调用组内的所有接口, 即可进行 批量接口刷新
             *                      使用场景: 引用刷新, 即当接收到后台的通知后, 自动批量刷新当前页的数据 (也就是重新调用当前页的接口), 此方法可以避免重新加载网页
             */

            /* 参数:  interfaceDefinedName(必填), paramsObj(可选, 可为 null),  dataName(必填), currentObj(必填), pathParams(可选, 可为 null), callbackFunc(可选, 此回调函数和 请求配置中的 interfaceData() 函数一样的作用, 区别是 这个回调函数使用的是 函数已经过滤返回的数据, 然后可以对其再次进行过滤),isAppendData(可选), isUrlEncode(可选), tempUseFetch(可选, 注意: 当处于 uniapp 项目时此选项不可用) */
            let refRefreshObj = this.$rbj.autoButtJoint("one", { age: 18 }, "listName", this, { // 自动对接方法, 功能: 传入参数, 根据用户配置, 发送请求, 自动将响应的数据装配到指定的对象上
                pathParams: "123", // 直接在路径上拼接字符串, get, post 都可以使用
                callbackFunc(data, operandObj) {}, // 注意: 如果被全局过滤器或拦截器, 拦截住没有放行时, 此函数不会运行
                isUrlEncode: false, // 是否对 post 请求的请求主体进行键值编码, 默认值 false, 注意: 只针对 post 请求, get 请求无效, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此参数不可用
                tempUseFetch: false, // 注意: 当处于 uniapp 项目时此选项不可用, 默认值 false
                isAppendData: true, // 进行数据追加, 默认值 false
                frontORback: false, // 默认值: false 向后追加数据, 注意: 需结合 isAppendData 使用
                globalFilterInterCept: { // 全局过滤器, 如果拦截后, 默认执行的回调函数 (注意: 仅对当前接口生效)
                    /**
                     * 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
                     * 参数1: reqParams 当前请求的参数
                     * 参数2: pathParams 路径参数
                     * 参数3: rbjObj 当前 rbj 对象的实例
                     * 参数4: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数5: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    },
                    /**
                     * 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
                     * 参数1: respData 当前请求的响应数据
                     * 参数2: rbjObj 当前 rbj 对象的实例
                     * 参数3: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数4: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    }
                },
                /**
                 * 是否允许当前请求在请求头加上 token, 默认值: true 允许
                 */
                isUseToken: true,
            });
            
            /* interfaceDefinedNameUrl(必填), paramsObj(可选, 可为 null), pathParams(可选), isUrlEncode(可选), tempUseFetch(可选, 注意: 当处于 uniapp 项目时此选项不可用) 注意: 如果请求响应时被全局拦截了, catch 函数会把全局拦截也当成报错行为, 并自动执行一次 catch 函数 */
            let butRefRefreshObj = this.$rbj.buttJoint("one", { age: 18 }, { // 手动对接方法, 功能: 传入参数, 根据用户配置, 发送请求, 返回一个 Promise 对象, 可以通过此对象接收请求响应后服务器返回的数据, 和自动对接的区别是: 返回的数据需要你自己手动处理
                pathParams: "123", // 直接在路径上拼接字符串, get, post 都可以使用
                isUrlEncode: true, // 是否对 post 请求的请求主体进行键值编码, 注意: 只针对 post 请求, get 请求无效, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此参数不可用
                tempUseFetch: false, // 注意: 当处于 uniapp 项目时此选项不可用
                isFileUpload: false, // 也可以开启此方式进行手动的文件上传, 默认值: false
                globalFilterInterCept: { // 全局过滤器, 如果拦截后, 默认执行的回调函数 (注意: 仅对当前接口生效)
                    /**
                     * 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
                     * 参数1: reqParams 当前请求的参数
                     * 参数2: pathParams 路径参数
                     * 参数3: rbjObj 当前 rbj 对象的实例
                     * 参数4: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数5: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    },
                    /**
                     * 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
                     * 参数1: respData 当前请求的响应数据
                     * 参数2: rbjObj 当前 rbj 对象的实例
                     * 参数3: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数4: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    }
                },
                /**
                 * 是否允许当前请求在请求头加上 token, 默认值: true 允许
                 */
                isUseToken: true,
            }).then((data)=>{}).catch((err)=>{}); // 注意: 如果被全局过滤器或拦截器, 拦截住没有放行时, catch 函数会运行, 并且 err 的参数错误会变成一个 'ISNULL' 字符串

            /**
             * @description 文件上传
             * @param interfaceDefinedName | String (请求的接口配置对象名)
             * @param Files (文件临时路径数组 |文件对象数组 | 单个文件对象也可以直接传入), 注意: uniapp 中此参数只能上传单文件, 不支持上传多文件, 且 isFilePathUpload 一定要设置为 true
             * @param options 参数对象说明
             *      paramsObj(文件上传时附带的参数)
             *      reqPropertyName(文件上传时文件的属性名), 默认值: file
             *      isFilePathUpload (是否使用 filePath (即 单个临时路径) 进行文件上传, 此选项只针对 uniapp) 注意: uniapp 中必须此将此参数 设置为 true 文件才能上传成功
             * 注意: 当你处于 fetch 请求模式, 进行文件上传时, 你设置的请求头将会失效, 解释说明: 因为 fetch 请求进行文件上传时如果设置请求头, 则会导致上传文件失败, 也就是说如果你使用 fetch 进行文件上传则不能在请求头上带 token 或其他参数
             */
            this.$rbj.upload("one", new File(), { // 文件上传函数
                paramsObj: { age: 18 }, // 上传文件时, 携带的参数
                reqPropertyName: "file", // 文件上传时文件的属性名
                isFilePathUpload: true, // 会自动默认做一个 是否 uniapp 项目的判断, 如果是 uniapp 项目则此项配置默认为 true, 否则此项配置默认为 false
                globalFilterInterCept: { // 全局过滤器, 如果拦截后, 默认执行的回调函数 (注意: 仅对当前接口生效)
                    /**
                     * 全局请求过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的请求生效)
                     * 参数1: reqParams 当前请求的参数
                     * 参数2: pathParams 路径参数
                     * 参数3: rbjObj 当前 rbj 对象的实例
                     * 参数4: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数5: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    },
                    /**
                     * 全局响应过滤器, 拦截后, 默认执行的回调函数 (注意: 仅对当前接口的响应生效)
                     * 参数1: respData 当前请求的响应数据
                     * 参数2: rbjObj 当前 rbj 对象的实例
                     * 参数3: currentUserConfigObjData 当前用户的配置数据对象
                     * 参数4: operandObj 自动化对接时要进行装配数据的操作对象, 非自动对接时此值为 null
                     */
                    responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
                        // 回调函数内容...
                    }
                },
                /**
                 * 是否允许当前请求在请求头加上 token, 默认值: true 允许
                 */
                isUseToken: true,
            }).then((resData)=>{}).catch((err)=>{}); // 注意: 如果被全局过滤器或拦截器, 拦截住没有放行时, catch 函数的参数错误会变成一个 'ISNULL' 字符串

            this.$rbj.customRequest(); // 自定义请求, 和 axios() 函数的用法一样

            // ===================================== 刷新标记 =====================================
            // 刷新标记说明: 标记指定接口, 或 分组标记接口, 然后可以在别的地方利用 执行刷新标记的函数, 重新调用此接口
            // 使用场景说明: 引用刷新, 即当接收到后台的通知后, 自动刷新当前页的数据 (也就是重新调用当前页的接口), 此方法可以避免重新加载网页

            // ----- autoButtJoint 添加刷新标记 -----
            refRefreshObj.refRefreshFlag("one"); // 给当前接口定义 flag 刷新标记, refRefreshObj 是上方的 autoButtJoint() 函数的返回值对象
            refRefreshObj.refRefreshGroup("two", "ones"); // 参数1：给当前接口定义 group 组标记， 参数2：给当前接口在刷新组内定一个，不重复的唯一标识

            // refRefreshFlag() 和 refRefreshGroup() 可以相互调用, 也就是说你可以给接口定义一个 flag 标记, 也可以将接口定义一个 group 标记
            refRefreshObj.refRefreshFlag("one").refRefreshGroup("two", "ones");
            refRefreshObj.refRefreshGroup("two", "ones").refRefreshFlag("one");

            

            // ----- buttJoint 添加刷新标记 -----
            butRefRefreshObj.refRefreshFlag("one"); // 给当前接口定义 flag 刷新标记, butRefRefreshObj 是上方的 buttJoint() 函数的返回值对象
            butRefRefreshObj.refRefreshGroup("two", "ones"); // 参数1：给当前接口定义 group 组标记， 参数2：给当前接口在刷新组内定一个，不重复的唯一标识

            // refRefreshFlag() 和 refRefreshGroup() 可以相互调用, 也就是说你可以给接口定义一个 flag 标记, 也可以将接口定义一个 group 标记, 并且可以正常使用 then 和 catch 方法
            butRefRefreshObj.refRefreshFlag("one").then(item => {}).refRefreshGroup("two", "ones").catch(item => {});
            butRefRefreshObj.then(item => {}).refRefreshGroup("two", "ones").then(item => {}).catch(item => {}).refRefreshFlag("one");


            // ------ 执行刷新标记 ------
            this.$rbj.refreshFlagInterface("one");  // 引用刷新, 传入指定标记名, 自动刷新指定标记的接口
            this.$rbj.refreshGroupInterface("two");  // 引用刷新整个组内所有的 flag 标记接口, 传入指定组标记名, 自动刷新组内的所有标记的接口
            this.$rbj.refreshGroupFlagInterface("two", "there");  // 引用刷新指定组内指定 flag 标记接口的, 传入指定组标记名 和 组内指定的 flag 标记名, 自动刷新组内指定的标记接口

            // ----- 删除标记 -----
            this.$rbj.refreshFlagTagDelete("one" || ["one", "two", ...]);  // 删除引用刷新标记, 参数说明: freshTagName : Array || String
            this.$rbj.refreshGroupTagDelete("two" || ["one", "two", ...]);  // 删除引用指定组内的所有刷新标记, 参数说明: freshTagName : Array || String
            this.$rbj.refreshGroupFlagTagDelete("groupName", "freshTagName"); // 删除组内指定的 flag 刷新标记
            this.$rbj.refreshFlagTagDeleteAll();  // 删除全部 flag 引用刷新, 无参数
            this.$rbj.refreshGroupTagDeleteAll();  // 删除全部 group 引用刷新, 无参数
            this.$rbj.refreshTagDeleteAll();  // 删除全部引用刷新, 包括 （flag, group） 无参数

            // 引用刷新理解: flag 和 group 是两个不同的标记对象, 且两个对象并没有关联, 当然 group 内也有 flag 的功能, 是在 flag 的基础上增加了一个 组的概念




            // ======= 路径参数转换 =======
            // 对象转路径参数, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此函数不可用
            this.$rbj.objToPathParams(pathObj);

            // 路径参数转对象, 可传入完整的路径, 注意: 当处于 uniapp 项目的 NVue 页面或组件时, 此函数不可用
            this.$rbj.pathParamsToObj(urlPath);
        
        },
    },
    created(){
        this.init_data_rbjData(); // ------ 初始化页面数据对象 ------

        /**
         * @description 设置 token 字符串, 到本地存储中, 请求时会自动带上 token, 默认的 token 的存储方式用的是 localStorage 本地存储
         * @param {string} tokenStr token 字符串
         */
        this.$rbj.setToken(tokenStr);

        /**
         * @description 获取 token
         * @return {string} token 字符串
         */
        this.$rbj.getToken();

        /**
         * @description 移除 token
         */
        this.$rbj.removeToken();

        /**
         * 动态获取全局请求头对象
         */
        this.$rbj.getDynamicGlobalHeader();

        /**
         * @description 动态追加设置全局请求头的属性 (注意: 追加后当前项目的所有接口请求都会自动生效)
         * @param {string} attributeName 属性名
         * @param {string} attributeVal 属性值
         */
        this.$rbj.dynamicAddSetGlobalHeader(attributeName, attributeVal);

        /**
         * @param {string} attributeName 属性名
         * @description 删除全局请求头的指定属性
         */
        this.$rbj.dynamicDeleteGlobalHeader(attributeName);

        /**
         * 动态删除全部, 全局请求头的属性
         */
        this.$rbj.dynamicClearAllGlobalHeader();

        /**
         * 动态获取指定接口的请求头对象 (注意: 不包括全局请求头)
         */
        this.$rbj.getDynamicInterfaceHeader();

        /**
         * @param {string} interfaceDefinedName 接口配置名
         * @param {string} attributeName 属性名
         * @param {string} attributeVal 属性值
         * @description 动态追加设置指定接口的请求头属性 (要在具体的接口请求之前运行, 追加后只针对指定的接口生效, 且追加后, 下次再在其他任何地方请求这个指定的接口时, 此次动态追加的请求头属性不会自动消失, 还会自动生效)
         */
        this.$rbj.dynamicAddSetInterfaceHeader(interfaceDefinedName, attributeName, attributeVal);

        /**
         * @param {string} interfaceDefinedName 属性名
         * @param {string} attributeName 属性值
         * @description 动态删除指定接口的请求头属性(要在具体的接口请求之前运行)
         */
        this.$rbj.dynamicDeleteInterfaceHeader(interfaceDefinedName, attributeName);

        /**
         * @param {string} interfaceDefinedName 接口配置名
         * @description 动态删除指定接口的所有请求头属性(要在具体的接口请求之前运行), 注意: 不包括全局请求头设置的属性
         */
        this.$rbj.dynamicClearAllInterfaceHeader(interfaceDefinedName);

        /**
         * @description 空数据过滤补全字符串的方法
         * @param {Array | object} data 要进行过滤的数据
         * @param {string} nullStr 用来补全空的字符串
         * @return {object} 返回空值补全后的数据对象
         */
        this.$rbj.dataFilter(data, nullStr); // 可以使用此方法进行数据空值过滤, 优先使用函数上设置的 nullStr 字符串, 如果没有设置, 再使用 Rbj 全局的 setNullString 如果也没有设置全局, 则默认空值补全字符串使用的是 "-暂无数据-"
        
        // 为了数据的多复用性, 故推出此 缓存模式 中衍生的出来的, 获取缓存数据的函数, 注意: 前提是 你必须在 rbj 配置中开启 isEnableCache: true 模式
        this.$rbj.getCacheData("one"); // 输入 用户的请求配置中 每个请求配置定义的名字, 即可获取对应请求后缓存下来的数据, 注意: 只有请求发起过的接口数据才会被缓存起来, 且请求接口的下一次的请求数据会覆盖上一次请求的缓存数据


        // 全局自定义函数
        this.$rbj.setGlobalFun("funName", ()=>{}); // 设置全局函数
        this.$rbj.globalFun.自定义的函数名(); // 此方式可直接调用自定义的全局函数






        // 辅助函数
        /**
         * @description 对象或数组空值判断
         * @param verifyObj: Object | Array, 说明: 要进行空值验证的数据对象, 支持 对象 或 数组 的验证
         * @param verifySelect: Array, 多维数组, 数组的每一个维度即代表设置每一层要进行验证的多个字段属性名 (可选: 不传 或 [] 即验证 表单对象的全部属性或元素, 可以传 null 值, 注意: 验证多层级数据时, 如果指定层级为 [], 则代表验证指定层级的所有属性或元素) 说明: 数组中就算有了对象或数组, 也算 [], 因为 数组中对象或数组是对下一个层级的设置, 不是对当前层级的设置, 即数组中必须有 字符串元素, 才不算为 []
         *      示例: 验证对象字段 ['phone', 'password', ['phone', 'password'] ...], 验证数组指定索引元素 ['0', '1', ['0', '1'] ...], 或者验证 数组和对象的混合字段 ['phone', ['0', '2', ['phone']], ['password', ['0']]...]
         *      多维数组内, 要想对单个对象属性或数组索引, 进行独立设置, 可以使用 对象的方式, 示例:
         *      [
         *        {
         *          oneselfField: "userInfo", // 要进行单独设置验证方式的字段属性名, 一般只针对, 对象或数组类型的字段, 基本类型不支持, 注意: 不管外部是否开启了反转模式, "userInfo" 这个属性要在外部是处于进行空值验证的状态, 如果 "userInfo" 在外部没有处于空值验证状态, 则这个独立设置对象也是无效的, 因为这个独立控制, 仅针对 子属性和子索引的设置
         *          isReversal: false, // 是否对 oneselfField 指定的 (对象或数组) 进行反转操作, 默认值 false, 注意: 当 verifyArr 未设置, 或 verifyArr为 [] 时, 会自动默认进行所有子属性值或子索引值的验证, 而你设置的isReversal 则会失去效果
         *          isChildren: true, // 对于 oneselfField 指定的字段属性数据, 是否进行子属性值或子索引值验证, 注意: 如果不在当前对象中设置此项(当前对象中的设置优先级是最高的), 则默认以 optionsObj 中 reversalVerify 为准, 若 optionsObj 中没有定义 reversalVerify 或 reversalVerify 中没有设置指定层级是否反转的操作, 则默认值为 true
         *          verifyArr: [], // Array, 多维数组, 和 verifySelect 一样的写法和效果, 区别是仅针对 当前 oneselfField 指定的字段, 所代表的数据对象
         *        }
         *      ]
         * @param optionsObj 参数对象属性说明
         *      参数1: reversalVerify: boolean | Array | Object, (可选, 默认值为 false) 说明: 可以将 verifySelect 中的选项 和 要进行验证的 verifyObj 表单对象, 进行反转操作, 在多级对象或多级数组状态下, 可以使用 (对象或数组) 的方式, 来控制多层级的反转操作
         *              示例作用解释说明: 验证的对象中有 phone 和 password 两个字段，当你想要验证 verifySelect = ["phone"], 反转后: verifySelect = ["phone"] 会变成要进行忽略的字段数组，会自动把 除 需要忽略的数组以外的所有字段进行验证
         *              使用示例: 1.布尔使用方式 true, 说明: 如果要验证的是多层级的数据, 即默认设置多层级, 都为 true 或 都为 false, 注意:  reversalVerify 的默认使用的是 布尔方式, 且默认值为 false
         *                          布尔方式扩展说明: reversalVerify 使用布尔方式时, 虽然会同时设置多层级, 但是如果在 verifySelect 中你没有设置多个层级而只是设置了一个或两个层级, 或者把指定的层级设置为 [], 那这些没有设置的层级和空 [] 层级默认还是为 false, 此解释: 在 verifySelect 中已做过说明: "即 不传 或 [] 即验证 表单对象的全部属性或元素, 可以传 null 值", 具体详情可以查看上方的 verifySelect 的说明
         *                       2.对象使用方式 {0: true, 1: false, ...}, 说明: 0 代表最外边的第一层, 以此类推, 如果要进行验证的数据有 四层, 而你只设置了 前两层, 则默认后两层为 false, 即不设置或设置为 null, 都为 false
         *                       3.数组使用方式 [true, false, ...], 说明: 第一个元素代表最外边的第一层, 以此类推, 如果要进行验证的数据有 四层, 而你只设置了 前两层, 则默认后两层为 false, 即不设置或设置为 null, 都为 false
         *      参数2: isZeroNull: boolean, (可选) 说明: 设置 零 是否算 空状态, 默认值 false, 零不算空状态
         *      参数3: isChildren: boolean, (可选) 说明: 是否进行子级空值验证, 默认值 true, 进行子级验证
         * @return 类型: Object, 有空值时返回 {isEmpty: true, fieldName: ""}, 没有空值返回 {isEmpty: false, fieldName: "NOT_NULL"}
         *          isEmpty // 字段为空时是 true, 不为空时是 false, fieldName // 字段为空时的字段名, 当所有字段都不为空时他会有一个默认值  "NOT_NULL", 如果传入的数据就是空的 也会有一个 "NULL" 默认值
         */
        this.$rbj.assistFun.emptyVerify(verifyObj, verifySelect, {
            reversalVerify: false, // 默认值: false
            isZeroNull: false, // 设置 零 是否算 空状态, 默认值 false, 零不算空状态
            isChildren: false, // 是否进行子级空值验证, 默认值 true, 进行子级验证
        });
        /**
         * @description 回显数据 作用解释: 表单数据进行回显使用, 可以让后台响应的数据对象中的字段和页面的表单对象中的字段自动关联在一起, 注意：前提是两个对象中的字段名要一致才能进行关联, 对象中 (允许有冗余字段, 不会对字段关联产生影响)
         * @param echoObj 页面的回显对象
         * @param dataObj 后台响应的数据对象
         * @param optionsObj 参数对象属性说明
         *          - assignNull 说明: 即 dataObj 中有如果有空变量, 是否进行赋值操作, 默认值 false, 注意: 空变量的赋值也是针对两个对象中, 都必须都存在相同的属性名时, 才会进行赋值, 只要有一方没有则不会进行赋值操作
         * @return void 没有返回值
         */
        this.$rbj.assistFun.echoFun(echoObj, dataObj, {
            assignNull: false, // 说明: 即 dataObj 中有如果有空变量, 是否进行赋值操作, 默认值 false
        }); // 将表单对象的属性 和 后台响应的数据对象中 相同属性名进行关联， 以此来实现数据回显
    }
}
```

## rbj 流数据转换对象

```js
export default {
    created(){
        // 流数据转换对象
        let streamObj = new this.$rbj.StreamConversion(Blob||file||ArrayBuffer||base64); // 注意: 流数据转换对象, 可能会转换失败, 可以利用下方的静态方法, 使用单一的方式来进行转换
        streamObj.getFile(); // 获取 File 对象
        streamObj.getBlob(); // 获取 Blob 对象
        streamObj.getArrayBuffer(); // 获取 ArrayBuffer 字节流对象
        streamObj.getArrayBuffer().then(arrayBuffer => {}); // 当你在创建 StreamConversion 对象时, 初始化传入的是 file 或 blob 时, getArrayBuffer() 返回的是一个异步对象
        streamObj.getDataURL(); // 当你在创建 StreamConversion 对象时, 初始化传入的是 arrayBuffer 或 dataurl 时, getDataURL() 函数直接返回一个 base64 字符串, 可以直接使用
        streamObj.getDataURL().then(dataurl => {}); // 当你在创建 StreamConversion 对象时, 初始化传入的是 file 或 blob 时, getDataURL() 返回的是一个异步对象
        // 流数据转换对象 常用的 静态方法
        this.$rbj.StreamConversion.canvasToDataUrl(canvas); // 返回 dataUrl 字符串
        this.$rbj.StreamConversion.dataURLtoImage(dataUrl); // 返回 Image 对象
        this.$rbj.StreamConversion.imageTocanvas(ctx, imageElement, x, y, width, height); // Image 转 canvas (即把图片渲染到 传入的 ctx [即 canvas 的] 画笔操作对象), 此函数没有返回值, 参数: (imageElement [图片元素], x [渲染在canvas的x轴位置], y [渲染在canvas的 y轴位置], width [渲染的宽度], height [渲染的高度])
        this.$rbj.StreamConversion.canvasToblob(canvas); // 返回 Blob 对象
        this.$rbj.StreamConversion.blobORfileTodataURL(paramsObj).then(dataUrl => {}).catch();
        this.$rbj.StreamConversion.blobORfileToAffter(paramsObj).then(arrayBuffer => {}).catch();
        this.$rbj.StreamConversion.blobORfileToText(paramsObj).then(text => {}).catch();
        this.$rbj.StreamConversion.dataURLtoFile(dataurl, filename); // 返回 File 对象
        this.$rbj.StreamConversion.dataURLtoBlob(dataurl); // 返回 Blob 对象
        this.$rbj.StreamConversion.dataURLToArrayBuffer(base64); // 返回 ArrayBuffer 对象
        this.$rbj.StreamConversion.blobToFile(blob, filename); // 返回 File 对象
        this.$rbj.StreamConversion.blobStrUrlToBlob(blobUrl).then(blob => {}).catch(); // blob 字符路径 转成 Blob 对象
        this.$rbj.StreamConversion.fileToBlob(file); // 返回 Blob 对象
        this.$rbj.StreamConversion.arrayBufferToBlob(arrayBuffer); // 返回 Blob 对象
        this.$rbj.StreamConversion.arrayBufferToFile(arrayBuffer, filename); // 返回 File 对象
        this.$rbj.StreamConversion.arrayBufferToDataURL(buffer); // 返回 dataUrl 字符串
    }
}
```

## rbj 日志

```js
export default {
    created(){
        // $rbj 日志, 打印各种级别的日志, 可以直接在 rbj 的配置对象中, 控制是否进行控制台打印
        this.$rbj.logs.logs();
        this.$rbj.logs.ALL();
        this.$rbj.logs.DEBUG();
        this.$rbj.logs.ERROR();
        this.$rbj.logs.INFO();
        this.$rbj.logs.TRACE();
        this.$rbj.logs.WARN();
    }
}
```
