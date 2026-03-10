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
      className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-[10px] animate-[fadeIn_0.4s_ease-out_forwards] ${isDark ? "bg-black/70" : "bg-white/70"}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`rounded-[20px] p-6 w-[90%] max-w-[500px] animate-[slideIn_0.5s_ease-out] shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/10 ${isDark ? "bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] text-[#f1f1f1]" : "bg-gradient-to-br from-white to-[#f3f3f3] text-[#111]"}`}>
        <h3 className="text-[24px] font-bold text-center mb-5 pb-2.5">AI Assistant</h3>

        <iframe
          src="https://www.chatbase.co/chatbot-iframe/YP99Wk5SDORJIO3n5m2zq"
          width="100%"
          height="500"
          style={{ border: "none", borderRadius: "12px" }}
          title="Chatbase AI"
        ></iframe>

        <div className="flex justify-end mt-3">
          <button onClick={onClose} className="px-5 py-3.5 text-[15px] font-semibold border-none rounded-xl text-white cursor-pointer bg-gradient-to-r from-red-400 to-red-300 transition-all duration-300 hover:scale-95">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
