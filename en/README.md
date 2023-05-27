# rain-interface-tools

## introduce

This is a front-end page interface tool that simplifies the steps of background data interface docking and supports the use of H5 and uniapp

## Install

npm install rain-interface-tools -D

## easy to use

### Create configuration directory and files

```js
1. Create /config/subConfig in the root directory
2. Create index.js file in /config directory
3. Create some custom interface files in the /config/subConfig directory

Note: The directory name can be different. The above is just an example, but when using require.context() and import.meta.globEager(), be careful to modify the scanned file path
```

### /config/subConfig/xxx.js

```js
/**
* @description This is the interface configuration file. There can be multiple interface configuration files, but in the end, importsConfigObj() must be used to merge them together. Because they need to be merged together, try not to repeat the configuration name of each interface
* @type {import('rain-interface-tools/types/interFaceConfig').default}
* Note: @type is used as a type hint, the @type above is a non-modular type hint, and the modular configuration can use @type {import('rain-interface-tools/types/interFaceModuleConfig').default} for type hint
* Note: The configuration name of the interface is custom, so there will be no type hint
*/
export default { // Note: This demo uses a non-modular interface configuration object, you can also use a modular interface configuration object
// When defining an interface, do not have the same configuration name. When there are interfaces with the same configuration name, the lower interface will cover the upper interface, because in the end all interfaces will be merged together, so even if it is a different interface file, cannot have the same configuration name
one: {
description: "Interface description", // (optional) Interface description, generally used as a prompt
url: "/one/one", // request path of the interface
method: "GET", // request method type of the interface
paramsData(data, operandObj) {
// data request parameter data
},
interfaceData(data, operandObj) {
// data response parameter data
}
},
upload: { // Define the file upload interface
description: "Interface description", // (optional) Interface description, generally used as a prompt
url: "/upload/fileUpload", // request path of the interface
method: "POST", // request method type of the interface
paramsData(data, operandObj) {
// data request parameter data
},
interfaceData(data, operandObj) {
// data response parameter data
}
}
}
```

### /config/globalFun.js

```js
/**
* @type {import('rain-interface-tools/types/interfaceButtJoint').globalFunType} Description: @type is used as a type hint
*/
export default {
// set default value
dfVal(data, defaultVal = "No data yet") {
return data ? data : defaultVal;
}
}
```

### /config/index.js

```js
import { Rbj, UniRbjTwo, UniRbjThere, importsConfigObj } from "rain-interface-tools";
import globalFun from "./globalFun.js";
// Import all the interface configuration files in the /config/subConfig/ directory, note: if the directory path is inconsistent with the configuration below, you need to modify the file path to be scanned
// --- vue2 uses this ---
const configObj = importsConfigObj(require.context("configs/subConfig/", true, /.js$/).keys().map(item => require("configs/subConfig/" + item.substr(2, item .length)))); // require.context() will scan all files in the specified directory, only used in Vue2
// --- vue3 uses this ---
const configObj = importsConfigObj(import.meta.globEager("configs/subConfig/**.js")); // import.meta.globEager() will scan all files in the specified directory, only used in Vue3


// Create rbj plug-in object, note: uniapp project can use UniRbjTwo or UniRbjThere object to create
export default new Rbj({ // export this plug-in, install this plug-in in the main.js file
reqAddress: "https://xxx.xxx.com", // server address requested by the interface
userConfig: configObj, // set interface configuration
logs: process.env.NODE_ENV === "development",
tokenName: "token", // Customize the name of the token on the request header, the default name is: Authorization
globalFun: globalFun // custom global function
});
```

### /main.js

```js
import Rbj from "configs/index.js";
Vue.use(Rbj); // Install the rain-interface-tools plugin on Vue
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

// request function using autowired interface data
this.$rbj.autoButtJoint("one", this.oneParams, "oneData", this);

// You can also manually assemble the data
this.$rbj.buttJoint("one", this.oneParams).then((resData)=>{
// resData is the response data
self.oneData = resData;
});

// Choose one of the above two request methods

// use the file upload function
this.$rbj.upload("upload", fileObj, { reqPropertyName: "file", isFilePathUpload: true }).then((resData)=>{
// resData is the data that the server responds to
self.imgUrl = resData;
});
}
}
</script>

<style lang="scss">
</style>
```

### uniapp Nvue Instructions for use

```vue
<template>
<div>
<text>{{oneData}}</text>
<img :src="imgUrl"></img>
</div>
</template>
<script>
import rbj from "../../configs/index.js"; // Import the rbj core object of the specified path above, note: the core object does not include the rbj log object, so if we want to use the rbj log object, we need to import it separately log object
import { logObj } from "rain-interface-tools"; // import rbj log object
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

// request function using autowired interface data
rbj.autoButtJoint("one", this.oneParams, "oneData", this);

// You can also manually assemble the data
rbj.buttJoint("one", this.oneParams).then((resData)=>{
// resData is the response data
self.oneData = resData;
});

// Choose one of the above two request methods

// use the file upload function
rbj.upload("upload", fileObj, { reqPropertyName: "file", isFilePathUpload: true }).then((resData)=>{
// resData is the data that the server responds to
self.imgUrl = resData;
});
}
}
</script>

<style lang="scss">
</style>
```

## Detailed configuration instructions

