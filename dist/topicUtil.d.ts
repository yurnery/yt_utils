export declare enum TopicType {
    singleChoice = 0,
    multipleChoice = 1,
    judge = 3,
    intergrant = 4
}
export declare enum TopicErrorCode {
    noTitle = 101,
    titleTooShort = 102,
    noOption = 103,
    optionsTooLess = 104,
    optionsIndexError = 105,
    optionValueIsEmpty = 106,
    noAnswer = 107,
    answerValueIsEmpty = 108,
    noScore = 109,
    answerOptionNotExist = 110,
    answerRepeat = 111,
    scoreValueError = 112,
    scoreOutOfLimit = 113
}
export declare enum ErrorMessage {
    noTitle = "\u6CA1\u6709\u9898\u76EE",
    titleTooShort = "\u9898\u76EE\uFF08\u81F3\u5C11\u4E24\u4E2A\u5B57\uFF09",
    noOption = "\u6CA1\u6709\u9009\u9879",
    optionsTooLess = "\u9009\u9879\u81F3\u5C11\u4E3A\u4E24\u9879",
    optionsIndexError = "\u9009\u9879\u5E8F\u53F7\u9519\u8BEF",
    optionValueIsEmpty = "\u9009\u9879\u5185\u5BB9\u65E0\u5B57\u6BB5",
    noAnswer = "\u7B54\u6848\uFF08\u65E0\u5B57\u6BB5\uFF09",
    answerValueIsEmpty = "\u7B54\u6848\uFF08\u5185\u5BB9\u65E0\u5B57\u6BB5\uFF09",
    noScore = "\u6CA1\u6709\u5206\u503C",
    answerOptionNotExist = "\u7B54\u6848\uFF08\u5BF9\u5E94\u9009\u9879\u4E0D\u5B58\u5728\uFF09",
    answerRepeat = "\u7B54\u6848\uFF08\u91CD\u590D\uFF09",
    scoreValueError = "\u5206\u503C\u9519\u8BEF",
    scoreOutOfLimit = "\u5206\u503C\u53D7\u9650"
}
interface OptionErrorData {
    errorIndexs?: number[];
    emptyValueIndexs?: number[];
}
export interface TopicError {
    errorCode: TopicErrorCode;
    message: ErrorMessage;
    optionErrorData?: OptionErrorData;
}
export interface TopicItemData {
    title: string;
    value: string;
}
export interface TopicComponent {
    title: TopicItemData | null;
    answer: TopicItemData | null;
    score: TopicItemData | null;
    options: TopicItemData[] | null;
    analysis: TopicItemData | null;
}
export interface Topic extends TopicComponent {
    type: TopicType;
    convertible: boolean;
    error?: TopicError;
}
export declare class TopicUtil {
    static convertTopic(input: string): Topic[];
    /************************** 解析题目 ***************************/
    private static parseTopic;
    private static parseTitle;
    private static parseOption;
    private static parseAnswer;
    private static parseScore;
    private static parseAnalysis;
    /************************** 判断题型 ***************************/
    private static judgeTopicType;
    private static judgeTypeWithoutAnswer;
    private static judgeTypeWithAnswer;
    /************************** 进行题干信息格式的转换 ***************************/
    private static formatTopic;
    /************************** 检查题干信息 ***************************/
    private static checkTitle;
    private static checkOption;
    private static checkMoreThanTwoOptions;
    private static checkAnswerIsExistInOptions;
    private static checkAnswer;
    private static checkScore;
}
export {};
