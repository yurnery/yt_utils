/*
 * @Author: weiwenshe
 * @Date: 2019-01-03 14:41:42
 * @Last Modified by: weiwenshe
 * @Last Modified time: 2019-02-21 12:58:47
 */

export enum TopicType {
  singleChoice = 0, // 单选题
  multipleChoice = 1, // 多选题
  judge = 3, // 判断题
  intergrant = 4 // 综合题
}

export enum TopicErrorCode {
  noTitle = 101, // 没有标题
  titleTooShort = 102, // 标题少于2个字
  noOption = 103, // 选择题没有选项
  optionsTooLess = 104, // 选项少于2个
  optionsIndexError = 105, // 选项序号错误, 可能是重复或者不连续
  optionValueIsEmpty = 106, // 选项内容为空
  noAnswer = 107, // 没有答案
  answerValueIsEmpty = 108, // 答案内容为空
  noScore = 109, // 没有分值
  answerOptionNotExist = 110, // 答案对应选项不存在
  answerRepeat = 111, // 多选题答案选项重复
  scoreValueError = 112, // 分值内容不规范, 未填写分值或者填写非数字
  scoreOutOfLimit = 113 // 分值超出限制 只能为0.1-99.9且小数点只能为1位
}

export enum ErrorMessage {
  noTitle = "没有题目",
  titleTooShort = "题目（至少两个字）",
  noOption = "没有选项", // 这个去掉了
  optionsTooLess = "选项至少为两项",
  optionsIndexError = "选项序号错误",
  optionValueIsEmpty = "选项内容无字段",
  noAnswer = "答案（无字段）",
  answerValueIsEmpty = "答案（内容无字段）",
  noScore = "没有分值",
  answerOptionNotExist = "答案（对应选项不存在）",
  answerRepeat = "答案（重复）",
  scoreValueError = "分值错误",
  scoreOutOfLimit = "分值受限"
}

interface OptionErrorData {
  errorIndexs?: number[]; // error === optionsIndexError时有值, 选项排序错误的序号
  emptyValueIndexs?: number[]; // error === optionValueIsEmpty有值, 选项为空时的序号
}

export interface TopicError {
  errorCode: TopicErrorCode;
  message: ErrorMessage;
  optionErrorData?: OptionErrorData; // 只有选项错误时才有
}

export interface TopicItemData {
  title: string;
  value: string;
}

export interface TopicComponent {
  title: TopicItemData | null; // 题目
  answer: TopicItemData | null; // 答案
  score: TopicItemData | null; // 分值
  options: TopicItemData[] | null; // 选项, 只有选择题有
  analysis: TopicItemData | null; // 解析
}

export interface Topic extends TopicComponent {
  type: TopicType; // 题目类型, 默认为综合题
  convertible: boolean; // 是否可以转为其他题型
  error?: TopicError; // 题目错误信息,
}

class TopicUtilReg {
  // 分割题目
  public static multipleLinesReg = /^\s*?$/m;
  public static emptylineReg = /^\s*?$/;
  public static beginWhiteSpaceReg = /^\s*/;

