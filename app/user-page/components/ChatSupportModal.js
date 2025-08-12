import React, { useState } from 'react';
import '../styles/ChatSupportModal.css';

function ChatSupportModal({ onClose }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'support', text: '¡Hola! ¿En qué puedo ayudarte hoy? 😊' }
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            setMessages([...messages, { sender: 'user', text: message.trim() }]);
            setMessage('');
            // In a real app, you'd send this message to a backend/websocket
            // and potentially get a response back.
        }
    };

    return (
        <div className="modal-overlay">
            <div className="chat-modal-content">
                <div className="chat-header">
                    <span className="chat-dot"></span> 
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}`}>
                            {msg.sender === 'support' && <span className="sender-name">Soporte</span>}
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Escribe tu mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="chat-text-input"
                    />
                    <button type="submit" className="send-button">
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatSupportModal;