"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function Game() {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [timeLeft, setTimeLeft] = useState(5); // 60 seconds = 1 minute
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Store the timer ID

    const [isModalOpen, setIsModalOpen] = useState(false);

    interface ModalProps {
        score: number;
        onReset: () => void;
    }

    const Modal = ({ score, onReset }: ModalProps) => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-4 text-black">Game Over!</h2>
                    <p className="text-xl mb-6 text-black">Your Score: {score}</p>
                    <button
                        onClick={onReset}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Reset Game
                    </button>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (lives === 0 || timeLeft === 0) {
            setIsModalOpen(true); // Open the modal
            clearTimer(); // Stop the timer
        }
    }, [lives, timeLeft]);

    const handleResetGame = async () => {
        setIsModalOpen(false); // Close the modal
        await resetGame(); // Reset the game state and timer
    };

    // Start the countdown timer
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(timerRef.current!); // Stop the timer when it reaches 0
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    // Clear the existing timer
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
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return null;
        }
    };

    useEffect(() => {
        const initializeQuestions = async () => {
            const firstQuestion = await fetchQuestion();
            if (firstQuestion) {
                setCurrentQuestion(firstQuestion.question);
                setCurrentOptions(firstQuestion.options);
                setScore(firstQuestion.score);
                setLives(firstQuestion.lives);
            }
        };

        initializeQuestions()

        startTimer();
        return () => clearTimer();
    }, []);

    // Format the time as "mm:ss"
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const submitAnswer = async (key: string) => {
        const res = await fetch('http://127.0.0.1:8080/api/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer: key }),
        });
        const data = await res.json();
        setResponse(data.received_answer);

        // Update score and lives
        setScore(data.score);
        setLives(data.lives);

        // Update the current question and options with the next question
        if (data.next_question && data.next_options) {
            setCurrentQuestion(data.next_question);
            setCurrentOptions(data.next_options);
        }
    };

    const resetGame = async () => {
        const res = await fetch('http://127.0.0.1:8080/api/reset-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await res.json();
        setResponse(data.received_answer);

        // Update score and lives
        setScore(data.score);
        setLives(data.lives);

        // Update the current question and options with the next question
        if (data.question && data.options) {
            setCurrentQuestion(data.question);
            setCurrentOptions(data.options);
        }

        clearTimer();
        setTimeLeft(5);
        startTimer();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            {/* Timer Display */}
            <div className="text-3xl font-bold mb-8">
                Time Left: {formatTime(timeLeft)}
            </div>
            <h2 className="text-2xl font-bold mb-8">{currentQuestion}</h2>
            <div className="flex space-x-8 mb-8">
                <h2 className="text-xl font-semibold">Score: {score}</h2>
            </div>
            <div className="flex space-x-8 mb-8">
                <h2 className="text-xl font-semibold">Lives: {lives}</h2>
            </div>
            <button onClick={() => resetGame()}>Reset game</button>

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

            {/* Modal */}
            {isModalOpen && (
                <Modal score={score} onReset={handleResetGame} />
            )}
        </div>
    );
}