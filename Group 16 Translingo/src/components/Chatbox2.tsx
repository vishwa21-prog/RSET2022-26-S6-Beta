import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { translateText } from "../utils/translate";

type Message = {
  id: number;
  sender: string;
  originalText: string;
  translatedText: string;
};

export default function ChatSpace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("French");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      const targetLang =
      language === "French" ? "fr" :
      language === "Chinese" ? "zh" :
      language === "German" ? "de" :
      language === "Spanish" ? "es" :
      language === "Arabic" ? "ar" : "en";
  
      const newMessage: Message = {
        id: Date.now(),
        sender: "user",
        originalText: inputText,
        translatedText: "Translating...",
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText("");

      const translatedText = await translateText(inputText, targetLang);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, translatedText } : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor="language">Translate to:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded-md"
        >
          <option>French</option>
          <option>Chinese</option>
          <option>German</option>
          <option>Spanish</option>
          <option>Arabic</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto p-4 border border-gray-700 rounded-md">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <p><strong>{message.sender}:</strong> {message.originalText}</p>
            <p className="text-sm text-gray-400 italic">{message.translatedText}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center space-x-2 mt-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-gray-700 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
          rows={1}
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md flex items-center"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

