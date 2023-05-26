/**
 * @author   作者: Rain
 * @date 创建于 2022年 02月26日  10:15:38  星期六
 * @file_path  文件磁盘路径: D:\Files\repositorys\rain-interface-tools\src\assist.js
 * @file_path  文件项目路径: src\assist.js
 * @description 辅助函数
 */
import rain_logs from "./logs.js";
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
function emptyVerify(verifyObj, verifySelect, optionsObj = {}) {
    let { reversalVerify, isZeroNull = false, isChildren = true, hintStr = "", _tier = 0 } = optionsObj;
    // 为了防止 verifyObj 是一个对象, 但 使用 verifyObj instanceof Object 判断不成功的问题, 故舍弃使用 instanceof 来进行判断
    // instanceof 判断不成功的问题原因可能是因为, 虽然是对象, 但是对象中的原型对象是 null 并不是 object 的缘故
    if (verifyObj) {
        if (!verifySelect) verifySelect = Object.keys(verifyObj);

        // 递归传递数据操作
        let childrenArr = [];
        let childrenObj = {};
        let oneselfFieldObj = {};
        if (Array.isArray(verifySelect)) {
            for (let i = 0; i < verifySelect.length; i++) {
                if (Array.isArray(verifySelect[i])) {
                    childrenArr = childrenArr.concat(verifySelect[i]);
                    verifySelect.splice(i, 1); // 删除数组元素后, 索引改变, 故需要进行 i-- 操作
                    i--;
                } else if (verifySelect[i] && typeof verifySelect[i] == "object") {
                    childrenObj[verifySelect[i].oneselfField] = verifySelect[i];
                    verifySelect.splice(i, 1); // 删除数组元素后, 索引改变, 故需要进行 i-- 操作
                    i--;
                }
            }
        } else if (verifySelect && typeof verifySelect == "object") {
            oneselfFieldObj = verifySelect;
        }

        // 数据反转操作
        if (verifySelect && typeof verifySelect == "object" && oneselfFieldObj.isReversal) {
            let reversalData = [];
            for (const key in verifyObj) if (!verifySelect.verifyArr.includes(key)) reversalData.push(key);
            verifySelect = reversalData;
        } else {
            if ((typeof reversalVerify == "boolean" && reversalVerify) || (reversalVerify && reversalVerify[_tier]) || verifySelect.length == 0) {
                let reversalData = [];
                for (const key in verifyObj) if (!verifySelect.includes(key)) reversalData.push(key);
                verifySelect = reversalData;
            }
        }

        // 数据验证操作
        for (const key in verifySelect) {
            let verifyValue = verifySelect[key];
            let str = Array.isArray(verifyObj) ? "数组索引" : "属性字段";
            let childrenVerify = childrenArr;
            if (childrenObj[verifyValue]) {
                if (childrenObj[verifyValue].isReversal) {
                    childrenVerify = childrenObj[verifyValue];
                } else {
                    childrenVerify = childrenObj[verifyValue].verifyArr;
                }
            }

            // 独立控制是否验证子对象或子数组
            if (childrenObj[verifyValue] && childrenObj[verifyValue].isChildren != undefined && typeof childrenObj[verifyValue].isChildren == "boolean") isChildren = childrenObj[verifyValue].isChildren;

            // 进行 数组, 对象, 和 空值 的判断
            if (verifyObj[verifyValue] && Array.isArray(verifyObj[verifyValue]) && isChildren) {
                if (verifyObj[verifyValue].length == 0) {
                    rain_logs.WARN(`${hintStr}${str} ${verifyValue} 为空数组`);
                    return {
                        isEmpty: true,
                        fieldName: verifyValue,
                    };
                } else {
                    let arrayIsEmpty = emptyVerify(verifyObj[verifyValue], childrenVerify, {
                        reversalVerify: reversalVerify,
                        isZeroNull,
                        isChildren,
                        hintStr: `${hintStr}${str} ${verifyValue} -> `,
                        // 注意: 此处不能使用 ++_tier, 因为如果使用 ++_tier 直接修改 _tier 变量, 相当于传进递归的函数的参数是 _tier 的引用, _tier 会一直增加, 这会让上方的 reversalVerify[_tier] 代码失效进而导致 我们在验证多层数据时, 反转规则失效
                        _tier: _tier + 1,
                    });
                    if (arrayIsEmpty.isEmpty) return arrayIsEmpty;
                }
            } else if (verifyObj[verifyValue] && typeof verifyObj[verifyValue] == "object" && isChildren) {
                if (Object.keys(verifyObj[verifyValue]).length == 0) {
                    rain_logs.WARN(`${hintStr}${str} ${verifyValue} 为空对象`);
                    return {
                        isEmpty: true,
                        fieldName: verifyValue,
                    };
                } else {
                    let objectIsEmpty = emptyVerify(verifyObj[verifyValue], childrenVerify, {
                        reversalVerify: reversalVerify,
                        isZeroNull,
                        isChildren,
                        hintStr: `${hintStr}${str} ${verifyValue} -> `,
                        // 注意: 此处不能使用 ++_tier, 因为如果使用 ++_tier 直接修改 _tier 变量, 相当于传进递归的函数的参数是 _tier 的引用, _tier 会一直增加, 这会让上方的 reversalVerify[_tier] 代码失效进而导致 我们在验证多层数据时, 反转规则失效
                        _tier: _tier + 1,
                    });
                    if (objectIsEmpty.isEmpty) return objectIsEmpty;
                }
            } else {
                if ((!verifyObj[verifyValue] && verifyObj[verifyValue] !== 0) || (verifyObj[verifyValue] === 0 && isZeroNull)) {
                    rain_logs.WARN(`${hintStr}${str} ${verifyValue} 的值为空`);
                    return {
                        isEmpty: true,
                        fieldName: verifyValue,
                    };
                }
            }
        }
    } else {
        rain_logs.WARN("空值验证失败, 传入的 verifyObj 参数为空");
        return {
            isEmpty: true,
            fieldName: "NULL",
        };
    }
    return {
        isEmpty: false,
        fieldName: "NOT_NULL",
    };
}

/**
 * @date 函数编写时间  2023年 03月04日  16:07:18  星期六
 * @which_line  页面第 50 行
 * @description 回显数据 作用解释: 表单数据进行回显使用, 可以让后台数据对象中的字段和页面的表单对象中的字段自动关联在一起, 注意：前提是两个对象中的字段名要一致才能进行关联(即两个对象中, 都必须都存在相同的属性名时, 才会进行赋值, 只有有一方没有则不会进行赋值操作), 且不会回显 dataObj 中的空变量
 * @param echoObj 页面的回显对象
 * @param dataObj 后台响应的数据对象
 * @param optionsObj 参数对象属性说明
 *          - assignNull 即 dataObj 中有如果有空变量, 是否进行赋值操作, 默认值 false, 注意: 空变量的赋值也是针对两个对象中, 都必须都存在相同的属性名时, 才会进行赋值, 只要有一方没有则不会进行赋值操作
 * @return void 没有返回值
 */
function echoFun(echoObj, dataObj, optionsObj = {}) {
    let { assignNull = false } = optionsObj;
    if (echoObj && dataObj) {
        for (const key in echoObj) {
            if (dataObj[key] || (dataObj[key] != undefined && assignNull)) echoObj[key] = dataObj[key];
        }
    } else {
        rain_logs.ERROR("echoObj 或 dataObj 为空, 回显函数执行失败");
    }
}

export default {
    emptyVerify,
    echoFun,
};
