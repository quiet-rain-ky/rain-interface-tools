/**
 * 定义递归类型
 */
declare type recursiveTypeDefinition = Array<string | {
    /**
     * 要进行单独设置验证方式的对象或数组的 (属性或索引) 名, 一般只针对, 对象或数组类型的字段, 基本类型不支持, 注意: 不管外部是否开启了反转模式, 当前对象中 oneselfField 指定的 (属性或索引) 在外部必须处于进行空值验证的状态, 如果指定的 (属性或索引) 在外部没有处于空值验证状态, 则这个独立设置对象也是无效的, 因为这个独立控制, 仅针对指定 (属性或索引) 的子属性和子索引的设置
     */
    oneselfField?: string;
    /**
     * 是否对 oneselfField 指定的 (对象或数组) 进行反转操作, 默认值 false, 注意: 当 verifyArr 未设置, 或 verifyArr为 [] 时, 会自动默认进行所有子属性值或子索引值的验证, 而你设置的isReversal 则会失去效果
     */
    isReversal?: boolean;
    /**
     * 对于 oneselfField 指定的字段属性数据, 是否进行子属性值或子索引值验证
     * 注意: 如果不在当前对象中设置此项(当前对象中的设置优先级是最高的), 则默认以 optionsObj 中 reversalVerify 为准, 若 optionsObj 中没有定义 reversalVerify 或 reversalVerify 中没有设置指定层级是否反转的操作, 则默认为 true
     */
    isChildren?: boolean;
    /**
     * Array, 多维数组, 和 verifySelect 一样的效果, 区别是只针对 当前 oneselfField 指定的字段, 所代表的数据对象
     */
    verifyArr?: recursiveTypeDefinition;
} | recursiveTypeDefinition>;

/**
 * 定义辅助工具对象
 */