```js
1. Interface configuration object
(1) Modular interface configuration object
const userConfigs = {
moduleName: "User user module", // (optional) only used for console error prompts
moduleUrl: "/user", // (optional) is empty by default, that is, to set the module path of the current interface object, which will be automatically added after the request server address reqAddress and in front of each interface url, only for the current module object The interfaces in the interfaceList interface list take effect
interfaceList: { // Define the interface list in the current module (note: only the importsConfigObj() function will process the modular interface object, so if you use the modular interface object, you must use the importsConfigObj() function)
// Interface docking object one, this attribute name is customized
one: {
// (Optional) Interface description, generally used as a prompt
description: "Interface Description",
// Customize the request service address of the current interface (note: when customizing the request service address of the current interface, you must bring the http:// or https:// protocol prefix), and use the global reqAddress path by default
reqAddress: "https://localhost:8080/",
// Whether to temporarily use fetch as the request object when the global is another request object, note: this option is not available when in the uniapp project
tempUseFetch: true,
// set request path
url: "/user/home",
// Requested method type
method: "GET", // The GET method defaults to the application/x-www-form-urlencoded method to pass parameters, and the POST defaults to the application/json form to pass parameters
// The request configuration object of the current interface
requestConfig: {
// Configure the request header of the current interface
headers: {
// Note: When setting the attribute name, double quotes must be added to take effect
// "Content-Type": "application/x-www-form-urlencoded",
}
//... You can also configure some other properties
},
/**
* When this function is declared, the parameters will be filtered, what data is returned by this function, and what parameters are sent to the server when requesting
* @param data | Object Explanation: data contains paramsObj body parameters and pathParams path parameters, which can directly modify the reference data of attributes in the data object to achieve the effect of modifying request parameters
* @param operandObj | Object Description: operandObj is the operation object to assemble data during automatic docking, and this value is null when it is not automatic docking
* @param isAppendData | boolean Description: Whether the current interface is in the append mode, this value is null when it is not automatically connected, Note: Unless you set the isAppendData property in the options object of autoButtJoint() when it is in automatic connection, otherwise the isAppendData is still empty
* @param frontORback | boolean Description: When in append mode, confirm whether to append data forward or backward, this value is null when not automatically connected, default value: false append backward
*/
paramsData(data, operandObj, isAppendData, frontORback) {
// data.paramsObj = {names: "Xiao Ming"};
// data.pathParams = 1;
// data.paramsObj = JSON.stringify(data.aramsObj); // You can also convert the entire parameter into a json string
// Note: This function only has the function of modifying request parameters, but does not have the function of intercepting and interrupting requests
return { // If there is a return value, please return it according to the following format
paramsObj: {}, // This return value resets the paramsObj parameter object
pathParams: "" // This return value resets the pathParams parameter
}
},
// Filter the response data, whether it is a buttJoint manual object or an autoButtJoint automatic docking, this interfaceData() function will run (that is, the response data can be filtered normally)
interfaceData(data, operandObj) { // The object that the data server responds to, operandObj is the operation object that needs to assemble data during automatic docking. This value is null when it is not automatic docking. Note: this function can only be used when the interface is docked, or fake data It can also be used in the mode, but this data has no data in the false data mode
// Data docking operation, what data is returned, the data in the component will receive what data
// return {}
// Note: This function only has the function of modifying the response data, not the function of intercepting the response
// Note: If return returns an undefined attribute or undefined, the Rbj plug-in object will treat it as if this function does not return data, and the response data will be directly returned to the page without being filtered by the interfaceData function, so before return It is best to first determine whether a returned attribute exists
// Note: If the return is null, the Rbj plug-in object will be regarded as this function has returned data, that is, returning null is valid
}
},
two: 'one' // Define a two alias for the one interface, that is, support adding an alias to an interface, mainly for the use of an interface on different pages, which will cause the interface of which page it is not known, so give the same interface Defining multiple aliases can make it easier for you to distinguish the interfaces of different modules or pages during multi-module or multi-page development
}
}

(2) Non-modular interface configuration objects, just do not use moduleUrl and interfaceList directly
const userConfigs = {
// Docking object one, this attribute name is customized
one: {
// optional, default is ''
description: "Interface Description",
// Customize the request service address of the current interface (note: when customizing the request service address of the current interface, you must bring the http:// or https:// protocol prefix), and use the global reqAddress path by default
reqAddress: "https://localhost:8080/",
// Whether to temporarily use fetch as the request object when the global is another request object, note: this option is not available when in the uniapp project
tempUseFetch: true,
// set request path
url: "/user/home",
// Requested method type
method: "GET", // The GET method defaults to the application/x-www-form-urlencoded method to pass parameters, and the POST defaults to the application/json form to pass parameters
// The request configuration object of the current interface
requestConfig: {
// Configure the request header of the current interface
headers: {
// Note: When setting the attribute name, double quotes must be added to take effect
// "Content-Type": "application/x-www-form-urlencoded",
}
//... You can also configure some other properties
},
/**
* When this function is declared, the parameters will be filtered, what data is returned by this function, and what parameters are sent to the server when the request is made
* @param data | Object Explanation: data contains paramsObj body parameters and pathParams path parameters, which can directly modify the reference data of attributes in the data object to achieve the effect of modifying request parameters
* @param operandObj | Object Description: operandObj is the operation object to assemble data during automatic docking, and this value is null when it is not automatic docking
* @param isAppendData | boolean Description: Whether the current interface is in the append mode, this value is null when it is not automatically connected, Note: Unless you set the isAppendData property in the options object of autoButtJoint() when it is in automatic connection, otherwise the isAppendData is still empty
* @param frontORback | boolean Description: When in append mode, confirm whether to append data forward or backward, this value is null when not automatically connected, default value: false append backward
*/
paramsData(data, operandObj, isAppendData, frontORback) {
// data.paramsObj = {names: "Xiao Ming"};
// data.pathParams = 1;
// data.paramsObj = JSON.stringify(data.aramsObj); // You can also convert the entire parameter into a json string
// Note: This function only has the function of modifying request parameters, but does not have the function of intercepting and interrupting requests
return { // If there is a return value, please return it according to the following format
paramsObj: {}, // This return value resets the paramsObj parameter object
pathParams: "" // This return value resets the pathParams parameter
}
},
// Filter the response data, whether it is a buttJoint manual object or an autoButtJoint automatic docking, this interfaceData() function will run (that is, the response data can be filtered normally)
interfaceData(data, operandObj) { // The object that the data server responds to, operandObj is the operation object that needs to assemble data during automatic docking. This value is null when it is not automatic docking. Note: this function can only be used when the interface is docked, or fake data It can also be used in the mode, but this data has no data in the false data mode
// Data docking operation, what data is returned, the data in the component will receive what data
// return {}
// Note: This function only has the function of modifying the response data, not the function of intercepting the response
// Note: If return returns an undefined attribute or undefined, the Rbj plug-in object will treat it as if this function does not return data, and the response data will be directly returned to the page without being filtered by the interfaceData function, so before return It is best to first determine whether a returned property exists
// Note: If the return is null, the Rbj plug-in object will be regarded as this function has returned data, that is, returning null is valid
}
},
two: 'one' // Define a two alias for the one interface, that is, support adding an alias to an interface, mainly for the use of an interface on different pages, which will cause the interface of which page it is not known, so give the same interface Defining multiple aliases can make it easier for you to distinguish the interfaces of different modules or pages during multi-module or multi-page development
}


2. Import (Rbj || UniRbjTwo || UniRbjThere) plug-in object, use the importsConfigObj function to integrate all (interface configuration objects) in the specified directory and all global component objects in the specified directory (uniapp does not recommend using this method to register global components, It is recommended to use uniapp's built-in way to register global components)
import { Rbj, UniRbjTwo, UniRbjThere, importsConfigObj, logObj } from 'rain-interface-tools';
// Note: In addition to the Rbj basic core object, there are also UniRbjTwo (that is, for uniapp Vue2 version) and UniRbjThere (that is, for uniapp Vue3 version) rbj objects that are compatible with uniapp. It is recommended to use UniRbjTwo when developing uniapp projects Or UniRbjThere object to develop uniapp project, the core rbj object can be used on web or H5 project
// Note: Since log objects are generally automatically mounted on Vue global properties, log objects cannot be used in non-Vue components. We can directly import them through import { logObj } from 'rain-interface-tools'; way to use the rbj log object

// The role of the importsConfigObj() helper function: to integrate multiple interface configuration objects, or to import all configuration object files in the specified directory, but the imported files should be used in combination with require.context or import.meta.globEager, see how to use them in detail You can see an example below
// parameter example:
// [ // This is the file import method. You can directly use require.context or import.meta.globEager to uniformly obtain the interface configuration objects of all files in the specified directory, so you don't need to manually import them one by one. For details, you can use see example below
// require("one.js"),
// require("two. js"),
// require("there.js")
// ]
// or multiple configuration objects, the configuration object can be a modular configuration object or a non-modular configuration object, the two can also be used together, the importsConfigObj function will automatically handle it
//[
// {one: {url:''}},
// {one: {url:''}},
// {interfaceList: {one: {url:''}}}
// ]
// Or a single module configuration object, you can directly pass a single modular interface configuration object into the importsConfigObj function, and the importsConfigObj function will directly process the modular interface configuration object
// {interfaceList: {one: {url:''}}}
// Return value: {...} After synthesizing the objects of all modules in the array, return a synthetic object with multiple configurations fused together

// #ifndef VUE3
const configObj = importsConfigObj(require.context("configs/subConfig/", true, /.js$/).keys().map(item => require("configs/subConfig/" + item.substr(2, item .length)))); // You can directly use the require.context() method that comes with webpack to import multiple js files in the specified directory
// Note: In the development of uniapp projects, you don't need to use the vue global component method below, as long as the components are installed in the components directory of the project "root directory" or "uni_modules", and conform to components/component name/component name.vue or uni_modules /plugin ID/components/component name/component name.vue directory structure. It can be used directly on the page. Note: In the uniapp project, a directory with the same name as the component should be created in the outer layer of the component
const globalComponentObj = require.context("components/", true, /.vue$/).keys().map(item => require("components/" + item.substr(2, item.length))); // Use require.context() to get the components of the specified directory
// #endif

// #ifdef VUE3
const configObj = importsConfigObj(import.meta.globEager("configs/subConfig/**.js")); // Or use import.meta.lobEager way
// Note: In developing a uniapp project, you don't need to use the vue global component method below, as long as the component is installed in the components directory of the project "root directory" or "uni_modules", and complies with components/component name/component name.vue or uni_modules /plugin ID/components/component name/component name.vue directory structure. It can be used directly on the page. Note: In the uniapp project, a directory with the same name as the component should be created in the outer layer of the component
const globalComponentObj = import.meta.glob("components/*.vue"); // Use the import.meta.glob() function to obtain all components in the specified directory
// #endif

// ======== Note: uniapp does not support Vue's global components when developing mobile APP projects, so it is best to use the built-in easycom component mode when developing uniapp projects ========

const configObj = importsConfigObj(userConfigs); // You can directly pass a single modular interface configuration object into the importsConfigObj function, and the importsConfigObj function will directly process the modular interface configuration object


3. Use the (Rbj || UniRbjTwo || UniRbjThere) plug-in object to install the plug-in on Vue, import the fused interface configuration object, and import the fused global component object (uniapp does not recommend using this method to register global components, it is recommended to use uniapp's built-in easycom method to register global components)
Vue. use(
new Rbj({ // In addition to the core Rbj plug-in object, you can also use UniRbjTwo (that is, for uniapp Vue2 version) and UniRbjThere (that is, for uniapp Vue3 version) rbj plug-in objects that are compatible with uniapp , it is recommended to use UniRbjTwo or UniRbjThere objects to develop uniapp projects when developing uniapp projects, and the core Rbj objects can be used on web or H5 projects
// Requested host address, default value: "localhost:8080", when you need to use https, you can directly add https://localhost:8080 in front of the request address
reqAddress: "localhost:8080",
// The user interface configuration object, userConfigs is the configuration object directly imported, configObj is the object synthesized by importing multiple js files using the importsConfigObj function above, you can choose one of the two methods
userConfig: configObj,
// Set the global component, note: the custom global component must have a name attribute, function: it is the name of the global component, and also the label name of the global component
globalComponent: globalComponentObj,
// Whether to use fetch globally as the data request object, default value: false
// Note: fetch requests do not filter empty data
useFetch: false,
// Whether the console logs output, default value: false
logs: process.env.NODE_ENV === "development", // Determine whether it is a development or production environment. If the development environment is true, the log will be printed, and if the production environment is false, the log will not be printed
// Whether the logs printed on the console should be output with a style. This configuration needs to be used with the logs attribute configuration above, and this style can only take effect normally in H5 mode. Default value: false
isLogStyle: false,
// Whether to enable the fake data mode, default value: false
falseDataMode: false,
// global request configuration function
globalRequestConfig(dataObj) {
// dataObj can get rbj object
// return { // The returned object is the global request header setting
// headers: {
// "Content-Type": "application/x-www-form-urlencoded",
// }
// }
},
// When configuring the request response, the null value completion string when filtering the response data can also call the dataFilter() function to perform null value filtering on the specified data object. Note: the default is not to perform null value filtering when responding
setNullString: "-No data-",
// Enable the cache mode of the requested data (false data mode will also take effect after it is enabled), default value: false
// The main function of the cache mode is to temporarily cache the data after the interface request. You can use the getCacheData("interface configuration name") function to obtain the data temporarily cached by the specified interface. The temporary cache is the time limit for the next time of the same interface It can be obtained before the request, because the data of the next request of the same interface will overwrite the temporary cached data
isEnableCache: true,
// Rule interceptor, note: only regular verification and interception is performed on the request path in the user interface configuration object, excluding https protocol and domain name host address
interceptor: [
{
// Regular expression, string or object or array can be passed in (that is, multiple rules can be used on one interceptor), explanation: Intercept requests and responses based on regular expressions
regular: "^ab$" | {
str: "^ab$", // regular expression
pattern: "g" // regular validation pattern
} | [{str: "^ab$", pattern: "g"}, "^ab$", ..., // Strings and objects are also supported in the array
reverseVerify: false, //regular reverse interception, it will intercept the verification failure, and pass the verification success, default: false no reverse operation
/**
* @description global, request filter function
* @param reqParams The parameters of the current request
* @param pathParams path parameters
* @param regularData If multiple interceptors match the same request, and the previous interceptor returns non-Boolean data, then regularData is the data returned by the previous interceptor. If there are three interceptors, the first If the data is returned, the second one does not return data or returns a boolean value, then the regularData parameter in the third interceptor receives the data returned by the first interceptor, or null if none of the interceptors return data
* @param rbjObj the instance of the current rbj object
* @param currentUserConfigObjData The configuration data object of the current user
* @param operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
* @return Note: If multiple interceptors match the same request, and all return data to be filtered, the data returned by the interceptor below will overwrite the data returned by the interceptor above. But we can get the data returned by the previous interceptor from the parameter regularData, note: if you don't return anything, it will be released by default
*/
requestRegular(reqParams, pathParams, regularData, rbjObj, currentUserConfigObjData, operandObj) { // Request interception, similar to globalRequestFilterFun below, Note: You can leave it out when you don't need this function
if (Array.isArray(reqParams)) {
return [interfaceDefinedName, Files, paramsObj, reqPropertyName, isFilePathUpload];
} else {
return false; // release, default value: false, no interception
return true; // Intercept
return { // Objects can also be returned directly, but please follow the format below
paramsObj: {}, // paramsObj is to reset the request parameter object
pathParams: "" // pathParams is to reset the path parameter reset parameters
}
}
},
/**
* @description global, response filter function
* @param respData The response data of the current request
* @param regularData If multiple interceptors match the same request, and the previous interceptor returns non-Boolean data, then regularData is the data returned by the previous interceptor. If there are three interceptors, the first If the data is returned, the second one does not return data or returns a boolean value, then the regularData parameter in the third interceptor receives the data returned by the first interceptor, or null if none of the interceptors return data
* @param rbjObj the instance of the current rbj object
* @param currentUserConfigObjData The configuration data object of the current user
* @param operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
* @return Note: If multiple interceptors match the same request, and all return data to be filtered, the data returned by the interceptor below will overwrite the data returned by the interceptor above. But we can get the data returned by the previous interceptor from the parameter regularData, note: if you don't return anything, it will be released by default
*/
responseRegular(respData, regularData, rbjObj, currentUserConfigObjData, operandObj) { // Response interception, similar to globalResponseFilterFun below, Note: You can leave it out when you don’t need this function
return false;
return true;
// You can directly return an object or an array to filter the response data
return {};
return [];
}
},
...// Multiple interceptors can be set
],
/**
* Global, request filter function, when there is no return value, it will be automatically released by default
* Parameter 1: reqParams The parameters of the current request
* Parameter 2: pathParams path parameters
* Parameter 3: rbjObj The instance of the current rbj object
* Parameter 4: currentUserConfigObjData The configuration data object of the current user
* Parameter 5: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
globalRequestFilterFun(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
// currentUserConfigObjData can be modified directly, request interface configuration object
// Regardless of whether reqParams is a file upload request or a normal request, we can directly modify the parameter array, or the parameter object, and make a small change to the internal request parameters (the modified parameters will automatically take effect and be used on the requested interface), You can also return a new request parameter object (that is, return an object {} or array [] to filter request parameters)
return false; // release
return true; // Intercept
return { // Objects can also be returned directly, but please follow the format below
paramsObj: {}, // paramsObj is to reset the request parameter object
pathParams: "" // pathParams is to reset the path parameter reset parameters
}
},
/**
* Global, response filter function, when there is no return value, it will be automatically released by default
* Parameter 1: respData The response data of the current request
* Parameter 2: rbjObj The instance of the current rbj object
* Parameter 3: currentUserConfigObjData The configuration data object of the current user
* Parameter 4: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
globalResponseFilterFun(respData, rbjObj, currentUserConfigObjData, operandObj) {
return false; // release
return true; // interception, return value: whether to intercept the response, type: boolean, default value: false (not intercepted), if the interception is a manual docking request response, then will not be executed, catch will be executed, if What is intercepted is the request response of automatic docking, then automatic docking will no longer be automatically assigned by default
return {}; // You can also return an object {} or an array [], that is, to filter the response data
return [];
},
// Initialize the global custom call function, which can be called in any component using this.$rbj.globalFun.Custom function name();
// Note: You can also customize some commonly used global variables, or use this.$rbj.globalFun. variable name to call
globalFun: {
one: 1, // can define commonly used global variables

fun_one(){
console.log("This is the first global custom function initialized globally", this.$rbj); // In the current global function, the $rbj object can also be called through this
this.fun_two(); // Note: In a global function, you can directly use this to call other global functions
},
fun_two(){
console.log("This is the second global custom function initialized globally");
}
},
/**
* The name of the custom token on the request header, the default value: "Authorization"
*/
tokenName: "Authorization",
/**
* Function to customize the way of setting token
* Parameter 1: The token string to be set
* Parameter 2: the current rbj instance object
* Note: There is a function to set the token by default, so it is not necessary to set it
* Note: When not set, you need to delete this function in the object to prevent this function from affecting the execution of the default token function
*/
customSetTokenFun(token, rbjObj) {
// example:
// window. localStorage.etItem("token", token);
},
/**
* Function to customize the way to get token
* Parameter: the current rbj instance object
* @return Note: After customizing the acquisition method, the obtained token string needs to be returned
* Note: There is a function to get the token by default, so it is not necessary to set it
* Note: When not set, this function needs to be deleted in the object to prevent this function from affecting the execution of the default token acquisition function
*/
customGetTokenFun(rbjObj) {
// return "LSJFKLSDJFLJSLKDJFLSDKF";
},
/**
* Customize the function of removing token
* Parameter: the current rbj instance object
* Note: There is a function to remove the token by default, so it is not necessary to set it
* Note: When not set, this function needs to be deleted in the object to prevent this function from affecting the execution of the default token removal function
*/
customRemoveTokenFun(rbjObj) {
// example:
// window. localStorage.removeItem("token", token);
}
})
);




```

