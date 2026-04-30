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

  // Fetch document context if we are on a document detail page
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
        generationConfig: {
          maxOutputTokens: 500,
        },
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
        errorMessage = `The AI model '${import.meta.env.VITE_GEMINI_MODEL || "gemini-3.1-flash-lite-preview"}' was not found.`;
      } else if (!import.meta.env.VITE_GEMINI_API_KEY) {
        errorMessage = "VITE_GEMINI_API_KEY is missing from your environment variables.";
      } else {
        errorMessage = `Error: ${error.message || "Unknown error occurred"}`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, fontFamily: "inherit" }}>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#7DFF6B",
            color: "#0d0f0c",
            border: "none",
            boxShadow: "0 4px 12px rgba(125, 255, 107, 0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MdChat size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: 360,
            height: 500,
            background: "#111210",
            border: "1px solid rgba(125,255,107,0.2)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(125,255,107,0.05)",
              borderBottom: "1px solid rgba(125,255,107,0.1)",
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
                  background: "#7DFF6B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0d0f0c",
                }}
              >
                <MdSmartToy size={20} />
              </div>
              <div>
                <h3 style={{ color: "#e8e8e4", fontSize: 14, fontWeight: 700, margin: 0 }}>DocBot AI</h3>
                <span style={{ color: "#7DFF6B", fontSize: 10, fontWeight: 600 }}>Your helping assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "#697565", cursor: "pointer" }}
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 20,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user" ? "#7DFF6B" : "rgba(255,255,255,0.05)",
                  color: msg.role === "user" ? "#0d0f0c" : "#e8e8e4",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                {msg.role === "assistant" ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>

            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: 4 }}>
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: 6,
                      height: 6,
                      background: "#7DFF6B",
                      borderRadius: "50%",
                      animation: `bounce 0.6s infinite ${dot * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: "1px solid rgba(125,255,107,0.1)" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something..."
                style={{
                  width: "100%",
                  background: "#181a17",
                  border: "1px solid rgba(125,255,107,0.15)",
                  borderRadius: 24,
                  padding: "10px 44px 10px 16px",
                  color: "#e8e8e4",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  position: "absolute",
                  right: 6,
                  width: 32,
                  height: 32,
                  background: input.trim() && !loading ? "#7DFF6B" : "transparent",
                  color: input.trim() && !loading ? "#0d0f0c" : "#697565",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <MdSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .markdown-content p { margin: 0 0 8px 0; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul, .markdown-content ol { margin: 8px 0; padding-left: 20px; }
        .markdown-content li { margin-bottom: 4px; }
        .markdown-content strong { color: #7DFF6B; }
      `}</style>

    </div>
  );
};

export default Chatbot;
