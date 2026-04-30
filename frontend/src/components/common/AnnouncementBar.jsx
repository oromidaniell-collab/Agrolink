import React from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
    const messages = [
        "Welcome to AgroLink - Kenya's Number One Agricultural Marketplace",
        "Direct Link Between Farmers and Buyers - No Middlemen, Better Prices",
        "Source Quality Farm Inputs, Seeds and Fertilizers from Trusted Suppliers",
        "Fast and Reliable Transport and Logistics for Your Farm Produce",
        "Expert Agricultural Advisory and Real-time Market Price Insights",
        "Secure Payments and Guaranteed Trade Across All 47 Counties"
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
