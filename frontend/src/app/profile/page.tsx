"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
    const { data: session } = useSession();
    const username = session?.user?.name;

    const [personalBest, setPersonalBest] = useState<number | null>(null);
    const [scores, setScores] = useState<{ score: number; created_at: string }[]>([]);
    const [timeRange, setTimeRange] = useState<string>('lifetime');

    // Format date to dd/mm/yyyy hh:mm
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    useEffect(() => {
        if (!username) return;

        fetch(`http://127.0.0.1:8080/api/get-personal-best?username=${username}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.best_score) {
                    setPersonalBest(data.best_score);
                }
            })
            .catch((err) => console.error('Error fetching personal best:', err));

        fetchScores(timeRange);
    }, [username, timeRange]);

    const fetchScores = (range: string) => {
        fetch(`http://127.0.0.1:8080/api/get-scores?username=${username}&time_range=${range}`)
            .then((res) => res.json())
            .then((data) => {
                setScores(data);
            })
            .catch((err) => console.error('Error fetching scores:', err));
    };

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
        fetchScores(range);
    };

    const formattedScores = scores.map((score) => ({
        ...score,
        formattedDate: formatDate(score.created_at),
    }));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <Link href={"/"}>
                <button className="absolute top-8 left-8 bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300">Back</button>
            </Link>
            <h1 className="text-3xl font-bold mb-8">{username}'s Profile</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-black">Personal Best: {personalBest ?? 'N/A'}</h2>
                <div className="mb-8">
                    <label className="mr-4 text-black">Time Range:</label>
                    <select
                        value={timeRange}
                        onChange={(e) => handleTimeRangeChange(e.target.value)}
                        className="p-2 border rounded text-black"
                    >
                        <option value="today">Today</option>
                        <option value="last_3_days">Last 3 Days</option>
                        <option value="last_week">Last Week</option>
                        <option value="last_month">Last Month</option>
                        <option value="last_year">Last Year</option>
                        <option value="lifetime">Lifetime</option>
                    </select>
                </div>
                <div className="w-full h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedScores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="formattedDate" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;