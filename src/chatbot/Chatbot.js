import { useState } from "react";
import './Chatbot.css';

function getSessionId() {
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId(); // 👈 Called once on load

export default function Chatbot() {
  const API_ENDPOINT = "https://t7n3dginr4.execute-api.us-east-1.amazonaws.com/prod/QueryWithPinecone";
  
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [chatHistory, setChatHistory] = useState([]); // 👈 This stores message history
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Add to chat history in model-friendly format
    const updatedHistory = [...chatHistory, { role: "user", content: input }];
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          history: updatedHistory // 👈 Send history to Lambda
          session_id: sessionId // 👈 include session_id heres
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const raw = await response.json();
      const data = JSON.parse(raw.body);

      const botText = data.answer || "I received your message but I'm not sure how to respond.";
      const botMessage = { text: botText, sender: "bot" };

      setMessages(prev => [...prev, botMessage]);
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: botText }
      ]);
    } catch (err) {
      console.error("Error communicating with bot:", err);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatBotText = (text) => {
    // Add a line break before any number + dot (e.g., "1." or "2.") unless it's the first line
    return text.replace(/(?<!^)(\s*\d+\.)/g, '\n$1');
  };

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
              <pre>
                {msg.sender === "bot" ? formatBotText(msg.text) : msg.text}
              </pre>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot-message typing-message">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
