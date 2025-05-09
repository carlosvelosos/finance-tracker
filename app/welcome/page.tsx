"use client"

import React, { useEffect, useState } from 'react';

const WelcomePage: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const chatMessages = [
        'Welcome to Finance Tracker!',
        'We are here to help you manage your finances.',
        'Let’s get started, shall we?',
    ];

    useEffect(() => {
        let messageIndex = 0;
        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (messageIndex < chatMessages.length) {
                if (charIndex < chatMessages[messageIndex].length) {
                    setCurrentMessage((prev) => prev + chatMessages[messageIndex][charIndex]);
                    charIndex++;
                } else {
                    setMessages((prev) => [...prev, chatMessages[messageIndex]]);
                    setCurrentMessage('');
                    charIndex = 0;
                    messageIndex++;
                }
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.chatBox}>
                {messages.map((msg, index) => (
                    <p key={index} style={styles.message}>
                        {msg}
                    </p>
                ))}
                {currentMessage && <p style={styles.message}>{currentMessage}</p>}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
    },
    chatBox: {
        width: '80%',
        maxWidth: '600px',
        backgroundColor: '#1e1e1e',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    },
    message: {
        margin: '10px 0',
        fontSize: '18px',
        lineHeight: '1.5',
    },
};

export default WelcomePage;