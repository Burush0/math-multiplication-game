"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ModalProps {
    children: React.ReactNode;
    onAction: () => void;
    actionText: string;
}

const Modal: React.FC<ModalProps> = ({ children, onAction, actionText }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">{children}</h2>
            <button
                onClick={onAction}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                {actionText}
            </button>
        </div>
    </div>
);

const Game: React.FC = () => {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(5);
    const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const startGame = () => {
        setIsStartModalOpen(false);
        setTimeLeft(5);
        startTimer();
        fetchQuestion();
    };

    useEffect(() => {
        if (lives === 0 || timeLeft === 0) {
            setIsGameOverModalOpen(true);
            clearTimer();
        }
    }, [lives, timeLeft]);

    const handleResetGame = async () => {
        setIsGameOverModalOpen(false);
        await resetGame();
    };

    const startTimer = () => {
        clearTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => (prevTime === 0 ? 0 : prevTime - 1));
        }, 1000);
    };

    useEffect(() => {
        startTimer();
        return () => clearTimer();
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const fetchQuestion = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/get-question');
            const data = await res.json();
            setCurrentQuestion(data.question);
            setCurrentOptions(data.options);
            setScore(data.score);
            setLives(data.lives);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const submitAnswer = async (key: string) => {
        const res = await fetch('http://127.0.0.1:8080/api/submit-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: key }),
        });
        const data = await res.json();
        setScore(data.score);
        setLives(data.lives);
        if (data.next_question && data.next_options) {
            setCurrentQuestion(data.next_question);
            setCurrentOptions(data.next_options);
        }
    };

    const resetGame = async () => {
        const res = await fetch('http://127.0.0.1:8080/api/reset-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        setScore(data.score);
        setLives(data.lives);
        setCurrentQuestion(data.question);
        setCurrentOptions(data.options);
        clearTimer();
        setTimeLeft(5);
        startTimer();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="text-3xl font-bold mb-8">Time Left: {formatTime(timeLeft)}</div>
            <h2 className="text-2xl font-bold mb-8">{currentQuestion}</h2>
            <div className="flex space-x-8 mb-8">
                <h2 className="text-xl font-semibold">Score: {score}</h2>
                <h2 className="text-xl font-semibold">Lives: {lives}</h2>
            </div>
            <button onClick={resetGame} className="mb-8">Reset game</button>
            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                {Object.entries(currentOptions).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => submitAnswer(key)}
                        className="bg-blue-500 text-white text-2xl font-semibold py-6 rounded-lg hover:bg-blue-600 transition duration-300 w-full"
                    >
                        {value}
                    </button>
                ))}
            </div>
            {isStartModalOpen && <Modal onAction={startGame} actionText="Start Game">Welcome to the Math Game!</Modal>}
            {isGameOverModalOpen && <Modal onAction={handleResetGame} actionText="Reset Game">Game Over! Your Score: {score}</Modal>}
        </div>
    );
};

export default Game;