declare interface assist {
    /**
     * @description 对象或数组空值判断
     * @param verifyObj: Object | Array, 说明: 要进行空值验证的数据对象, 支持 对象 或 数组 的验证
     * @param verifySelect: Array, 多维数组, 数组的每一个维度即代表设置每一层要进行验证的多个字段属性名 (可选: 不传 或 [] 即验证 表单对象的全部属性或元素, 可以传 null 值, 注意: 验证多层级数据时, 如果指定层级为 [], 则代表验证指定层级的所有属性或元素) 说明: 数组中就算有了对象或数组, 也算 [], 因为 数组中对象或数组是对下一个层级的设置, 不是对当前层级的设置, 即数组中必须有 字符串元素, 才不算为 []
     *      示例: 验证对象字段 ['phone', 'password', ['phone', 'password'] ...], 验证数组指定索引元素 ['0', '1', ['0', '1'] ...], 或者验证 数组和对象的混合字段 ['phone', ['0', '2', ['phone']], ['password', ['0']]...]
     *      多维数组内, 要想对单个对象属性或数组索引, 进行独立设置, 可以使用 对象的方式, 示例:
     *      [
     *        "userInfo" | "0", // 只有对 'userInfo' 字段进行了空值验证, 下方对象中的规则才会生效, 注意: 由于下方的对象设置的只是指定 字段或索引 的子级验证规则, 而指定的字段或索引在当前层级中并没有定义, 有可能会导致 'userInfo' 字段没有进行空值验证, 进而导致下方定义的对象规则失效, 如果你对当前层级使用了反转, 而通过反转操作, 正好也对当前层级的 'userInfo' 字段进行了空值验证, 那下方对象中的规则也会正常生效, 你不在下方对象的外部声明 'userInfo' 字段也是可以的
     *        { // 不管你在外部有没有声明 'userInfo' 字段, 也不管当前层级反转不反转, 只要对当前对象定义的 'userInfo' 字段或属性, 进行了空值验证, 当前对象内定义的规则, 则都会生效
     *          oneselfField: "userInfo" | "0", // 要进行单独设置验证方式的字段属性名或数组索引值, 一般只针对, 对象或数组类型进行使用, 注意: 不管外部是否开启了反转模式, "userInfo" 这个属性要在外部是处于进行空值验证的状态, 如果 "userInfo" 在外部没有处于空值验证状态, 则这个独立设置对象也是无效的, 因为这个独立控制, 仅针对 子属性和子索引的设置
     *          isReversal: false, // 是否对 oneselfField 指定的 (对象或数组) 进行反转操作, 默认值 false, 注意: 当前对象中的 verifyArr 未设置, 或 verifyArr为 [] 时, 你设置的 isReversal 会自动失去效果
     *          isChildren: true, // 对于当前对象中的 oneselfField 属性, 声明的指定的字段属性数据, 是否进行子级空值验证, 注意: 如果不在当前对象中设置此项(当前对象中的设置优先级是最高的), 则默认值为 true
     *          verifyArr: [], // Array, 多维数组, 和 verifySelect 一样的写法和效果, 区别是仅针对 当前 oneselfField 指定的字段, 所代表的数据对象, 注意: 不声明 或 声明的值为 [] 时, 即验证 表单对象的全部属性或元素, 可以传 null 值
     *        },
     *        ['phone', 'password'] // 对象中可以使用数组, 数组中也可以是对象, 都可以相互嵌套
     *      ]
     *     总结： 数组方式: 会对指定层级进行验证, 就算不是同一个字段索引下, 但只要是指定层级的指定名称的字段属性, 都会进行空值验证
     *           对象方式: 是对指定字段或索引下的层级设置验证方式
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
    emptyVerify(verifyObj: any, verifySelect?: recursiveTypeDefinition, optionsObj?: {
        /**
         * @description 可以将 verifySelect 中的选项 和 要进行验证的 verifyObj 表单对象, 进行反转操作, 在多级对象或多级数组状态下, 可以使用 (对象或数组) 的方式, 来控制多层级的反转操作
         * <p>
         * 示例作用解释说明: 验证的对象中有 phone 和 password 两个字段，当你想要验证 verifySelect = ["phone"], 反转后: verifySelect = ["phone"] 会变成要进行忽略的字段数组，会自动把 除 需要忽略的数组以外的所有字段进行验证
         * 使用示例: 1.布尔使用方式 true, 说明: 如果要验证的是多层级的数据, 即默认设置多层级, 都为 true 或 都为 false, 注意: reversalVerify 的默认使用的是 布尔方式, 且默认值为 false
         *          2.对象使用方式 {0: true, 1: false, ...}, 说明: 0 代表最外边的第一层, 以此类推
         *          3.数组使用方式 [true, false, ...], 说明: 第一个元素代表最外边的第一层, 以此类推
         * </p>
         */
        reversalVerify?: boolean | Array<boolean> | object,
        /**
         * isZeroNull: boolean, (可选) 说明: 设置 零 是否算 空状态, 默认值 false, 零不算空状态
         */
        isZeroNull?: boolean,
        /**
         * isChildren: boolean, (可选) 说明: 是否进行子级空值验证, 默认值 true, 进行子级验证
         */
        isChildren?: boolean
    }): {
        /**
         * 是否为空, 为空时 isEmpty 为 true, 非空时 isEmpty 为 false
         */
        isEmpty: boolean,
        /**
         * 为空的字段名, 没有空值时默认为 "NOT_NULL" 字符串
         */
        fieldName: string
    };

    /**
     * @date 函数编写时间  2023年 03月04日  16:07:18  星期六
     * @which_line  页面第 50 行
     * @description 回显数据 作用解释: 表单数据进行回显使用, 可以让后台数据对象中的字段和页面的表单对象中的字段自动关联在一起, 注意：前提是两个对象中的字段名要一致才能进行关联
     * @param echoObj 页面的回显对象
     * @param dataObj 后台的页面数据对象
     * @param optionsObj 参数对象属性说明
     *          - assignNull 说明: 即 dataObj 中有如果有空变量, 是否进行赋值操作, 默认值 false, 注意: 空变量的赋值也是针对两个对象中, 都必须都存在相同的属性名时, 才会进行赋值, 只要有一方没有则不会进行赋值操作
     * @return void 没有返回值
     */
    echoFun: (echoObj: Object, dataObj: Object, optionsObj?: {
        /**
         * 说明: 即 dataObj 中有如果有空变量, 是否进行赋值操作, 默认值 false, 注意: 空变量的赋值也是针对两个对象中, 都必须都存在相同的属性名时, 才会进行赋值, 只要有一方没有则不会进行赋值操作
         */
        assignNull: boolean;
    }) => void;
}


export default assist;