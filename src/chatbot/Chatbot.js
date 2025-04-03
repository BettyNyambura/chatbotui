import { useState } from "react";
import './Chatbot.css';


export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: "user" };
    const botResponse = { text: "This is a mock response.", sender: "bot" };
    
    setMessages([...messages, userMessage, botResponse]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-container flex gap-2 mt-4">
          <input
            className="border"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

  
