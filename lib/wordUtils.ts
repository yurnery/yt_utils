/*
 * @Author: weiwenshe
 * @Date: 2019-02-13 13:52:41
 * @Last Modified by: weiwenshe
 * @Last Modified time: 2019-03-04 11:05:50
 */

export interface CharacteristicType {
  name: string;
  value: string;
}

export interface Characteristic {
  // 不一定全有这些 属性, 只有这些属性有值的时候, 才有这个 key
  adj?: CharacteristicType;
  n?: CharacteristicType;
  vt?: CharacteristicType;
  adv?: CharacteristicType;
  vi?: CharacteristicType;
  prep?: CharacteristicType;
  conj?: CharacteristicType;
  v?: CharacteristicType;
  pron?: CharacteristicType;
  interj?: CharacteristicType;
  art?: CharacteristicType;
  num?: CharacteristicType;
}

export interface Word {
  word: string;
  explain: string;
  characteristic: Characteristic;
}

// 生成正则规则工具
class WordRegUtil {
  public static generateCharecterReg = (pre: string) => {
    return new RegExp(
      `(${pre}[.．][\\s&＆adjnvtadvviprepconjvpron.．,，]*)` +
        `(.*?)` +
        `${WordRegUtil.characteristicEnd()}`
    );
  };

  public static generateSplitReg = () => {
    return new RegExp(
      `(.*?)` +
        `(?=${WordRegUtil.splitWordEnd1}|${WordRegUtil.splitWordEnd2()})` +
        `(.*)`
    );
  };

  private static sepStr = `[.．]`;
  private static nonEngLetter = `[^\\x00-\\xff…△、’]`;
  private static splitWordEnd1 = `(?:[\\[/]|\\d+\\s*[^\\x00-\\xff])`;

  private static characteristicKeyWord = () =>
    `vi${WordRegUtil.sepStr}|adj${WordRegUtil.sepStr}|n${
      WordRegUtil.sepStr
    }|vt${WordRegUtil.sepStr}|adv${WordRegUtil.sepStr}|prep${
      WordRegUtil.sepStr
    }|conj${WordRegUtil.sepStr}|v${WordRegUtil.sepStr}|pron${
      WordRegUtil.sepStr
    }|interj${WordRegUtil.sepStr}|art${WordRegUtil.sepStr}|num${
      WordRegUtil.sepStr
    }`;

  private static characteristicEnd = () =>
    `(?=${WordRegUtil.characteristicKeyWord()}|$)`;

  private static splitWordEnd2 = () =>
    `(?:\\(${
      WordRegUtil.nonEngLetter
    }|……|${WordRegUtil.characteristicKeyWord()}|${WordRegUtil.nonEngLetter}|$)`;
}

// 所有正则表达式管理类
class WordReg {
  // 处理的词性如下:  adj.  n.  vt.  adv.  vi.  prep.  conj. v. pron. interj. art. num.
  public static splitReg = WordRegUtil.generateSplitReg();
  public static adjReg = WordRegUtil.generateCharecterReg("adj");
  public static nReg = WordRegUtil.generateCharecterReg("n");
  public static vtReg = WordRegUtil.generateCharecterReg("vt");
  public static advReg = WordRegUtil.generateCharecterReg("adv");
  public static viReg = WordRegUtil.generateCharecterReg("vi");
  public static prepReg = WordRegUtil.generateCharecterReg("prep");
  public static conjReg = WordRegUtil.generateCharecterReg("conj");
  public static vReg = WordRegUtil.generateCharecterReg("v");
  public static pronReg = WordRegUtil.generateCharecterReg("pron");
  public static interjReg = WordRegUtil.generateCharecterReg("interj");
  public static artReg = WordRegUtil.generateCharecterReg("art");
  public static numReg = WordRegUtil.generateCharecterReg("num");

  public static replaceNumReg = /^[\d、.]*/;
  public static soundmarkReg = /[/／\[［].*[/／\]］]/;
}

// 转换工具类
export class WordUtils {
  /**
   * 解析单词
   */
  public static parse = (str: string): Word[] => {
    const allWords = str
      .trim()
      .split("\n")
      .filter(line => line.trim().length > 0);
    const words = [];
    for (const wordStr of allWords) {
      const rmIndexStr = wordStr.replace(WordReg.replaceNumReg, "").trim();
      const result = rmIndexStr.match(WordReg.splitReg);
      if (result) {
        const word = result[1].trim();
        const explain = result[2].replace(WordReg.soundmarkReg, "").trim();
        const characteristic = WordUtils.splitCharacteristic(explain);
        if (word.length > 0) {
          words.push({ word, explain, characteristic });
        }
      }
    }
    return words;
  };

  private static allCharacteristicReg = [
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
  private static splitCharacteristic = (content: string) => {
    const result: any = {};
    WordUtils.allCharacteristicReg.forEach(obj => {
      const res = content.match(obj.reg);
      if (res) {
        result[obj.type] = { name: res[1], value: res[2] };
      }
    });
    const characteristic = WordUtils.distinctResult(result);
    return characteristic;
  };

  // 去重, 只保留最长的结果
  private static distinctResult = (result: any) => {
    const dict: any = {};
    for (const type in result) {
      if (result.hasOwnProperty(type)) {
        const name = result[type].name;
        const value = result[type].value;

        if (dict[value] !== undefined) {
          const lastname = dict[value].name;
          const lasttype = dict[value].type;
          if (lastname.includes(name)) {
            // 之前的更长, 需要删除现在的 key
            delete result[type];
          } else if (name.includes(lastname)) {
            // 当前 name 更长, 需要删除之前的, 然后把现在的存起来用于后面对比
            delete result[lasttype];
            dict[value] = { name, type };
          }
        } else {
          dict[value] = { name, type };
        }
      }
    }
    return result;
  };
}