  // 分割题干
  public static titleReg = /^(\s*[\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;
  public static optionReg = /^(\s*[a-g][．.、])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/gim;
  public static answerReg = /(^\s*答案[:：])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;
  public static scoreReg = /(^\s*分值[:：]\s*)(.*)$/im;
  public static analysisReg = /(^\s*解析[:：])([\s\S]*?)(?=^\s*(?:[a-g][．.、]|答案[:：]|分值[:：]|解析[:：]|$))/im;

  // 通过答案判断题型
  public static multipleChoiceReg = /^\s*[a-g]{2,7}\s*$/i;
  public static singleChoiceReg = /^\s*[a-g]\s*$/i;
  public static judgeReg = /^\s*(正确|错误|对|错)\s*$/;

  // 判断分值内容
  public static scoreNumReg = /^\d+$|^\d+\.?\d+$/; // 去掉分值后的
  public static scoreWithUnit = /^\d+分?$|^\d+\.?\d+分?$/; // 带有分的
}

export class TopicUtil {
  public static convertTopic(input: string): Topic[] {
    const topicStrArray = input
      .split(TopicUtilReg.multipleLinesReg)
      .filter(value => !TopicUtilReg.emptylineReg.test(value))
      .map(value => value.trim() + "\n");
    const topicComponents = TopicUtil.parseTopic(topicStrArray);
    const topics = topicComponents.map(component => {
      let topic = TopicUtil.judgeTopicType(component);
      topic = TopicUtil.formatTopic(topic);
      topic = TopicUtil.checkAnswer(topic);
      topic = TopicUtil.checkOption(topic);
      topic = TopicUtil.checkTitle(topic);
      topic = TopicUtil.checkScore(topic);
      return topic;
    });
    return topics;
  }

  /************************** 解析题目 ***************************/
  private static parseTopic = (topics: string[]): TopicComponent[] => {
    return topics.map(topic => {
      const title = TopicUtil.parseTitle(topic);
      const options = TopicUtil.parseOption(topic);
      const answer = TopicUtil.parseAnswer(topic);
      const score = TopicUtil.parseScore(topic);
      const analysis = TopicUtil.parseAnalysis(topic);
      return {
        answer,
        title,
        options,
        score,
        analysis
      };
    });
  };

  private static parseTitle(topic: string) {
    const matches = topic.match(TopicUtilReg.titleReg);
    if (matches) {
      const value = matches[1];
      const title = "题目:";
      return { title, value };
    } else {
      return null;
    }
  }

  private static parseOption(topic: string) {
    let matches = TopicUtilReg.optionReg.exec(topic);
    const result = [];
    while (matches) {
      const title = matches[1];
      const value = matches[2];
      result.push({ title, value });
      matches = TopicUtilReg.optionReg.exec(topic);
    }
    TopicUtilReg.optionReg.lastIndex = 0;
    if (result.length > 0) {
      return result;
    } else {
      return null;
    }
  }

  private static parseAnswer(topic: string) {
    const matches = topic.match(TopicUtilReg.answerReg);
    if (matches) {
      const title = matches[1];
      const value = matches[2];
      return { title, value };
    } else {
      return null;
    }
  }

  private static parseScore(topic: string) {
    const matches = topic.match(TopicUtilReg.scoreReg);
    if (matches) {
      const title = matches[1];
      const value = matches[2];
      return { title, value };
    } else {
      return null;
    }
  }

  private static parseAnalysis(topic: string) {
    const matches = topic.match(TopicUtilReg.analysisReg);
    if (matches) {
      const title = matches[1];
      const value = matches[2];
      return { title, value };
    } else {
      return null;
    }
  }

  /************************** 判断题型 ***************************/
  private static judgeTopicType(topic: TopicComponent) {
    if (!topic.answer) {
      return TopicUtil.judgeTypeWithoutAnswer(topic);
    } else {
      const answerValue = topic.answer.value;
      return TopicUtil.judgeTypeWithAnswer(topic, answerValue);
    }
  }

  private static judgeTypeWithoutAnswer(topic: TopicComponent): Topic {
    let type = TopicType.intergrant;
    if (topic.options) {
      type = TopicType.singleChoice;
    }
    return {
      ...topic,
      type,
      convertible: type === TopicType.singleChoice
    };
  }

  private static judgeTypeWithAnswer(
    topic: TopicComponent,
    answerValue: string
  ): Topic {
    let type = TopicType.intergrant;
    if (TopicUtilReg.multipleChoiceReg.test(answerValue) && topic.options) {
      type = TopicType.multipleChoice;
    } else if (
      TopicUtilReg.singleChoiceReg.test(answerValue) &&
      topic.options
    ) {
      type = TopicType.singleChoice;
    } else if (TopicUtilReg.judgeReg.test(answerValue)) {
      type = TopicType.judge;
    }
    return {
      ...topic,
      type,
      convertible: type === TopicType.singleChoice
    };
  }

  /************************** 进行题干信息格式的转换 ***************************/
  private static formatTopic(topic: Topic) {
    const newTopic = { ...topic };
    // 格式化标题
    if (newTopic.title) {
      newTopic.title.title = newTopic.title.title.trim();
      newTopic.title.value = newTopic.title.value.trim();
    }

    // 格式化选项
    if (newTopic.options) {
      newTopic.options.forEach(option => {
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
      if (
        newTopic.type === TopicType.singleChoice ||
        newTopic.type === TopicType.multipleChoice
      ) {
        newTopic.answer.value = newTopic.answer.value.toLocaleUpperCase();
      }
    }

    // 格式化分数
    if (newTopic.score) {
      newTopic.score.title = newTopic.score.title.trim().replace("：", ":");
      let value = newTopic.score.value
        .trim()
        .replace(TopicUtilReg.scoreWithUnit, match => match.replace("分", ""));
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
  }

  /************************** 检查题干信息 ***************************/
  private static checkTitle(topic: Topic) {
    if (!topic.title || topic.title.value.length === 0) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.noTitle,
          message: ErrorMessage.noTitle
        }
      };
    } else if (topic.title.value.length < 2) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.titleTooShort,
          message: ErrorMessage.titleTooShort
        }
      };
    } else {
      return topic;
    }
  }

  private static checkOption(topic: Topic) {
    const options = topic.options;
    if (
      topic.type !== TopicType.singleChoice &&
      topic.type !== TopicType.multipleChoice
    ) {
      return topic;
    } else {
      // 处理选择题的选项
      if (!options) {
        return {
          ...topic,
          error: {
            errorCode: TopicErrorCode.noOption,
            message: ErrorMessage.noOption
          }
        };
      } else if (options.length === 1) {
        return {
          ...topic,
          error: {
            errorCode: TopicErrorCode.optionsTooLess,
            message: ErrorMessage.optionsTooLess
          }
        };
      } else {
        return TopicUtil.checkMoreThanTwoOptions(topic, options);
      }
    }
  }

  private static checkMoreThanTwoOptions(
    topic: Topic,
    options: TopicItemData[]
  ) {
    const errorResults: number[] = [];
    const emptyValueIndexs: number[] = [];
    options.forEach((option, index) => {
      const title = option.title.slice(0, 1).toLocaleUpperCase();
      const ascii = title.charCodeAt(0);
      const isCorrect = ascii === "A".charCodeAt(0) + index;
      const isEmptyValue = option.value.length === 0;
      if (!isCorrect) {
        errorResults.push(index);
      }
      if (isEmptyValue) {
        emptyValueIndexs.push(index);
      }
    });

    if (errorResults.length > 0) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.optionsIndexError,
          message: ErrorMessage.optionsIndexError,
          optionErrorData: { errorIndexs: errorResults }
        }
      };
    } else if (emptyValueIndexs.length > 0) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.optionValueIsEmpty,
          message: ErrorMessage.optionValueIsEmpty,
          optionErrorData: { emptyValueIndexs }
        }
      };
    } else {
      // 判断答案选项是否存在
      return TopicUtil.checkAnswerIsExistInOptions(topic, options);
    }
  }

  private static checkAnswerIsExistInOptions = (
    topic: Topic,
    options: TopicItemData[]
  ) => {
    const optionTitles = options
      .map(option => option.title.slice(0, 1))
      .join("")
      .toLocaleUpperCase();
    if (topic.answer) {
      let answerExist = true;
      if (topic.type === TopicType.singleChoice) {
        answerExist = optionTitles.includes(
          topic.answer.value.toLocaleUpperCase()
        );
      } else {
        const answers = topic.answer.value.toLocaleUpperCase().split("");
        answerExist = answers.every(answer => optionTitles.includes(answer));
      }
      if (!answerExist) {
        return {
          ...topic,
          error: {
            errorCode: TopicErrorCode.answerOptionNotExist,
            message: ErrorMessage.answerOptionNotExist
          }
        };
      }
    }
    return topic;
  };

  private static checkAnswer(topic: Topic) {
    if (!topic.answer) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.noAnswer,
          message: ErrorMessage.noAnswer
        }
      };
    } else if (topic.answer.value.length === 0) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.answerValueIsEmpty,
          message: ErrorMessage.answerValueIsEmpty
        }
      };
    } else if (topic.type === TopicType.multipleChoice) {
      const answers = topic.answer.value.split("");
      const setAnswer = new Set(answers);
      if (answers.length !== setAnswer.size) {
        return {
          ...topic,
          error: {
            errorCode: TopicErrorCode.answerRepeat,
            message: ErrorMessage.answerRepeat
          }
        };
      } else {
        return topic;
      }
    } else {
      return topic;
    }
  }

  private static checkScore(topic: Topic) {
    if (!topic.score) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.noScore,
          message: ErrorMessage.noScore
        }
      };
    } else if (!TopicUtilReg.scoreNumReg.test(topic.score.value)) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.scoreValueError,
          message: ErrorMessage.scoreValueError
        }
      };
    } else if (
      parseFloat(topic.score.value) < 0.1 ||
      parseFloat(topic.score.value) > 99.9
    ) {
      return {
        ...topic,
        error: {
          errorCode: TopicErrorCode.scoreOutOfLimit,
          message: ErrorMessage.scoreOutOfLimit
        }
      };
    } else {
      const points = topic.score.value.split(".");
      if (points.length === 2 && points[1].length > 1) {
        return {
          ...topic,
          error: {
            errorCode: TopicErrorCode.scoreOutOfLimit,
            message: ErrorMessage.scoreOutOfLimit
          }
        };
      }
      return topic;
    }
  }
}
