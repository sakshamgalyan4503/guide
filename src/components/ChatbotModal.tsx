import React from "react";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ open, onClose, isDark }) => {
  if (!open) return null;

  return (
    <div
      className={`chatbot-backdrop ${isDark ? "dark" : "light"}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`chatbot-modal ${isDark ? "dark" : "light"}`}>
        <h3 className="chatbot-header">AI Assistant</h3>

        <iframe
          src="https://www.chatbase.co/chatbot-iframe/YP99Wk5SDORJIO3n5m2zq"
          width="100%"
          height="500"
          style={{ border: "none", borderRadius: "12px" }}
          title="Chatbase AI"
        ></iframe>

        <div className="chatbot-buttons">
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>

      <style>{`
        .chatbot-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.4s ease-out forwards;
        }

        .chatbot-backdrop.light {
          background: rgba(255, 255, 255, 0.7);
        }

        .chatbot-backdrop.dark {
          background: rgba(0, 0, 0, 0.7);
        }

        .chatbot-modal {
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          animation: slideIn 0.5s ease-out;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .chatbot-modal.light {
          background: linear-gradient(to bottom right, #ffffff, #f3f3f3);
          color: #111;
        }

        .chatbot-modal.dark {
          background: linear-gradient(to bottom right, #1c1c1c, #2a2a2a);
          color: #f1f1f1;
        }

        .chatbot-header {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(200, 200, 200, 0.3);
        }

        .chatbot-buttons {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .close-button {
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          background: linear-gradient(to right, #f87171, #fca5a5);
          transition: all 0.3s ease;
        }

        .close-button:hover {
          transform: scale(0.95);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatbotModal;
