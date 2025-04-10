import React, { useState, useRef, useEffect } from "react";
import { translateText, supportedLanguages } from "../utils/translate";
import EmojiPicker from "emoji-picker-react";
import MultilingualKeyboard from "./MultilingualKeyboard";
import { supabase } from '../components/Supabaseclient.tsx'; // Import Supabase client

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: number;
  sender_email: string;
  receiver_email: string;
  message: string;
  translated_message: string;
  created_at: string;
};

type ChatboxProps = {
  selectedContact: { id: number; name: string; email: string };
  goBack: () => void;
  senderLanguage: string;
  currentUserEmail: string;
};

const Chatbox: React.FC<ChatboxProps> = ({ selectedContact, goBack, senderLanguage, currentUserEmail }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [fromLanguage, setFromLanguage] = useState("en");
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const recognitionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();

    // Create a channel with a unique name for this conversation
    const channelName = `chat-${Math.random()}`;
    const channel = supabase.channel(channelName)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
            async (payload) => {
                console.log('New message payload:', payload);
                const newMessage = payload.new as Message;
                
                // Check if message is part of this conversation
                if ((newMessage.sender_email === currentUserEmail && 
                     newMessage.receiver_email === selectedContact.email) ||
                    (newMessage.sender_email === selectedContact.email && 
                     newMessage.receiver_email === currentUserEmail)) {
                    console.log('Message belongs to this conversation:', newMessage);
                    handleNewMessage(newMessage);
                }
            }
        )
        .subscribe((status) => {
            console.log(`Subscription status for ${channelName}:`, status);
        });

    // Cleanup
    return () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
    };
  }, [currentUserEmail, selectedContact.email]);

  const fetchMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_email.eq.${currentUserEmail},receiver_email.eq.${selectedContact.email}),` +
                `and(sender_email.eq.${selectedContact.email},receiver_email.eq.${currentUserEmail})`
            )
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch error details:', error);
            throw error;
        }
        
        console.log('Fetched messages:', data);
        setMessages(data || []);
        
        // Scroll to bottom after fetching messages
        setTimeout(() => {
            if (chatWindowRef.current) {
                chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
            }
        }, 100);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (newMsg: Message) => {
    setMessages(prevMessages => {
        // Check if message already exists
        if (!prevMessages.some(msg => msg.id === newMsg.id)) {
            console.log('Adding new message to state:', newMsg);
            const updatedMessages = [...prevMessages, newMsg].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            // Scroll to bottom when new message arrives
            setTimeout(() => {
                if (chatWindowRef.current) {
                    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
                }
            }, 100);
            
            return updatedMessages;
        }
        return prevMessages;
    });
  };

  const handleEmojiClick = (emojiObject: any) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const startSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = fromLanguage;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (isRecording) stopSpeechToText();
    if (!input.trim()) return;

    try {
        // Use the selected source and target languages
        const sourceLang = fromLanguage;
        const targetLang = targetLanguage;

        // Handle emojis
        const emojiRegex = /[\p{Emoji}]/gu;
        const extractedEmojis = input.match(emojiRegex)?.join("") || "";
        const textWithoutEmojis = input.replace(emojiRegex, "").trim();

        // First, show the message immediately with "Translating..." status
        const tempMessage: Message = {
            id: Date.now(),
            sender_email: currentUserEmail,
            receiver_email: selectedContact.email,
            message: input.trim(),
            translated_message: "Translating...",
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setInput("");

        // Perform translation
        let translatedText;
        if (textWithoutEmojis === "") {
            translatedText = extractedEmojis;
        } else {
            try {
                translatedText = await translateText(textWithoutEmojis, sourceLang, targetLang);
                translatedText = translatedText + " " + extractedEmojis;
            } catch (translationError) {
                console.error('Translation error:', translationError);
                translatedText = input.trim();
            }
        }

        // Send message to Supabase
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_email: currentUserEmail,
                receiver_email: selectedContact.email,
                message: input.trim(),
                translated_message: translatedText.trim(),
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Remove temporary message and add the real one
        if (data && data[0]) {
            setMessages(prev => 
                prev.filter(msg => msg.id !== tempMessage.id).concat(data[0])
            );
        }

    } catch (error: any) {
        console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        alert('Failed to send message. Please try again.');
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100vh",
      minHeight: "100vh",
      background: "linear-gradient(to right, #132666, #3a4d8f)",
      fontFamily: "'Poppins', sans-serif",
      paddingBottom: "20px"
    }}>
      {/* Back & Clear Chat Buttons */}
      <div style={{ display: "flex", gap: "10px", margin: "10px", paddingTop: "20px" }}>
        <button
          onClick={goBack}
          style={{ padding: "8px 12px", backgroundColor: "#6A95CC", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none", fontFamily: "'Poppins', sans-serif" }}
        >
          🔙 Back to Contacts
        </button>

        <button
          onClick={clearChat}
          style={{ padding: "8px 12px", backgroundColor: "#6A95CC", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none", fontFamily: "'Poppins', sans-serif" }}
        >
          🗑 Clear Chat
        </button>
      </div>

      <h2 style={{ color: "white" }}>Chat with {selectedContact.name}</h2>

      {/* Language Selection Area */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "20px", 
        marginBottom: "15px",
        color: "white",
        padding: "10px",
        backgroundColor: "rgba(106, 149, 204, 0.1)",
        borderRadius: "8px"
      }}>
        {/* From Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label>From:</label>
          <select
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              backgroundColor: "#6A95CC",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>

        {/* To Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label>To:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              backgroundColor: "#6A95CC",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif"
            }}
          >

            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{ flex: 1, width: "90%", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "10px", overflow: "hidden" }}>
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }} ref={chatWindowRef}>
          {messages.map((message) => {
            const isUserMessage = message.sender_email === currentUserEmail;
            return (
              <div key={message.id} style={{ 
                display: "flex", 
                justifyContent: isUserMessage ? "flex-end" : "flex-start" 
              }}>
                <div style={{
                  width: "60%",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  backgroundColor: isUserMessage ? "#DCF8C6" : "#F1F0F0",
                  opacity: message.translated_message === "Translating..." ? 0.7 : 1
                }}>
                  <p style={{ fontWeight: "bold" }}>
                    {isUserMessage ? message.message : message.translated_message}
                  </p>
                  <p style={{ color: "gray", fontSize: "14px" }}>
                    {isUserMessage ? message.translated_message : message.message}
                  </p>
                  {message.translated_message === "Translating..." ? (
                    <p style={{ color: "#666", fontSize: "12px", fontStyle: "italic" }}>
                      Translating...
                    </p>
                  ) : (
                    <small style={{ color: "#666", fontSize: "10px" }}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </small>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Box & Buttons */}
        <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd", alignItems: "center" }}>
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            style={{
              width: "40px", height: "40px",
              backgroundColor: showKeyboard ? "#ddd" : "#f0f0f0",
              color: "#fff", borderRadius: "6px", border: "1px solid #ccc",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", marginRight: "8px"
            }}>
            ⌨️
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: "12px", border: "1px solid #ccc", fontSize: "16px"
            }}
          />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              width: "40px", height: "40px",
              backgroundColor: "#f0f0f0", borderRadius: "6px",
              border: "1px solid #ccc", cursor: "pointer",
              fontSize: "18px", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginRight: "8px", marginLeft: "8px"
            }}>
            😀
          </button>

          {showEmojiPicker && (
            <div style={{ position: "absolute", bottom: "60px", right: "10px", zIndex: 1000 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          <button
            onClick={isRecording ? stopSpeechToText : startSpeechToText}
            style={{
              width: "40px", height: "40px",
              borderRadius: "6px", border: isRecording ? "3px solid red" : "1px solid #ccc",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginRight: "8px"
            }}>
            {isRecording ? "🔴" : "🎤"}
          </button>

          <button
            onClick={handleSendMessage}
            style={{
              width: "40px", height: "40px",
              backgroundColor: "#000", color: "#fff",
              borderRadius: "6px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            ➤
          </button>
        </div>

        {showKeyboard && <MultilingualKeyboard onChange={(text) => setInput(text)} />}
      </div>
    </div>
  );
};

export default Chatbox;