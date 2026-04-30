import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useRef, useState } from "react";
import { MdChat, MdClose, MdSend, MdSmartToy } from "react-icons/md";
import { useLocation, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your Document Assistant. How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [docContext, setDocContext] = useState(null);
  const scrollRef = useRef(null);
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    const fetchContext = async () => {
      if (location.pathname.startsWith("/documents/") && id) {
        try {
          const res = await api.get(`/documents/${id}`);
          setDocContext(res.data);
        } catch (err) {
          console.error("Failed to fetch doc context for chatbot", err);
        }
      } else {
        setDocContext(null);
      }
    };
    fetchContext();
  }, [location.pathname, id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      let systemPrompt = "You are a helpful assistant for a Document Tracking System. ";
      if (docContext) {
        systemPrompt += `You are currently helping with a document titled "${docContext.title}". 
        Details:
        - Description: ${docContext.description}
        - Department: ${docContext.department}
        - Status: ${docContext.workflow?.currentStage || docContext.status}
        - Remarks: ${docContext.remarks}
        - Created At: ${docContext.createdAt}
        `;
      } else {
        systemPrompt += "The user is currently browsing the dashboard or other pages.";
      }
      systemPrompt += "\nKeep your answers concise and professional. Use Markdown for formatting (bold, lists, etc.) to make the information easy to read.";

      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview",
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: messages.filter(m => m.text !== "Hello! I'm your Document Assistant. How can I help you today?").map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
        generationConfig: { maxOutputTokens: 500 },
      });

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();
      setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      let errorMessage = "Sorry, I encountered an error.";
      if (error.message?.includes("API_KEY_INVALID")) {
        errorMessage = "Invalid Gemini API key. Please check your .env file.";
      } else if (error.message?.includes("model not found")) {
        errorMessage = `The AI model was not found.`;
      } else if (!import.meta.env.VITE_GEMINI_API_KEY) {
        errorMessage = "VITE_GEMINI_API_KEY is missing from your environment variables.";
      } else {
        errorMessage = `Error: ${error.message || "Unknown error occurred"}`;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#111111",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#242424";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111111";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <MdChat size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: 360,
            height: 500,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "#f8f9fa",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#111111",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <MdSmartToy size={18} />
              </div>
              <div>
                <h3 style={{ color: "#111111", fontSize: 14, fontWeight: 600, margin: 0 }}>DocBot AI</h3>
                <span style={{ color: "#10b981", fontSize: 11, fontWeight: 500 }}>● Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                padding: 4,
                borderRadius: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "#ffffff",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user" ? "#111111" : "#f5f5f5",
                  color: msg.role === "user" ? "#ffffff" : "#111111",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {msg.role === "assistant" ? (
                  <div className="chatbot-markdown">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "10px 14px", background: "#f5f5f5", borderRadius: "14px 14px 14px 2px" }}>
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: 6,
                      height: 6,
                      background: "#9ca3af",
                      borderRadius: "50%",
                      animation: `bounce 0.6s infinite ${dot * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something…"
                style={{
                  width: "100%",
                  background: "#f5f5f5",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "9px 42px 9px 14px",
                  color: "#111111",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#111111")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  position: "absolute",
                  right: 6,
                  width: 30,
                  height: 30,
                  background: input.trim() && !loading ? "#111111" : "#e5e7eb",
                  color: input.trim() && !loading ? "#ffffff" : "#9ca3af",
                  border: "none",
                  borderRadius: 6,
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = "#242424"; }}
                onMouseLeave={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = "#111111"; }}
              >
                <MdSend size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chatbot-markdown p { margin: 0 0 8px 0; }
        .chatbot-markdown p:last-child { margin-bottom: 0; }
        .chatbot-markdown ul, .chatbot-markdown ol { margin: 8px 0; padding-left: 18px; }
        .chatbot-markdown li { margin-bottom: 3px; }
        .chatbot-markdown strong { color: #111111; font-weight: 600; }
        .chatbot-markdown code { background: #e5e7eb; border-radius: 4px; padding: 1px 5px; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default Chatbot;
