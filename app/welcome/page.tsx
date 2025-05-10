"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const chatMessages = [
  "Welcome to Finance Tracker!",
  "We are here to help you manage your finances.",
  "Let’s get started, shall we?",
];

const WelcomePage: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentMessage]);

  useEffect(() => {
    if (messageIndex >= chatMessages.length) {
      // All messages displayed, show the button with a delay
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 1000);
      return () => clearTimeout(buttonTimer);
    }

    if (charIndex < chatMessages[messageIndex].length) {
      // Currently typing a message
      const typingTimeout = setTimeout(() => {
        setCurrentMessage(
          (prev) => prev + chatMessages[messageIndex][charIndex],
        );
        setCharIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(typingTimeout);
    } else {
      // Current message is fully typed, pause then move to next
      const pauseTimeout = setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          chatMessages[messageIndex],
        ]);
        setCurrentMessage("");
        setCharIndex(0);
        setMessageIndex((prevIndex) => prevIndex + 1);
      }, 900);
      return () => clearTimeout(pauseTimeout);
    }
  }, [charIndex, messageIndex]);

  const handleNavigationToFamilyPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true); // Start the animation sequence
    if (containerRef.current) {
      containerRef.current.classList.add("navigation-started");
    }

    // Wait for animations to complete before navigating
    setTimeout(() => {
      router.push("/family");
    }, 1200); // Adjusted timing for better sequence with the family page animation
  };
  return (
    <div
      ref={containerRef}
      className={`welcome-container w-full h-screen bg-[#121212] text-white font-sans flex flex-col items-center justify-center p-0 m-0 overflow-hidden pt-20 border-2 border-[#00ffae] ${isNavigating ? "navigating" : ""}`}
    >
      <div className="w-full max-w-[1400px] h-[65vh] max-h-[calc(100vh-120px)] bg-transparent p-10 rounded-none flex flex-col justify-end overflow-y-auto mx-auto mt-0 border-2 border-[#00ffae]">
        <div className="min-h-[20vh] flex-grow border-2 border-[#00ffae]"></div>
        <div className="chatMessages flex flex-col w-full border-2 border-[#00ffae]">
          {" "}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-[80px] my-5 transition-colors duration-300 border-2 border-[#00ffae]`}
              style={{
                color: `rgba(255,255,255,${0.9 - (messages.length - idx) * 0.2})`,
                fontWeight: idx === messages.length - 1 ? 600 : 400,
              }}
            >
              {msg}
            </div>
          ))}
          {messageIndex < chatMessages.length && (
            <div className="text-white text-[80px] my-5 font-bold brightness-[1.3] border-2 border-[#00ffae]">
              {currentMessage}
              <span className="inline-block w-[10px] text-[#00ffae] font-bold animate-blink">
                {charIndex < chatMessages[messageIndex].length ? "|" : ""}
              </span>
            </div>
          )}{" "}
          {showButton && (
            <div className="w-full flex justify-center mt-[60px] mb-[40px]">
              {" "}
              <button
                className="cta-button bg-black text-white rounded-[50px] py-0 px-10 h-20 text-[28px] font-bold cursor-pointer flex items-center justify-center shadow-[0_8px_30px_rgba(0,255,174,0.3)] transition-all duration-300 relative overflow-hidden border-2 border-[#00ffae]"
                onClick={handleNavigationToFamilyPage}
              >
                <span className="relative z-[2] mr-[10px]">
                  Go to FAMILY page
                </span>
                <span className="button-arrow relative z-[2] text-[32px] transition-transform duration-300 transform translate-x-0">
                  →
                </span>
              </button>
              <style jsx global>{`
                @keyframes buttonAppear {
                  0% {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  60% {
                    opacity: 1;
                    transform: translateY(-10px);
                  }
                  80% {
                    transform: translateY(5px);
                  }
                  100% {
                    transform: translateY(0);
                  }
                }
                @keyframes pulseGlow {
                  0% {
                    box-shadow: 0 0 10px rgba(0, 255, 174, 0.3);
                  }
                  50% {
                    box-shadow: 0 0 30px rgba(0, 255, 174, 0.6);
                  }
                  100% {
                    box-shadow: 0 0 10px rgba(0, 255, 174, 0.3);
                  }
                }
                @keyframes moveUpFadeOut {
                  0% {
                    transform: translateY(0);
                    opacity: 1;
                  }
                  100% {
                    transform: translateY(-100vh);
                    opacity: 0;
                  }
                }
                @keyframes whiteOverlay {
                  0% {
                    transform: translateY(100%);
                  }
                  100% {
                    transform: translateY(0);
                  }
                }
                @keyframes blink {
                  0%,
                  100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0;
                  }
                }
                .welcome-container {
                  position: relative;
                  overflow: hidden;
                }
                .welcome-container::after {
                  content: "";
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  background-color: #ffffff;
                  transform: translateY(100%);
                  z-index: 1000;
                }
                .welcome-container.navigating::after {
                  animation: whiteOverlay 0.7s ease-in forwards 0.6s;
                }
                .welcome-container.navigating .chatMessages,
                .welcome-container.navigating .buttonContainer {
                  animation: moveUpFadeOut 0.7s ease-out forwards;
                }
                .cta-button {
                  animation:
                    buttonAppear 1s ease-out forwards,
                    pulseGlow 3s infinite 1s;
                  transition: all 0.3s ease !important;
                }
                .cta-button:hover {
                  background-color: #00ffae !important;
                  color: #000 !important;
                  transform: translateY(-5px) scale(1.05) !important;
                  box-shadow: 0 12px 30px rgba(0, 255, 174, 0.5) !important;
                }
                .cta-button:hover .button-arrow {
                  transform: translateX(5px);
                }
              `}</style>
            </div>
          )}{" "}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
