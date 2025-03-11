"use client";

import React from 'react';

interface LivesProps {
    lives: number;
}

const Lives: React.FC<LivesProps> = ({ lives }) => {
    const totalLives = 3;
    const hearts = [];

    for (let i = 0; i < totalLives; i++) {
        if (i < lives) {
            hearts.push(
                <img
                    key={i}
                    src="/heart.svg"
                    alt="Heart"
                    className="w-12 h-12"
                />
            );
        } else {
            hearts.push(
                <img
                    key={i}
                    src="/heart-outline.svg"
                    alt="Heart Outline"
                    className="w-12 h-12"
                />
            );
        }
    }

    return <div className="flex space-x-2">{hearts}</div>;
};

export default Lives;