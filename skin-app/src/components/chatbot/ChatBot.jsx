import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { getBotReply } from "./chatbotUtils";
import "../ChatBot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "# 👋 Welcome to DermaLens\n\nI'm your **AI Skin Disease Assistant**.\n\nYou can ask me about:\n\n• Skin Diseases\n• Image Upload\n• AI Prediction\n• Login & Registration\n• Reports\n• Privacy\n• Website Features",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const suggestions = [
    "What is DermaLens?",
    "How to upload image?",
    "What is acne?",
    "How to register?",
    "Supported diseases",
  ];

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  const sendMessage = async (question = input) => {
    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: question,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
    setTyping(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    const reply = getBotReply(question);
    setTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: reply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };
    return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {open && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div>
              <h3>🩺 DermaLens Assistant</h3>
              <small>🟢 Online</small>
            </div>

            <button
              className="close-btn"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Suggestions */}
          <div className="suggestions">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => sendMessage(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Chat Body */}
          <div className="chat-body">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "user-msg"
                    : "bot-msg"
                }
              >

                {msg.sender === "bot" && (
                  <div
                    style={{
                      marginRight: "8px",
                      fontSize: "22px",
                    }}
                  >
                    🤖
                  </div>
                )}

                <div>
                  <div className="message-content">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      marginTop: "5px",
                      textAlign: "right",
                    }}
                  >
                    {msg.time}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div
                    style={{
                      marginLeft: "8px",
                      fontSize: "22px",
                    }}
                  >
                    👤
                  </div>
                )}

              </div>
            ))}

            {typing && (
              <div className="bot-msg">
                <span className="typing">
                  🤖 AI is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef}></div>

          </div>
                    {/* Chat Input */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask me about DermaLens or skin diseases..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={() => sendMessage()}>
              Send
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;