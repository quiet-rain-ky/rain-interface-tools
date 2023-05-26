# rain-interface-tools

#### introduce

This is an interface docking tool, which is the step when docking with background data

#### Installation tutorial

npm install rain-interface-tools -D

#### instructions

```js
1. Vue Plug in installation and configuration instructions
import { rbj, importsConfigObj } from 'rain-interface-tools';

const userConfigs = {
        // Docking object one
        one: {
            // Whether to temporarily use fetch as the request object when the global is another request object
            tempUseFetch: true,
            // Set request path
            url: "/user/home",
            // Requested method type
            method: "GET", // By default, the get method is in the form of application / x-www-form-urlencoded to transfer parameters. By default, the post method is in the form of application / JSON to transfer parameters,
            // Setting of request header (optional)
            requestConfig: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            interfaceData(data){ // Note: this function can only be used in automatic docking, or it can also be used in false data mode, but this data has no data in false data mode
                // Data docking operation. The data in the component will receive what data is returned
                return {}
            }
        },
}

// The importsconfigobj() function imports the array list of all configuration objects in the specified directory and the objects in multiple files. It can be used to import multiple docking objects in modules
// Parameter example:
// [
//     require("one.js"),
//     require("two.js"),
//     require("there.js")
// ]
// Return value: {...} A composite object returned after synthesizing the objects of all modules in the array
// You can also directly use the require. Net provided with webpack Use the context () method to import multiple JS files in the specified directory
const configObj = importsConfigObj(require.context("configs/subConfig/", true, /.js$/).keys().map(item => require("configs/subConfig/" + item.substr(2, item.length))));
console.log(configObj, "Merge objects of all JS files in the specified directory");



Vue.use(
    new rbj({
        // The requested host address. The default value is "localhost: 8080"
        reqAddress: "localhost:8080",
        // The user's data docking configuration file, userconfigs, is the directly imported object, and configobj uses importsconfigobj to import the object
        userConfig: (userConfigs || configObj),
        // Whether to use fetch as the data request object. The default value is true
        useFetch: false,
        // Whether the console outputs logs. The default value is true
        logs: true,
        // Whether to generate log files. Default value: false
        isLogFile: false,
        // Generation path of log file. Default value:__ dirname, Note: must be an absolute path
        logFileUrl: "C:/users/",
        // Whether to enable false data mode. The default value is true
        falseDataMode: false,
        // Global request header settings
        globalHeaderConfig(dataObj){
            console.log(dataObj); // dataObj You can get the rbj object
            return { // The returned object is the global request header setting
                "Content-Type": "application/x-www-form-urlencoded",
            }
        },
        // Null completion string when configuring filtering
        setNullString: "-暂无数据-",
        // Whether to open the mobile browser console. Note: this option is not supported for all platforms other than H5. The default value is false
        isConsole: false,
        // Enable the cache mode of the requested data (the false data mode will also take effect after enabling). The default value is false
        isEnableCache: true,
        // Global, request filter function
        globalRequestFilterFun(reqParams, currentUserConfigObjData, operandObj){
            return true; // Return value: whether to intercept the request. Type: Boolean. Default value: false (no interception)
            return {}; // You can also return an object {} or an array [], that is, filter the requested parameters
            return [];
        },
        // Global, response filter function
        globalResponseFilterFun(respData, currentUserConfigObjData, operandObj){
            return true; // Return value: whether to intercept the response. Type: Boolean. Default value: false (no interception)
            return {}; // You can also return an object {} or an array [], that is, filter the data of the response
            return [];
        },
        // Initialize global custom functions
        globalFun: {
            fun_one(){
                console.log("This is the first global custom function for global initialization");
            },
            fun_two(){
                console.log("This is the second global custom function for global initialization");
            }
        }
    })
);




2. Used in components

export default {
    methods: { // rbj The data must be placed in the method
        rbjData(){
            return {
                /**
                 * Parameter 1: interface docking object name in userconfig configured in rbj,
                 * Parameter 2: name of the variable to be operated on,
                 * Parameter 3: current this object,
                 * Parameter 4: [optional] whether the Boolean temporarily uses the fetch request object, which is generally used when you use other request objects except fetch
                 */

                /* parameter:  interfaceDefinedName(Required), paramsObj(Required), dataName(Required), currentObj(Required), callbackFunc(Optional), isUrlEncode(Optional), tempUseFetch(Optional) */
                listName: this.$rbj.autoButtJoint("one", { age: 18 },  "listName", this, ()=>{}, true, false) // 自动对接方法
            },
        },
    },
    created(){
        this.rbjData(); // Initialize page data object
        // Data operation can also be performed during data initialization, any method
        /* interfaceDefinedNameUrl(Required), paramsObj(Required), isUrlEncode(Optional), tempUseFetch(Optional) */
        this.$rbj.buttJoint("one", { age: 18 }, true, false); // 手动对接方法
        this.$rbj.dataFilter(data); // This method can be used for data null value filtering. The default null value completes the string "- no data at present -"
        this.$rbj.setToken("LJSDIJFLFJSDKLJFLSDJFISJDLFWERPOISHDKNFKSDHFB"); // Set the token string to the local storage, and the token will be brought automatically when the request is made
        this.$rbj.getToken(); // Get token


        // In order to improve the reusability of data, the function derived from this caching mode to obtain cached data is introduced
        this.$rbj.getCacheData("one"); // Enter the name of each request configuration definition in the user's request configuration to obtain the data cached after the corresponding request. Note: it will not be cached until a request has been initiated


        // File upload interfacedefinedname (requested configuration object name), files (file path array), paramsobj (parameters attached to file upload), reqpropertyname (file property name during file upload),Ismultipartfile (whether to upload multiple files, the default value is false)
        this.$rbj.upload(); // File upload function

        // Global custom function
        this.$rbj.setGlobalFun("funName", ()=>{}); // Set global function
        this.$rbj.globalFun.自定义的函数名(); // In this way, you can directly call customized global functions

        // ============ Note: this plug-in also supports the use of uniapp ============
    }
}
```
