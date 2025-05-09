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
                            color: idx === messages.length - 1 ? '#fff' : `rgba(255,255,255,${0.7 - 0.2 * (messages.length - 1 - idx)})`,
                            fontSize: '20px',
                            margin: '10px 0',
                            fontWeight: idx === messages.length - 1 ? 600 : 400,
                        }}
                    >
                        {msg}
                    </div>
                ))}
                {messageIndex < chatMessages.length && (
                    <div style={{ color: '#fff', fontSize: '20px', margin: '10px 0', fontWeight: 700 }}>
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
        width: '100vw',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'flex-start' as 'flex-start',
        justifyContent: 'flex-start' as 'flex-start',
        padding: 0,
        margin: 0,
    },
    chatBox: {
        width: '100%',
        maxWidth: '100%',
        backgroundColor: 'transparent',
        padding: '40px 40px',
        borderRadius: 0,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'flex-start' as 'flex-start',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto' as 'auto',
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