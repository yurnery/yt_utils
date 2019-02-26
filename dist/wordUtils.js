"use strict";
/*
 * @Author: weiwenshe
 * @Date: 2019-02-13 13:52:41
 * @Last Modified by: weiwenshe
 * @Last Modified time: 2019-02-21 14:55:24
 */
Object.defineProperty(exports, "__esModule", { value: true });
// 生成正则规则工具
var WordRegUtil = /** @class */ (function () {
    function WordRegUtil() {
    }
    WordRegUtil.generateCharecterReg = function (pre) {
        return new RegExp("(" + pre + "[.\uFF0E][\\s&\uFF06adjnvtadvviprepconjvpron.\uFF0E,\uFF0C]*)" +
            "(.*?)" +
            ("" + WordRegUtil.characteristicEnd()));
    };
    WordRegUtil.generateSplitReg = function () {
        return new RegExp("(.*?)" +
            ("(?=" + WordRegUtil.splitWordEnd1 + "|" + WordRegUtil.splitWordEnd2() + ")") +
            "(.*)");
    };
    WordRegUtil.sepStr = "[.\uFF0E]";
    WordRegUtil.nonEngLetter = "[^\\x00-\\xff\u2026\u25B3\u3001\u2019]";
    WordRegUtil.splitWordEnd1 = "(?:[\\[/]|\\d+\\s*[^\\x00-\\xff])";
    WordRegUtil.characteristicKeyWord = function () {
        return "vi" + WordRegUtil.sepStr + "|adj" + WordRegUtil.sepStr + "|n" + WordRegUtil.sepStr + "|vt" + WordRegUtil.sepStr + "|adv" + WordRegUtil.sepStr + "|prep" + WordRegUtil.sepStr + "|conj" + WordRegUtil.sepStr + "|v" + WordRegUtil.sepStr + "|pron" + WordRegUtil.sepStr + "|interj" + WordRegUtil.sepStr + "|art" + WordRegUtil.sepStr + "|num" + WordRegUtil.sepStr;
    };
    WordRegUtil.characteristicEnd = function () {
        return "(?=" + WordRegUtil.characteristicKeyWord() + "|$)";
    };
    WordRegUtil.splitWordEnd2 = function () {
        return "(?:\\(" + WordRegUtil.nonEngLetter + "|\u2026\u2026|" + WordRegUtil.characteristicKeyWord() + "|" + WordRegUtil.nonEngLetter + "|$)";
    };
    return WordRegUtil;
}());
// 所有正则表达式管理类
var WordReg = /** @class */ (function () {
    function WordReg() {
    }
    // 处理的词性如下:  adj.  n.  vt.  adv.  vi.  prep.  conj. v. pron. interj. art. num.
    WordReg.splitReg = WordRegUtil.generateSplitReg();
    WordReg.adjReg = WordRegUtil.generateCharecterReg("adj");
    WordReg.nReg = WordRegUtil.generateCharecterReg("n");
    WordReg.vtReg = WordRegUtil.generateCharecterReg("vt");
    WordReg.advReg = WordRegUtil.generateCharecterReg("adv");
    WordReg.viReg = WordRegUtil.generateCharecterReg("vi");
    WordReg.prepReg = WordRegUtil.generateCharecterReg("prep");
    WordReg.conjReg = WordRegUtil.generateCharecterReg("conj");
    WordReg.vReg = WordRegUtil.generateCharecterReg("v");
    WordReg.pronReg = WordRegUtil.generateCharecterReg("pron");
    WordReg.interjReg = WordRegUtil.generateCharecterReg("interj");
    WordReg.artReg = WordRegUtil.generateCharecterReg("art");
    WordReg.numReg = WordRegUtil.generateCharecterReg("num");
    WordReg.replaceNumReg = /^[\d、.]*/;
    WordReg.soundmarkReg = /[/／\[［].*[/／\]］]/;
    return WordReg;
}());
// 转换工具类
var WordUtils = /** @class */ (function () {
    function WordUtils() {
    }
    /**
     * 解析单词
     */
    WordUtils.parse = function (str) {
        var allWords = str
            .trim()
            .split("\n")
            .filter(function (line) { return line.trim().length > 0; });
        var words = [];
        for (var _i = 0, allWords_1 = allWords; _i < allWords_1.length; _i++) {
            var wordStr = allWords_1[_i];
            var result = wordStr.trim().match(WordReg.splitReg);
            if (result) {
                var word = result[1].replace(WordReg.replaceNumReg, "").trim();
                var explain = result[2].replace(WordReg.soundmarkReg, "").trim();
                var characteristic = WordUtils.splitCharacteristic(explain);
                if (word.length > 0) {
                    words.push({ word: word, explain: explain, characteristic: characteristic });
                }
            }
        }
        return words;
    };
    WordUtils.allCharacteristicReg = [
        {
            type: "adj",
            reg: WordReg.adjReg
        },
        {
            type: "n",
            reg: WordReg.nReg
        },
        {
            type: "vt",
            reg: WordReg.vtReg
        },
        {
            type: "adv",
            reg: WordReg.advReg
        },
        {
            type: "vi",
            reg: WordReg.viReg
        },
        {
            type: "prep",
            reg: WordReg.prepReg
        },
        {
            type: "conj",
            reg: WordReg.conjReg
        },
        {
            type: "v",
            reg: WordReg.vReg
        },
        {
            type: "pron",
            reg: WordReg.pronReg
        },
        {
            type: "interj",
            reg: WordReg.interjReg
        },
        {
            type: "art",
            reg: WordReg.artReg
        },
        {
            type: "num",
            reg: WordReg.numReg
        }
    ];
    // 分割各部分词性
    WordUtils.splitCharacteristic = function (content) {
        var result = {};
        WordUtils.allCharacteristicReg.forEach(function (obj) {
            var res = content.match(obj.reg);
            if (res) {
                result[obj.type] = { name: res[1], value: res[2] };
            }
        });
        var characteristic = WordUtils.distinctResult(result);
        return characteristic;
    };
    // 去重, 只保留最长的结果
    WordUtils.distinctResult = function (result) {
        var dict = {};
        for (var type in result) {
            if (result.hasOwnProperty(type)) {
                var name_1 = result[type].name;
                var value = result[type].value;
                if (dict[value] !== undefined) {
                    var lastname = dict[value].name;
                    var lasttype = dict[value].type;
                    if (lastname.includes(name_1)) {
                        // 之前的更长, 需要删除现在的 key
                        delete result[type];
                    }
                    else if (name_1.includes(lastname)) {
                        // 当前 name 更长, 需要删除之前的, 然后把现在的存起来用于后面对比
                        delete result[lasttype];
                        dict[value] = { name: name_1, type: type };
                    }
                }
                else {
                    dict[value] = { name: name_1, type: type };
                }
            }
        }
        return result;
    };
    return WordUtils;
}());
exports.WordUtils = WordUtils;
