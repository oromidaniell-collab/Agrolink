import React from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
    const messages = [
        "Welcome to AgroLink Marketplace - Your direct link to fresh farm produce!",
        "Flash Sale: Up to 30% off on all Grains this week! 🌾",
        "New Logistics Services available: Fast delivery across all counties! 🚚",
        "Join our Advisory program for expert farming tips and market insights. 📈",
        "Quality Guaranteed: From farm to your doorstep. 🏠"
    ];

    return (
        <div className="announcement-bar">
            <div className="announcement-content">
                <div className="scrolling-text">
                    {messages.map((msg, index) => (
                        <span key={index} className="announcement-msg">
                            {msg}
                            <span className="separator">✦</span>
                        </span>
                    ))}
                    {/* Duplicate for seamless scrolling */}
                    {messages.map((msg, index) => (
                        <span key={`dup-${index}`} className="announcement-msg">
                            {msg}
                            <span className="separator">✦</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBar;
