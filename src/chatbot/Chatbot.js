import { useState } from "react";
import './Chatbot.css';

export default function Chatbot() {
  // Define your actual API endpoint
  const API_ENDPOINT = "https://t7n3dginr4.execute-api.us-east-1.amazonaws.com/dev/QueryWithPinecone";
  
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    
    const userInput = input;
    setInput(""); // Clear input field
    setIsLoading(true);
    
    try {
      // Send request to Lambda function via API Gateway
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputText: userInput
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response to chat
      const botResponse = { 
        text: data.message || "I received your message but I'm not sure how to respond.", 
        sender: "bot" 
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error("Error communicating with bot:", err);
      
      // Add error message as bot response
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

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
              {msg.text}
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