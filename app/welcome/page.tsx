"use client"

import React, { useEffect, useState } from 'react';

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
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            color: `rgba(255,255,255,${0.9 - (messages.length - idx) * 0.2})`,
                            fontSize: '20px',
                            margin: '10px 0',
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
                        fontSize: '20px', 
                        margin: '10px 0', 
                        fontWeight: 700,
                        filter: 'brightness(1.3)',
                    }}>
                        {currentMessage}
                        <span style={styles.cursor}>{charIndex < chatMessages[messageIndex].length ? '|' : ''}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center' as 'center', // Changed to center alignment
        justifyContent: 'flex-start' as 'flex-start',
        padding: 0,
        margin: 0,
    },
    chatBox: {
        width: '100%',
        maxWidth: '1400px', // Match the navbar's max-width from the screenshot
        backgroundColor: 'transparent',
        padding: '40px 40px',
        borderRadius: 0,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'flex-start' as 'flex-start',
        flex: 1,
        overflowY: 'auto' as 'auto',
        margin: '0 auto', // Center horizontally
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