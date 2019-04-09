"use strict";
/*
 * @Author: weiwenshe
 * @Date: 2019-01-03 14:41:42
 * @Last Modified by: weiwenshe
 * @Last Modified time: 2019-04-09 13:54:02
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TopicType;
(function (TopicType) {
    TopicType[TopicType["singleChoice"] = 0] = "singleChoice";
    TopicType[TopicType["multipleChoice"] = 1] = "multipleChoice";
    TopicType[TopicType["judge"] = 3] = "judge";
    TopicType[TopicType["intergrant"] = 4] = "intergrant"; // 综合题
})(TopicType = exports.TopicType || (exports.TopicType = {}));
var TopicErrorCode;
(function (TopicErrorCode) {
    TopicErrorCode[TopicErrorCode["noTitle"] = 101] = "noTitle";
    TopicErrorCode[TopicErrorCode["titleTooShort"] = 102] = "titleTooShort";
    TopicErrorCode[TopicErrorCode["noOption"] = 103] = "noOption";
    TopicErrorCode[TopicErrorCode["optionsTooLess"] = 104] = "optionsTooLess";
    TopicErrorCode[TopicErrorCode["optionsIndexError"] = 105] = "optionsIndexError";
    TopicErrorCode[TopicErrorCode["optionValueIsEmpty"] = 106] = "optionValueIsEmpty";
    TopicErrorCode[TopicErrorCode["noAnswer"] = 107] = "noAnswer";
    TopicErrorCode[TopicErrorCode["answerValueIsEmpty"] = 108] = "answerValueIsEmpty";
    TopicErrorCode[TopicErrorCode["noScore"] = 109] = "noScore";
    TopicErrorCode[TopicErrorCode["answerOptionNotExist"] = 110] = "answerOptionNotExist";
    TopicErrorCode[TopicErrorCode["answerRepeat"] = 111] = "answerRepeat";
    TopicErrorCode[TopicErrorCode["scoreValueError"] = 112] = "scoreValueError";
    TopicErrorCode[TopicErrorCode["scoreOutOfLimit"] = 113] = "scoreOutOfLimit"; // 分值超出限制 只能为0.1-99.9且小数点只能为1位
})(TopicErrorCode = exports.TopicErrorCode || (exports.TopicErrorCode = {}));
var ErrorMessage;
(function (ErrorMessage) {
    ErrorMessage["noTitle"] = "\u6CA1\u6709\u9898\u76EE";
    ErrorMessage["titleTooShort"] = "\u9898\u76EE\uFF08\u81F3\u5C11\u4E24\u4E2A\u5B57\uFF09";
    ErrorMessage["noOption"] = "\u6CA1\u6709\u9009\u9879";
    ErrorMessage["optionsTooLess"] = "\u9009\u9879\u81F3\u5C11\u4E3A\u4E24\u9879";
    ErrorMessage["optionsIndexError"] = "\u9009\u9879\u5E8F\u53F7\u9519\u8BEF";
    ErrorMessage["optionValueIsEmpty"] = "\u9009\u9879\u5185\u5BB9\u65E0\u5B57\u6BB5";
    ErrorMessage["noAnswer"] = "\u7B54\u6848\uFF08\u65E0\u5B57\u6BB5\uFF09";
    ErrorMessage["answerValueIsEmpty"] = "\u7B54\u6848\uFF08\u5185\u5BB9\u65E0\u5B57\u6BB5\uFF09";
    ErrorMessage["noScore"] = "\u6CA1\u6709\u5206\u503C";
    ErrorMessage["answerOptionNotExist"] = "\u7B54\u6848\uFF08\u5BF9\u5E94\u9009\u9879\u4E0D\u5B58\u5728\uFF09";
    ErrorMessage["answerRepeat"] = "\u7B54\u6848\uFF08\u91CD\u590D\uFF09";
    ErrorMessage["scoreValueError"] = "\u5206\u503C\u9519\u8BEF";
    ErrorMessage["scoreOutOfLimit"] = "\u5206\u503C\u53D7\u9650";
})(ErrorMessage = exports.ErrorMessage || (exports.ErrorMessage = {}));
var TopicUtilReg = /** @class */ (function () {
    function TopicUtilReg() {
    }
    // 分割题目
    TopicUtilReg.multipleLinesReg = /^\s*?$/m;
    TopicUtilReg.emptylineReg = /^\s*?$/;
    TopicUtilReg.beginWhiteSpaceReg = /^\s*/;
    // 分割题干
    TopicUtilReg.titleReg = /^(\s*[\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;
    TopicUtilReg.optionReg = /^(\s*[a-g][．.、])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/gim;
    TopicUtilReg.answerReg = /(^\s*答案[:：])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;
    TopicUtilReg.scoreReg = /(^\s*分值[:：]\s*)(.*)$/im;
    TopicUtilReg.analysisReg = /(^\s*解析[:：])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;
    // 通过答案判断题型
    TopicUtilReg.multipleChoiceReg = /^\s*[a-g]{2,7}\s*$/i;
    TopicUtilReg.singleChoiceReg = /^\s*[a-g]\s*$/i;
    TopicUtilReg.judgeReg = /^\s*(正确|错误|对|错)\s*$/;
    // 判断分值内容
    TopicUtilReg.scoreNumReg = /^\d+$|^\d+\.?\d+$/; // 去掉分值后的
    TopicUtilReg.scoreWithUnit = /^\d+分?$|^\d+\.?\d+分?$/; // 带有分的
    return TopicUtilReg;
}());
var TopicUtil = /** @class */ (function () {
    function TopicUtil() {
    }
    TopicUtil.convertTopic = function (input) {
        var topicStrArray = input
            .split(TopicUtilReg.multipleLinesReg)
            .filter(function (value) { return !TopicUtilReg.emptylineReg.test(value); })
            .map(function (value) { return value.trim() + "\n"; });
        var topicComponents = TopicUtil.parseTopic(topicStrArray);
        var topics = topicComponents.map(function (component) {
            var topic = TopicUtil.judgeTopicType(component);
            topic = TopicUtil.formatTopic(topic);
            topic = TopicUtil.checkAnswer(topic);
            topic = TopicUtil.checkOption(topic);
            topic = TopicUtil.checkTitle(topic);
            topic = TopicUtil.checkScore(topic);
            return topic;
        });
        return topics;
    };
    TopicUtil.parseTitle = function (topic) {
        var matches = topic.match(TopicUtilReg.titleReg);
        if (matches) {
            var value = matches[1];
            var title = "题目:";
            return { title: title, value: value };
        }
        else {
            return null;
        }
    };
    TopicUtil.parseOption = function (topic) {
        var matches = TopicUtilReg.optionReg.exec(topic);
        var result = [];
        while (matches) {
            var title = matches[1];
            var value = matches[2];
            result.push({ title: title, value: value });
            matches = TopicUtilReg.optionReg.exec(topic);
        }
        TopicUtilReg.optionReg.lastIndex = 0;
        if (result.length > 0) {
            return result;
        }
        else {
            return null;
        }
    };
    TopicUtil.parseAnswer = function (topic) {
        var matches = topic.match(TopicUtilReg.answerReg);
        if (matches) {
            var title = matches[1];
            var value = matches[2];
            return { title: title, value: value };
        }
        else {
            return null;
        }
    };
    TopicUtil.parseScore = function (topic) {
        var matches = topic.match(TopicUtilReg.scoreReg);
        if (matches) {
            var title = matches[1];
            var value = matches[2];
            return { title: title, value: value };
        }
        else {
            return null;
        }
    };
    TopicUtil.parseAnalysis = function (topic) {
        var matches = topic.match(TopicUtilReg.analysisReg);
        if (matches) {
            var title = matches[1];
            var value = matches[2];
            return { title: title, value: value };
        }
        else {
            return null;
        }
    };
    /************************** 判断题型 ***************************/
    TopicUtil.judgeTopicType = function (topic) {
        if (!topic.answer) {
            return TopicUtil.judgeTypeWithoutAnswer(topic);
        }
        else {
            var answerValue = topic.answer.value;
            return TopicUtil.judgeTypeWithAnswer(topic, answerValue);
        }
    };
    TopicUtil.judgeTypeWithoutAnswer = function (topic) {
        var type = TopicType.intergrant;
        if (topic.options) {
            type = TopicType.singleChoice;
        }
        return tslib_1.__assign({}, topic, { type: type, convertible: type === TopicType.singleChoice });
    };
    TopicUtil.judgeTypeWithAnswer = function (topic, answerValue) {
        var type = TopicType.intergrant;
        if (TopicUtilReg.multipleChoiceReg.test(answerValue) && topic.options) {
            type = TopicType.multipleChoice;
        }
        else if (TopicUtilReg.singleChoiceReg.test(answerValue) &&
            topic.options) {
            type = TopicType.singleChoice;
        }
        else if (TopicUtilReg.judgeReg.test(answerValue)) {
            type = TopicType.judge;
        }
        return tslib_1.__assign({}, topic, { type: type, convertible: type === TopicType.singleChoice });
    };
    /************************** 进行题干信息格式的转换 ***************************/
    TopicUtil.formatTopic = function (topic) {
        var newTopic = tslib_1.__assign({}, topic);
        // 格式化标题
        if (newTopic.title) {
            newTopic.title.title = newTopic.title.title.trim();
            newTopic.title.value = newTopic.title.value.trim();
        }
        // 格式化选项
        if (newTopic.options) {
            newTopic.options.forEach(function (option) {
                option.title = option.title
                    .trim()
                    .replace(/[、．]/, ".")
                    .toLocaleUpperCase();
                option.value = option.value.trim();
            });
        }
        // 格式化答案
        if (newTopic.answer) {
            newTopic.answer.title = newTopic.answer.title.trim().replace("：", ":");
            newTopic.answer.value = newTopic.answer.value.trim();
            if (newTopic.type === TopicType.singleChoice ||
                newTopic.type === TopicType.multipleChoice) {
                newTopic.answer.value = newTopic.answer.value.toLocaleUpperCase();
            }
        }
        // 格式化分数
        if (newTopic.score) {
            newTopic.score.title = newTopic.score.title.trim().replace("：", ":");
            var value = newTopic.score.value
                .trim()
                .replace(TopicUtilReg.scoreWithUnit, function (match) { return match.replace("分", ""); });
            value = Number(value) + "";
            newTopic.score.value = value;
        }
        if (newTopic.analysis) {
            newTopic.analysis.title = newTopic.analysis.title
                .trim()
                .replace("：", ":");
            newTopic.analysis.value = newTopic.analysis.value.trim();
        }
        return newTopic;
    };
    /************************** 检查题干信息 ***************************/
    TopicUtil.checkTitle = function (topic) {
        if (!topic.title || topic.title.value.length === 0) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.noTitle,
                    message: ErrorMessage.noTitle
                } });
        }
        else if (topic.title.value.length < 2) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.titleTooShort,
                    message: ErrorMessage.titleTooShort
                } });
        }
        else {
            return topic;
        }
    };
    TopicUtil.checkOption = function (topic) {
        var options = topic.options;
        if (topic.type !== TopicType.singleChoice &&
            topic.type !== TopicType.multipleChoice) {
            return topic;
        }
        else {
            // 处理选择题的选项
            if (!options) {
                return tslib_1.__assign({}, topic, { error: {
                        errorCode: TopicErrorCode.noOption,
                        message: ErrorMessage.noOption
                    } });
            }
            else if (options.length === 1) {
                return tslib_1.__assign({}, topic, { error: {
                        errorCode: TopicErrorCode.optionsTooLess,
                        message: ErrorMessage.optionsTooLess
                    } });
            }
            else {
                return TopicUtil.checkMoreThanTwoOptions(topic, options);
            }
        }
    };
    TopicUtil.checkMoreThanTwoOptions = function (topic, options) {
        var errorResults = [];
        var emptyValueIndexs = [];
        options.forEach(function (option, index) {
            var title = option.title.slice(0, 1).toLocaleUpperCase();
            var ascii = title.charCodeAt(0);
            var isCorrect = ascii === "A".charCodeAt(0) + index;
            var isEmptyValue = option.value.length === 0;
            if (!isCorrect) {
                errorResults.push(index);
            }
            if (isEmptyValue) {
                emptyValueIndexs.push(index);
            }
        });
        if (errorResults.length > 0) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.optionsIndexError,
                    message: ErrorMessage.optionsIndexError,
                    optionErrorData: { errorIndexs: errorResults }
                } });
        }
        else if (emptyValueIndexs.length > 0) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.optionValueIsEmpty,
                    message: ErrorMessage.optionValueIsEmpty,
                    optionErrorData: { emptyValueIndexs: emptyValueIndexs }
                } });
        }
        else {
            // 判断答案选项是否存在
            return TopicUtil.checkAnswerIsExistInOptions(topic, options);
        }
    };
    TopicUtil.checkAnswer = function (topic) {
        if (!topic.answer) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.noAnswer,
                    message: ErrorMessage.noAnswer
                } });
        }
        else if (topic.answer.value.length === 0) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.answerValueIsEmpty,
                    message: ErrorMessage.answerValueIsEmpty
                } });
        }
        else if (topic.type === TopicType.multipleChoice) {
            var answers = topic.answer.value.split("");
            var setAnswer = new Set(answers);
            if (answers.length !== setAnswer.size) {
                return tslib_1.__assign({}, topic, { error: {
                        errorCode: TopicErrorCode.answerRepeat,
                        message: ErrorMessage.answerRepeat
                    } });
            }
            else {
                return topic;
            }
        }
        else {
            return topic;
        }
    };
    TopicUtil.checkScore = function (topic) {
        if (!topic.score) {
            return topic;
            // return {
            //   ...topic,
            //   error: {
            //     errorCode: TopicErrorCode.noScore,
            //     message: ErrorMessage.noScore
            //   }
            // };
        }
        else if (!TopicUtilReg.scoreNumReg.test(topic.score.value)) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.scoreValueError,
                    message: ErrorMessage.scoreValueError
                } });
        }
        else if (parseFloat(topic.score.value) < 0.1 ||
            parseFloat(topic.score.value) > 99.9) {
            return tslib_1.__assign({}, topic, { error: {
                    errorCode: TopicErrorCode.scoreOutOfLimit,
                    message: ErrorMessage.scoreOutOfLimit
                } });
        }
        else {
            var points = topic.score.value.split(".");
            if (points.length === 2 && points[1].length > 1) {
                return tslib_1.__assign({}, topic, { error: {
                        errorCode: TopicErrorCode.scoreOutOfLimit,
                        message: ErrorMessage.scoreOutOfLimit
                    } });
            }
            return topic;
        }
    };
    /************************** 解析题目 ***************************/
    TopicUtil.parseTopic = function (topics) {
        return topics.map(function (topic) {
            var title = TopicUtil.parseTitle(topic);
            var options = TopicUtil.parseOption(topic);
            var answer = TopicUtil.parseAnswer(topic);
            var score = TopicUtil.parseScore(topic);
            var analysis = TopicUtil.parseAnalysis(topic);
            return {
                answer: answer,
                title: title,
                options: options,
                score: score,
                analysis: analysis
            };
        });
    };
    TopicUtil.checkAnswerIsExistInOptions = function (topic, options) {
        var optionTitles = options
            .map(function (option) { return option.title.slice(0, 1); })
            .join("")
            .toLocaleUpperCase();
        if (topic.answer) {
            var answerExist = true;
            if (topic.type === TopicType.singleChoice) {
                answerExist = optionTitles.includes(topic.answer.value.toLocaleUpperCase());
            }
            else {
                var answers = topic.answer.value.toLocaleUpperCase().split("");
                answerExist = answers.every(function (answer) { return optionTitles.includes(answer); });
            }
            if (!answerExist) {
                return tslib_1.__assign({}, topic, { error: {
                        errorCode: TopicErrorCode.answerOptionNotExist,
                        message: ErrorMessage.answerOptionNotExist
                    } });
            }
        }
        return topic;
    };
    return TopicUtil;
}());
exports.TopicUtil = TopicUtil;
