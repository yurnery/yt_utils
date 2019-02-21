interface CharacteristicType {
    name: string;
    value: string;
}
interface Characteristic {
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
interface Word {
    word: string;
    explain: string;
    characteristic: Characteristic;
}
export declare class WordUtils {
    static parse: (str: string) => Word[];
    private static allCharacteristicReg;
    private static splitCharacteristic;
    private static distinctResult;
}
export {};
