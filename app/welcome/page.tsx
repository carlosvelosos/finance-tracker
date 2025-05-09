"use client"

import React, { useEffect, useState, useRef } from 'react';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentMessage]);

    useEffect(() => {
        if (messageIndex >= chatMessages.length) {
            return; // All messages displayed
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
        // Remove marginTop:auto as it conflicts with our approach
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