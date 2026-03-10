import React, { useEffect, useState } from "react";
import ChatbotModal from "./ChatbotModal";

const ChatbotButton = () => {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(match.matches);
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    match.addEventListener("change", listener);
    return () => match.removeEventListener("change", listener);
  }, []);

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="fixed right-5 bottom-5 w-[75px] h-[75px] rounded-full bg-[#DACAFF] text-black border-none text-[18px] font-bold z-[9999] shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 hover:bg-[#5223BC] hover:text-white flex items-center justify-center cursor-pointer"
      >
        Ask AI
      </button>

      <ChatbotModal open={open} onClose={() => setOpen(false)} isDark={isDark} />
    </>
  );
};

export default ChatbotButton;