## Support to install the configured rbj object on any object

```js

// Installation example:
let toolsObj = {}; // It can be an existing object or a manually defined new object, here is a manually defined new object
new Rbj({rbj configuration item}).Install_rbj(toolsObj); // Install the rbj object to the specified object

// Usage example: the $rbj object can be called directly in the toolsObj object
toolsObj.$rbj.autoButtJoint("one", { age: 18 }, "listName", this);

```

## Instructions for use in components

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
* @param interfaceDefinedName | String (required), (the attribute name of each interface configuration in the non-modular interface configuration object) or (the interfaceList in the modular interface configuration object, the attribute name of each interface configuration in the interface list attribute name)
* @param paramsObj | Object (required, but you can not pass any data if it is not required, but you must set a null), request parameter object, can be null
* @param dataName | String (required), which property in the object to assemble the data on, that is, the name of the variable to be operated, Note: This parameter is a string type
* @param currentObj | Object (required), the object to assemble data, generally in the component is the this object of the current component
*
* @param options | Object Optional parameter description: ---
* Parameter 1: pathParams (optional, but can be null), the path parameters of the get request
* Parameter 2: callbackFunc (optional), auto The callback function for automatic docking, this callback function has the same function as the interfaceData() function in the user's request configuration, the difference is that this callback function uses the interfaceData() function already Filter the returned data, which can then be filtered again
* Parameter 3: isAppendData (optional), whether to let the server response data be assigned to the specified variable in the form of appending. Note: Arrays will append elements, and objects will append attributes and attribute values. Of course, appending must be specified Variable, must be an array or an object by default, and the data responded by the server, the filtered data must also be an array or an object, and the array can only add elements to the array, and the object can only add attributes to the object
* Parameter 4: isUrlEncode (optional) | boolean, whether to send data whose content type is application/x-www-form-urlencoded when post request
* Parameter 5: tempUseFetch (optional) | boolean Description: Whether to temporarily use the fetch request object, generally used when you use other request objects except fetch, note: this option is not available when in the uniapp project
* Parameter 6: frontORback (optional) | boolean Description: It needs to be used in conjunction with the isAppendData attribute parameter. When in the append mode, confirm whether to append data forward or backward. Default value: false Append data backward. Note: only This property only takes effect when the append target is an array
*
* @return function return value type description: Object, including refRefreshFlag(), refRefreshGroup() reference refresh flag method
* refRefreshFlag() parameter description: freshTagName refresh tag name
* refRefreshFlag method description: mark the current interface, and then use $rbj.refreshFlagInterface("tag name") to call this interface again in other places
* Usage scenario: reference refresh, that is, after receiving the notification from the background, automatically refresh the data of the current page (that is, re-call the interface of the current page), this method can avoid reloading the webpage
* refRefreshGroup() parameter description: groupName (refresh group name), uniqueTagName (unique tag that does not repeat)
* refRefreshGroup method description: mark the current interface into the specified group, and then use $rbj.refreshGroupInterface("tag name") to call all the interfaces in the group again in other places to perform batch interface refresh
* Usage scenario: reference refresh, that is, after receiving the notification from the background, automatically refresh the data of the current page in batches (that is, re-call the interface of the current page), this method can avoid reloading the web page
*/

