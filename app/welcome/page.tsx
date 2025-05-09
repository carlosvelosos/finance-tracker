"use client"

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const chatMessages = [
    'Welcome to Finance Tracker!',
    'We are here to help you manage your finances.',
    'Let’s get started, shall we?',
];

const WelcomePage: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                setCurrentMessage((prev) => prev + chatMessages[messageIndex][charIndex]);
                setCharIndex((prev) => prev + 1);
            }, 50);
            return () => clearTimeout(typingTimeout);
        } else {
            // Current message is fully typed, pause then move to next
            const pauseTimeout = setTimeout(() => {
                setMessages((prevMessages) => [...prevMessages, chatMessages[messageIndex]]);
                setCurrentMessage('');
                setCharIndex(0);
                setMessageIndex((prevIndex) => prevIndex + 1);
            }, 900);
            return () => clearTimeout(pauseTimeout);
        }
    }, [charIndex, messageIndex]);

    return (
        <div style={styles.container}>
            <div style={styles.chatBox}>
                <div style={styles.spacer}></div>
                <div style={styles.chatMessages}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                color: `rgba(255,255,255,${0.9 - (messages.length - idx) * 0.2})`,
                                fontSize: '80px',
                                margin: '20px 0',
                                fontWeight: idx === messages.length - 1 ? 600 : 400,
                                transition: 'color 0.3s ease',
                            }}
                        >
                            {msg}
                        </div>
                    ))}
                    {messageIndex < chatMessages.length && (
                        <div style={{ 
                            color: '#fff', 
                            fontSize: '80px',
                            margin: '20px 0',
                            fontWeight: 700,
                            filter: 'brightness(1.3)',
                        }}>
                            {currentMessage}
                            <span style={styles.cursor}>{charIndex < chatMessages[messageIndex].length ? '|' : ''}</span>
                        </div>
                    )}
                    {showButton && (
                        <div style={styles.buttonContainer}>
                            <Link href="/family">
                                <button 
                                    style={styles.ctaButton} 
                                    className="cta-button"
                                >
                                    <span style={styles.buttonText}>Go to FAMILY page</span>
                                    <span className="button-arrow" style={styles.buttonArrow}>→</span>
                                </button>
                            </Link>
                            <style jsx global>{`
                                @keyframes buttonAppear {
                                    0% { opacity: 0; transform: translateY(30px); }
                                    60% { opacity: 1; transform: translateY(-10px); }
                                    80% { transform: translateY(5px); }
                                    100% { transform: translateY(0); }
                                }
                                @keyframes pulseGlow {
                                    0% { box-shadow: 0 0 10px rgba(0, 255, 174, 0.3); }
                                    50% { box-shadow: 0 0 30px rgba(0, 255, 174, 0.6); }
                                    100% { box-shadow: 0 0 10px rgba(0, 255, 174, 0.3); }
                                }
                                .cta-button {
                                    animation: buttonAppear 1s ease-out forwards, pulseGlow 3s infinite 1s;
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
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100vh',  // Use viewport height instead of 100%
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center' as 'center',
        justifyContent: 'flex-end' as 'flex-end',
        padding: 0,
        margin: 0,
        overflow: 'hidden', // Prevent scrolling on the container
    },
    chatBox: {
        width: '100%',
        maxWidth: '1400px',
        backgroundColor: 'transparent',
        padding: '0 40px 40px 40px', // Adjust padding (no top padding needed)
        borderRadius: 0,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'flex-end' as 'flex-end',
        height: 'calc(100vh - 70px)', // Account for navbar height (approximately)
        overflowY: 'auto' as 'auto',
        margin: '0 auto',
    },
    spacer: {
        flexGrow: 1, // This pushes the messages down
    },
    chatMessages: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        width: '100%',
    },
    buttonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center' as 'center',
        marginTop: '60px',
        marginBottom: '40px',
    },
    ctaButton: {
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: '50px',
        padding: '0 40px',
        height: '80px',
        fontSize: '28px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center',
        boxShadow: '0 8px 30px rgba(0, 255, 174, 0.3)',
        transition: 'all 0.3s ease',
        position: 'relative' as 'relative',
        overflow: 'hidden',
        border: '2px solid #00ffae',
    },
    buttonText: {
        position: 'relative' as 'relative',
        zIndex: 2,
        marginRight: '10px',
    },
    buttonArrow: {
        position: 'relative' as 'relative',
        zIndex: 2,
        fontSize: '32px',
        transition: 'transform 0.3s ease',
        transform: 'translateX(0)',
    },
    cursor: {
        display: 'inline-block',
        width: '10px',
        color: '#00ffae',
        fontWeight: 'bold',
        animation: 'blink 1s steps(1) infinite',
    },
};

export default WelcomePage;