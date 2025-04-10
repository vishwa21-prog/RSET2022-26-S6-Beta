import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

// Full layouts for all supported languages with Shift support
const layouts: { [key: string]: any } = {
    english: {
        default: ["q w e r t y u i o p [ ] { }", "a s d f g h j k l ; ' \"", "z x c v b n m {shift} {bksp} {space}"],
        shift: ["Q W E R T Y U I O P { } [ ]", "A S D F G H J K L : ' \"", "Z X C V B N M ! @ # $ % ^ & * ( ) {shift} {bksp} {space}"]
    },
    hindi: {
        default: ["क ख ग घ ङ च छ ज झ ट ठ ड ढ ण", "त थ द ध न प फ ब भ म य र ल व", "श ष स ह क्ष त्र ज्ञ ॐ {shift} {bksp} {space}"],
        shift: ["क़ ख़ ग़ ज़ ड़ ढ़ फ़ य़ ऍ ऑ ऐ औ", "ा ि ी ु ू े ै ो ौ ं ँ ः ्", "० १ २ ३ ४ ५ ६ ७ ८ ९ {shift} {bksp} {space}"]
    },
    malayalam: {
        default: ["അ ആ ഇ ഈ ഉ ഊ ഋ ൠ എ ഏ ഐ ഒ ഓ ഔ", "ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ട ഠ ഡ ഢ", "ണ ത ഥ ദ ധ ന പ ഫ ബ ഭ മ {shift} {bksp} {space}"],
        shift: ["യ ര ല വ ശ ഷ സ ഹ ള ഴ റ റ്റ ട്ട ക്ക",
            "ാ േ ൈ ൊ ോ ൌ ൬ ൯ ൪ ൺ ൿ ങ്ങ ൽ ണ്ണ",
            "െ ി ീ ു ൂ ൃ ൄ ൢ ൣ ം ഃ ് ്ര {shift} {bksp} {space}"]


    },
    korean: {
        default: ["ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ", "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ", "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift} {bksp} {space}"],
        shift: ["ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ", "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ", "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift} {bksp} {space}"]
    },
    french: {
        default: ["a z e r t y u i o p à ç è é", "q s d f g h j k l m ù", "w x c v b n {shift} {bksp} {space}"],
        shift: ["A Z E R T Y U I O P À Ç È É", "Q S D F G H J K L M Ù", "W X C V B N {shift} {bksp} {space}"]
    },
    spanish: {
        default: ["q w e r t y u i o p ñ", "a s d f g h j k l á é í ó ú", "z x c v b n {shift} {bksp} {space}"],
        shift: ["Q W E R T Y U I O P Ñ", "A S D F G H J K L Á É Í Ó Ú", "Z X C V B N {shift} {bksp} {space}"]
    },
    german: {
        default: ["q w e r t z u i o p ü ß", "a s d f g h j k l ö ä", "y x c v b n m {shift} {bksp} {space}"],
        shift: ["Q W E R T Z U I O P Ü ß", "A S D F G H J K L Ö Ä", "Y X C V B N M {shift} {bksp} {space}"]
    },
    arabic: {
        default: ["ض ص ث ق ف غ ع ه خ ح ج د", "ش س ي ب ل ا ت ن م ك ط", "ئ ء ؤ ر لا ى ة و ز ظ {shift} {bksp} {space}"],
        shift: ["َ ً ُ ٌ ِ ٍ ّ ْ ة آ أ إ", "ـ ؤ ئ ء", "ـ لا {shift} {bksp} {space}"]
    },
    russian: {
        default: ["й ц у к е н г ш щ з х ъ", "ф ы в а п р о л д ж э", "я ч с м и т ь б ю {shift} {bksp} {space}"],
        shift: ["Й Ц У К Е Н Г Ш Щ З Х Ъ", "Ф Ы В А П Р О Л Д Ж Э", "Я Ч С М И Т Ь Б Ю {shift} {bksp} {space}"]
    },
    chinese: {
        default: ["一 二 三 四 五 六 七 八 九 十", "的 是 不 了 在 人 有 我 他", "这 那 你 好 吗 {shift} {bksp} {space}"],
        shift: ["爱 想 做 说 走 来 回 看 听", "吃 喝 住 买 学 问 写 读", "工作 朋友 家人 天气 {shift} {bksp} {space}"]
    }
};

const MultilingualKeyboard = ({ onChange }: { onChange: (input: string) => void }) => {
    const [input, setInput] = useState("");
    const [layout, setLayout] = useState("english");
    const [layoutName, setLayoutName] = useState("default");

    const handleChange = (newInput: string) => {
        setInput(newInput);
        onChange(newInput);
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLayout(event.target.value);
        setLayoutName("default"); // Reset to default when switching language
    };

    const toggleShift = () => {
        setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
    };

    return (
        <div style={{ textAlign: "center", padding: "10px" }}>
            <select value={layout} onChange={handleLanguageChange} style={{ padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}>
                {Object.keys(layouts).map((lang) => (
                    <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
            </select>

            <Keyboard layout={layouts[layout]} layoutName={layoutName} onChange={handleChange} display={{ "{shift}": "⇧ Shift", "{bksp}": "⌫", "{space}": "⎵" }} onKeyPress={(button) => { if (button === "{shift}") toggleShift(); }} theme={`hg-theme-default hg-layout-default ${layout === "malayalam" ? "malayalam-keyboard" : ""}`} />

            <p style={{ marginTop: "10px", padding: "8px", border: "1px solid #ddd", borderRadius: "5px", wordBreak: "break-word" }}>
                Typed Text: <strong>{input}</strong>
            </p>
        </div>
    );
};

export default MultilingualKeyboard;
