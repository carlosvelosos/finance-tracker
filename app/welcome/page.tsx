"use client"

import React, { useEffect, useState } from 'react';

const chatMessages = [
    'Welcome to Finance Tracker!',
    'We are here to help you manage your finances.',
    'Let’s get started, shall we?',
];

const WelcomePage: React.FC = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(true);

    useEffect(() => {
        if (messageIndex >= chatMessages.length) return;
        if (!showMessage) return;
        if (charIndex < chatMessages[messageIndex].length) {
            const timeout = setTimeout(() => {
                setCurrentMessage((prev) => prev + chatMessages[messageIndex][charIndex]);
                setCharIndex((prev) => prev + 1);
            }, 50);
            return () => clearTimeout(timeout);
        } else {
            // Pause, then fade out and move to next message
            const pause = setTimeout(() => {
                setShowMessage(false);
            }, 1200);
            return () => clearTimeout(pause);
        }
    }, [charIndex, messageIndex, showMessage]);

    useEffect(() => {
        if (!showMessage && messageIndex < chatMessages.length) {
            // Fade out, then show next message
            const next = setTimeout(() => {
                setCurrentMessage('');
                setCharIndex(0);
                setMessageIndex((prev) => prev + 1);
                setShowMessage(true);
            }, 400);
            return () => clearTimeout(next);
        }
    }, [showMessage, messageIndex]);

    return (
        <div style={styles.container}>
            <div style={styles.chatBox}>
                {messageIndex < chatMessages.length && (
                    <div style={{ ...styles.bubble, opacity: showMessage ? 1 : 0, transition: 'opacity 0.4s' }}>
                        {currentMessage}
                        <span style={styles.cursor}>{showMessage && charIndex < chatMessages[messageIndex].length ? '|' : ''}</span>
                    </div>
                )}
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
        padding: '40px 20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center' as 'center',
        minHeight: '120px',
    },
    bubble: {
        background: '#23272f',
        borderRadius: '18px',
        padding: '18px 28px',
        fontSize: '20px',
        margin: '10px 0',
        minWidth: '200px',
        minHeight: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative' as 'relative',
        textAlign: 'left' as 'left',
        letterSpacing: '0.01em',
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