/* Parameters: interfaceDefinedName(required), paramsObj(optional, may be null), dataName(required), currentObj(required), pathParams(optional, may be null), callbackFunc(optional, this callback function It has the same function as the interfaceData() function in the request configuration, the difference is that this callback function uses the data returned by the function that has been filtered, and then it can be filtered again), isAppendData (optional), isUrlEncode (optional), tempUseFetch (optional, note: this option is not available when in uniapp project) */
let refRefreshObj = this. $rbj.utoButtJoint("one", { age: 18 }, "listName", this, { // Automatic connection method, function: pass in parameters, send a request according to user configuration, and automatically assemble the response data to the specified object
pathParams: "123", // directly splicing strings on the path, both get and post can be used
callbackFunc(data, operandObj) {}, // Note: If it is intercepted by a global filter or interceptor and is not released, this function will not run
isUrlEncode: false, // Whether to key-value encode the request body of the post request, the default value is false, note: only for post requests, get requests are invalid, note: this parameter is not available when in the NVue page or component of the uniapp project
tempUseFetch: false, // Note: This option is not available when in uniapp project, the default value is false
isAppendData: true, // append data, default value is false
frontORback: false, // default value: false to append data backwards, note: it needs to be used in conjunction with isAppendData
globalFilterInterCept: { // Global filter, if intercepted, the callback function executed by default (note: only valid for the current interface)
/**
* Global request filter, after interception, the callback function executed by default (note: only valid for the request of the current interface)
* Parameter 1: reqParams The parameters of the current request
* Parameter 2: pathParams path parameters
* Parameter 3: rbjObj The instance of the current rbj object
* Parameter 4: currentUserConfigObjData The configuration data object of the current user
* Parameter 5: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
},
/**
* Global response filter, after interception, the callback function executed by default (note: only valid for the response of the current interface)
* Parameter 1: respData The response data of the current request
* Parameter 2: rbjObj The instance of the current rbj object
* Parameter 3: currentUserConfigObjData The configuration data object of the current user
* Parameter 4: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
}
},
/**
* Whether to allow the current request to add token in the request header, default value: true to allow
*/
isUseToken: true,
});

/* interfaceDefinedNameUrl(required), paramsObj(optional, can be null), pathParams(optional), isUrlEncode(optional), tempUseFetch(optional, note: this option is not available when in uniapp project) note: if When the request response is intercepted globally, the catch function will treat the global interception as an error behavior, and automatically execute the catch function once */
let butRefRefreshObj = this. $rbj.uttJoint("one", { age: 18 }, { // Manual docking method, function: pass in parameters, send a request according to user configuration, and return a Promise object, through which you can receive the data returned by the server after the request response, The difference from automatic docking is: the returned data needs to be processed manually by yourself
pathParams: "123", // directly splicing strings on the path, both get and post can be used
isUrlEncode: true, // Whether to key-value encode the request body of the post request, note: only for post requests, get requests are invalid, note: this parameter is not available when in the NVue page or component of the uniapp project
tempUseFetch: false, // note: this option is not available when in uniapp project
isFileUpload: false, // You can also enable this method for manual file upload, default value: false
globalFilterInterCept: { // Global filter, if intercepted, the callback function executed by default (note: only valid for the current interface)
/**
* Global request filter, after interception, the callback function executed by default (note: only valid for the request of the current interface)
* Parameter 1: reqParams The parameters of the current request
* Parameter 2: pathParams path parameters
* Parameter 3: rbjObj The instance of the current rbj object
* Parameter 4: currentUserConfigObjData The configuration data object of the current user
* Parameter 5: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
},
/**
* Global response filter, after interception, the callback function executed by default (note: only valid for the response of the current interface)
* Parameter 1: respData The response data of the current request
* Parameter 2: rbjObj The instance of the current rbj object
* Parameter 3: currentUserConfigObjData The configuration data object of the current user
* Parameter 4: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
}
},
/**
* Whether to allow the current request to add token in the request header, default value: true to allow
*/
isUseToken: true,
}).then((data)=>{}).catch((err)=>{}); // Note: If it is intercepted by a global filter or interceptor and is not released, the catch function will run, and The parameter error of err will become an 'ISNULL' string

/**
* @description file upload
* @param interfaceDefinedName | String (requested interface configuration object name)
* @param Files (file temporary path array | file object array | single file object can also be passed in directly), note: this parameter in uniapp can only upload a single file, does not support uploading multiple files, and isFilePathUpload must be set to true
* @param options parameter object description
* paramsObj (parameters attached to file upload)
* reqPropertyName (property name of the file when the file is uploaded), default value: file
* isFilePathUpload (whether to use filePath (that is, a single temporary path) for file upload, this option is only for uniapp) Note: This parameter must be set to true in uniapp to upload files successfully
* Note: When you are in the fetch request mode and uploading a file, the request header you set will be invalid. Explanation: Because if the request header is set when the fetch request is uploading the file, the upload file will fail, that is, if If you use fetch to upload files, you cannot bring token or other parameters in the request header
*/
this. $rbj.pload("one", new File(), { // file upload function
paramsObj: { age: 18 }, // The parameters carried when uploading files
reqPropertyName: "file", // The attribute name of the file when the file is uploaded
isFilePathUpload: true, // Will automatically make a default judgment of whether it is a uniapp project. If it is a uniapp project, this configuration defaults to true, otherwise this configuration defaults to false
globalFilterInterCept: { // Global filter, if intercepted, the callback function executed by default (note: only valid for the current interface)
/**
* Global request filter, after interception, the callback function executed by default (note: only valid for the request of the current interface)
* Parameter 1: reqParams The parameters of the current request
* Parameter 2: pathParams path parameters
* Parameter 3: rbjObj The instance of the current rbj object
* Parameter 4: currentUserConfigObjData The configuration data object of the current user
* Parameter 5: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
requestCallback(reqParams, pathParams, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
},
/**
* Global response filter, after interception, the callback function executed by default (note: only valid for the response of the current interface)
* Parameter 1: respData The response data of the current request
* Parameter 2: rbjObj The instance of the current rbj object
* Parameter 3: currentUserConfigObjData The configuration data object of the current user
* Parameter 4: operandObj The operation object to assemble data during automatic docking, this value is null when it is not automatic docking
*/
responseCallback(respData, rbjObj, currentUserConfigObjData, operandObj) {
// callback function content...
}
},
/**
* Whether to allow the current request to add token in the request header, default value: true to allow
*/
isUseToken: true,
}).then((resData)=>{}).catch((err)=>{}); // Note: If it is intercepted by a global filter or interceptor and is not released, the parameter error of the catch function will be becomes an 'ISNULL' string

this.$rbj.customRequest(); // custom request, same usage as axios() function

// ========================================================================================================================================================= ==============================
// Refresh tag description: mark the specified interface, or group the marked interface, and then use the function to execute the refresh mark elsewhere to call this interface again
// Use scenario description: Reference refresh, that is, after receiving the notification from the background, automatically refresh the data of the current page (that is, re-call the interface of the current page), this method can avoid reloading the web page

// ----- autoButtJoint add refresh marker -----
refRefreshObj.refRefreshFlag("one"); // Define the flag refresh flag for the current interface, refRefreshObj is the return value object of the autoButtJoint() function above
refRefreshObj.refRefreshGroup("two", "ones"); // Parameter 1: Define the group group mark for the current interface, Parameter 2: Set a unique identifier for the current interface in the refresh group, which is not repeated

// refRefreshFlag() and refRefreshGroup() can call each other, that is to say, you can define a flag tag for the interface, or define a group tag for the interface
refRefreshObj.refRefreshFlag("one").refRefreshGroup("two", "ones");
refRefreshObj.refRefreshGroup("two", "ones").refRefreshFlag("one");



// ----- buttJoint add refresh marker -----
butRefRefreshObj.refRefreshFlag("one"); // Define the flag refresh flag for the current interface, butRefRefreshObj is the return value object of the above buttJoint() function
butRefRefreshObj.refRefreshGroup("two", "ones"); // Parameter 1: Define the group group mark for the current interface, Parameter 2: Set a unique identifier for the current interface in the refresh group, which is not repeated

// refRefreshFlag() and refRefreshGroup() can call each other, that is to say, you can define a flag tag for the interface, or define a group tag for the interface, and then and catch methods can be used normally
butRefRefreshObj.efRefreshFlag("one").then(item => {}).refRefreshGroup("two", "ones").catch(item => {});
butRefreshObj.then(item => {}).refRefreshGroup("two", "ones").then(item => {}).catch(item => {}).refRefreshFlag("one");


// ------ execute refresh flag------
this.$rbj.refreshFlagInterface("one"); // Reference refresh, pass in the specified tag name, automatically refresh the interface of the specified tag
this.$rbj.refreshGroupInterface("two"); // Refresh all flags in the entire group by referring to the interface, pass in the specified group tag name, and automatically refresh the interface of all the flags in the group
this.$rbj.refreshGroupFlagInterface("two", "there"); // Refresh the specified flag tag interface in the specified group, pass in the specified group tag name and the specified flag tag name in the group, and automatically refresh the specified flag in the group interface

// ----- DELETE MARKER-----
this.$rbj.refreshFlagTagDelete("one" || ["one", "two", ...]); // Delete reference refresh tag, parameter description: freshTagName : Array || String
this.$rbj.refreshGroupTagDelete("two" || ["one", "two", ...]); // Delete all refresh tags in the specified group, parameter description: freshTagName : Array || String
this.$rbj.refreshGroupFlagTagDelete("groupName", "freshTagName"); // Delete the refresh tag of the flag specified in the group
this.$rbj.refreshFlagTagDeleteAll(); // delete all flag reference refresh, no parameters
this.$rbj.refreshGroupTagDeleteAll(); // delete all group reference refresh, no parameters
this.$rbj.refreshTagDeleteAll(); // delete all references refresh, including (flag, group) no parameters

// Reference refresh understanding: flag and group are two different tag objects, and the two objects are not related. Of course, the group also has the function of flag, which adds the concept of a group on the basis of flag




// ======= path parameter conversion =======
// object to path parameter, note: this function is not available when in the NVue page or component of the uniapp project
this.$rbj.objToPathParams(pathObj);

// The path parameter is converted to an object, and the complete path can be passed in. Note: this function is not available when it is in the NVue page or component of the uniapp project
this.$rbj.pathParamsToObj(urlPath);

},
},
created(){
this.init_data_rbjData(); // ------ Initialize page data object ------

/**
* @description Set the token string, to the local storage, the token will be automatically brought when the request is made, the default token storage method uses localStorage local storage
* @param {string} tokenStr token string
*/
this.$rbj.setToken(tokenStr);

/**
* @description get token
* @return {string} token string
*/
this. $rbj. getToken();

/**
* @description remove token
*/
this.$rbj.removeToken();

/**
* Dynamically obtain the global request header object
*/
this.$rbj.getDynamicGlobalHeader();

/**
* @description Dynamically append and set the attributes of the global request header (note: after appending, all interface requests of the current project will automatically take effect)
* @param {string} attributeName attribute name
* @param {string} attributeVal attribute value
*/
this.$rbj.dynamicAddSetGlobalHeader(attributeName, attributeVal);

/**
* @param {string} attributeName attribute name
* @description Delete the specified attribute of the global request header
*/
this. $rbj.dynamicDeleteGlobalHeader(attributeName);

/**
* Dynamically delete all and global request header attributes
*/
this.$rbj.dynamicClearAllGlobalHeader();

/**
* Dynamically obtain the request header object of the specified interface (note: the global request header is not included)
*/
this.$rbj.getDynamicInterfaceHeader();

/**
* @param {string} interfaceDefinedName interface configuration name
* @param {string} attributeName attribute name
* @param {string} attributeVal attribute value
* @description Dynamically add and set the request header attribute of the specified interface (to be run before the specific interface request, after the addition, it will only take effect for the specified interface, and after the addition, when the specified interface is requested in any other place next time, this The dynamically added request header attributes will not disappear automatically, but will also take effect automatically)
*/
this.$rbj.dynamicAddSetInterfaceHeader(interfaceDefinedName, attributeName, attributeVal);

/**
* @param {string} interfaceDefinedName attribute name
* @param {string} attributeName attribute value
* @description Dynamically delete the request header attribute of the specified interface (to be run before the specific interface request)
*/
this.$rbj.dynamicDeleteInterfaceHeader(interfaceDefinedName, attributeName);

/**
* @param {string} interfaceDefinedName interface configuration name
* @description Dynamically delete all request header attributes of the specified interface (to be run before the specific interface request), note: the attributes set by the global request header are not included
*/
this.$rbj.dynamicClearAllInterfaceHeader(interfaceDefinedName);

/**
* @description The method of empty data filtering and completion string
* @param {Array | object} data data to be filtered
* @param {string} nullStr is used to complete the empty string
* @return {object} Returns the data object after empty completion
*/
this.$rbj.dataFilter(data, nullStr); // You can use this method to filter data null values. The nullStr string set on the function is preferred. If not set, then use Rbj's global setNullString. If the global is not set, Then the default empty value completion string uses "-no data-"

// For the sake of data reusability, a function derived from this cache mode to obtain cached data is launched. Note: the premise is that you must enable the isEnableCache: true mode in the rbj configuration
this.$rbj.getCacheData("one"); // Enter the name of each request configuration definition in the user's request configuration to get the cached data after the corresponding request. Note: only the interface data that the request has initiated will be It is cached, and the next request data of the request interface will overwrite the cache data of the previous request


// global custom function
this.$rbj.setGlobalFun("funName", ()=>{}); // set global function
this.$rbj.globalFun.Customized function name(); // This method can directly call the customized global function






// helper function
/**
* @description object or array null value judgment
* @param verifyObj: Object | Array, Description: The data object to be validated for null values, supports the validation of objects or arrays
* @param verifySelect: Array, multi-dimensional array, each dimension of the array represents multiple field attribute names to be verified in each layer (optional: not passed or [] means to verify all attributes or elements of the form object, you can Pass null value, note: when verifying multi-level data, if the specified level is [], it means to verify all attributes or elements of the specified level) Explanation: Even if there are objects or arrays in the array, it is also considered as [], because the objects in the array Or the array is the setting for the next level, not the setting for the current level, that is, there must be string elements in the array, so it is not counted as []
* Example: Verification object field ['phone', 'password', ['phone', 'password'] ...], verification array specified index element ['0', '1', ['0', '1' '] ...], or validate a mix of arrays and objects ['phone', ['0', '2', ['phone']], ['password', ['0']]...
* In a multi-dimensional array, if you want to set a single object property or array index independently, you can use the object method, for example:
*[
* {
* oneselfField: "userInfo", // The attribute name of the field to set the verification method separately, generally only for fields of object or array type, the basic type does not support, note: regardless of whether the external reverse mode is enabled, "userInfo" This attribute must be in the state of null value verification externally. If "userInfo" is not in the state of null value verification externally, this independent setting object is also invalid, because this independent control is only for the setting of sub-attributes and sub-indexes
* isReversal: false, // Whether to reverse the operation specified by oneselfField (object or array), the default value is false, note: when verifyArr is not set, or verifyArr is [], all sub-attribute values or sub-attributes will be automatically defaulted The verification of the index value, and the isReversal you set will lose its effect
* isChildren: true, // For the field attribute data specified by oneselfField, whether to verify the sub-attribute value or sub-index value, Note: If this item is not set in the current object (the setting priority in the current object is the highest), then By default, the reverseVerify in optionsObj shall prevail. If reverseVerify is not defined in optionsObj or the operation of specifying whether to reverse the level is not set in reverseVerify, the default value is true
* verifyArr: [], // Array, a multi-dimensional array, has the same writing method and effect as verifySelect, the difference is that it is only for the field specified by the current selfField, representing the data object
* }
* ]
* @param optionsObj parameter object attribute description
* Parameter 1: reverseVerify: boolean | Array | Object, (optional, default value is false) Description: The option in verifySelect and the verifyObj form object to be verified can be reversed, in multi-level objects or multi-level In the array state, you can use the (object or array) method to control the multi-level inversion operation
* Example function explanation: There are two fields of phone and password in the verified object. When you want to verify verifySelect = ["phone"], after inversion: verifySelect = ["phone"] will become the field to be ignored Array, will automatically validate all fields except the array that needs to be ignored
* Example of use: 1. Boolean usage method is true, description: If the data to be verified is multi-level, that is, the default setting is multi-level, all are true or both are false, Note: The default method of reversalVerify is Boolean, and the default value is false
* Expansion of the Boolean method: When reverseVerify uses the Boolean method, although multiple levels are set at the same time, if you do not set multiple levels in verifySelect but only set one or two levels, or set the specified level to [], Those levels that are not set and the empty [] level are still false by default. This explanation: It has been explained in verifySelect: "That is, if you do not pass or [], you can verify all attributes or elements of the form object, and you can pass null values", For details, please refer to the description of verifySelect above.
* 2. Object usage method {0: true, 1: false, ...}, description: 0 represents the first outermost layer, and so on, if there are four layers of data to be verified, and you only set For the first two layers, the latter two layers are false by default, that is, if not set or set to null, both are false
* 3. Array usage [true, false, ...], explanation: the first element represents the outermost first layer, and so on, if there are four layers of data to be verified, and you only set the first Two layers, then the last two layers are false by default, that is, if not set or set to null, both are false
* Parameter 2: isZeroNull: boolean, (optional) Description: Set whether zero is considered a null state, the default value is false, and zero is not considered a null state
* Parameter 3: isChildren: boolean, (optional) Description: Whether to verify the null value of the child, the default value is true, and verify the child
* @return type: Object, return {isEmpty: true, fieldName: ""} when there is a null value, return {isEmpty: false, fieldName: "NOT_NULL"} if there is no null value
* isEmpty // true when the field is empty, false when not empty, fieldName // field name when the field is empty, when all fields are not empty, it will have a default value "NOT_NULL", if passed in The data is empty and will have a "NULL" default value
*/
this.$rbj.assistFun.emptyVerify(verifyObj, verifySelect, {
reverseVerify: false, // default value: false
isZeroNull: false, // Set whether zero is considered a null state, the default value is false, zero is not considered a null state
isChildren: false, // Whether to verify the null value of the child, the default value is true, and verify the child
});
/**
* @description Explanation of the function of echo data: form data is used for echo, so that the fields in the data object of the background response and the fields in the form object of the page are automatically associated together. Note: the premise is that the field names in the two objects It must be consistent to be associated, in the object (redundant fields are allowed, and will not affect field association)
* @param echoObj The echo object of the page
* @param dataObj The data object of the background response
* @param optionsObj parameter object attribute description
* - assignNull Description: That is, if there is a null variable in dataObj, whether to perform an assignment operation, the default value is false, Note: The assignment of a null variable is also for two objects, and only when the same attribute name exists in both objects will it be assigned , as long as one of the parties does not exist, the assignment operation will not be performed
* @return void no return value
*/
this. $rbj. assistFun.choFun(echoObj, dataObj, {
assignNull: false, // Explanation: If there is a null variable in dataObj, whether to perform assignment operation, the default value is false
}); // Associate the properties of the form object with the same property name in the data object of the background response, so as to realize data echo
}
}
```

## rbj stream data conversion object

```js
export default {
created(){
// stream data conversion object
let streamObj = new this.$rbj.StreamConversion(Blob||file||ArrayBuffer||base64); // Note: stream data conversion object may fail to convert, you can use the static method below to do it in a single way convert
streamObj.getFile(); // Get the File object
streamObj.getBlob(); // Get the Blob object
streamObj.getArrayBuffer(); // Get ArrayBuffer byte stream object
streamObj.getArrayBuffer().then(arrayBuffer => {}); // When you create a StreamConversion object, when you initialize the incoming file or blob, getArrayBuffer() returns an asynchronous object
streamObj.getDataURL(); // When you create a StreamConversion object, when you initialize and pass in arrayBuffer or dataurl, the getDataURL() function directly returns a base64 string, which can be used directly
streamObj.getDataURL().then(dataurl => {}); // When you create a StreamConversion object, when the initial input is file or blob, getDataURL() returns an asynchronous object
// Commonly used static methods for streaming data conversion objects
this.$rbj.StreamConversion.canvasToDataUrl(canvas); // return dataUrl string
this.$rbj.StreamConversion.dataURLtoImage(dataUrl); // return Image object
this.$rbj.StreamConversion.imageTocanvas(ctx, imageElement, x, y, width, height); // Image to canvas (that is, render the image to the incoming ctx [that is, the brush operation object of canvas]), this function does not Return value, parameters: (imageElement [image element], x [rendered at the x-axis position of the canvas], y [rendered at the y-axis position of the canvas], width [rendered width], height [rendered height])
this.$rbj.StreamConversion.canvasToblob(canvas); // return Blob object
this.$rbj.StreamConversion.blobORfileTodataURL(paramsObj).then(dataUrl => {}).catch();
this.$rbj.StreamConversion.blobORfileToAfterter(paramsObj).then(arrayBuffer => {}).catch();
this.$rbj.StreamConversion.blobORfileToText(paramsObj).then(text => {}).catch();
this.$rbj.StreamConversion.dataURLtoFile(dataurl, filename); // return File object
this.$rbj.StreamConversion.dataURLtoBlob(dataurl); // return Blob object
this.$rbj.StreamConversion.dataURLToArrayBuffer(base64); // return ArrayBuffer object
this.$rbj.StreamConversion.blobToFile(blob, filename); // return File object
this.$rbj.StreamConversion.blobStrUrlToBlob(blobUrl).then(blob => {}).catch(); // convert blob character path to Blob object
this.$rbj.StreamConversion.fileToBlob(file); // return Blob object
this.$rbj.StreamConversion.arrayBufferToBlob(arrayBuffer); // return Blob object
this.$rbj.StreamConversion.arrayBufferToFile(arrayBuffer, filename); // return File object
this.$rbj.StreamConversion.arrayBufferToDataURL(buffer); // return dataUrl string
}
}
```

## rbj log

```js
export default {
created(){
// $rbj log, print logs of various levels, you can directly control whether to print to the console in the configuration object of rbj
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
