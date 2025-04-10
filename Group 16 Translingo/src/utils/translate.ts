import axios from "axios";

// ✅ MyMemory API URL
const API_URL = "https://api.mymemory.translated.net/get";

// ✅ Supported Languages
export const supportedLanguages: { [key: string]: string } = {
    English: "en",
    French: "fr",
    Spanish: "es",
    German: "de",
    Chinese: "zh",
    Arabic: "ar",
    Hindi: "hi",
    Italian: "it",
    Portuguese: "pt",
    Russian: "ru",
    Japanese: "ja",
    Korean: "ko",
    Malayalam: "ml",
};

export const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    try {
        const response = await axios.get(API_URL, {
            params: { q: text, langpair: `${sourceLang}|${targetLang}` },
        });
        return response.data.responseData.translatedText;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
};
