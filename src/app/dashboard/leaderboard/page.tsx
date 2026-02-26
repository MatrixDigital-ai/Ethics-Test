'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Shield } from 'lucide-react';

const DEMO_LEADERBOARD = [
    { rank: 1, name: 'Grace Kim', department: 'Operations', avgScore: 94, testsCompleted: 6, trend: '+3%' },
    { rank: 2, name: 'Carol Davis', department: 'HR', avgScore: 91, testsCompleted: 5, trend: '+5%' },
    { rank: 3, name: 'Eva Martinez', department: 'Finance', avgScore: 88, testsCompleted: 4, trend: '+2%' },
    { rank: 4, name: 'Alice Johnson', department: 'Engineering', avgScore: 85, testsCompleted: 4, trend: '+1%' },
    { rank: 5, name: 'Sophia Chen', department: 'Legal', avgScore: 83, testsCompleted: 3, trend: '+4%' },
    { rank: 6, name: 'Frank Lee', department: 'Engineering', avgScore: 79, testsCompleted: 3, trend: '-2%' },
    { rank: 7, name: 'James Park', department: 'Operations', avgScore: 77, testsCompleted: 4, trend: '+1%' },
    { rank: 8, name: 'Bob Smith', department: 'Marketing', avgScore: 72, testsCompleted: 3, trend: '+6%' },
    { rank: 9, name: 'Derek Wilson', department: 'Sales', avgScore: 63, testsCompleted: 2, trend: '-1%' },
    { rank: 10, name: 'Henry Brown', department: 'Sales', avgScore: 55, testsCompleted: 2, trend: '-5%' },
];

export default function LeaderboardPage() {
    const [leaderboard] = useState(DEMO_LEADERBOARD);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={20} style={{ color: '#F59E0B' }} />;
        if (rank === 2) return <Medal size={20} style={{ color: '#94A3B8' }} />;
        if (rank === 3) return <Medal size={20} style={{ color: '#B45309' }} />;
        return <span style={{ fontWeight: 700, color: 'var(--text-tertiary)' }}>#{rank}</span>;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Trophy size={28} style={{ color: '#F59E0B' }} /> Leaderboard
                </h1>
                <p>Top performers in ethics assessments</p>
            </div>

            {/* Top 3 Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40 }}>
                {[1, 0, 2].map((idx) => {
                    const person = leaderboard[idx];
                    const isFirst = idx === 0;
                    return (
                        <motion.div
                            key={person.rank}
                            className="card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            style={{
                                textAlign: 'center',
                                padding: '32px 28px',
                                minWidth: 200,
                                transform: isFirst ? 'scale(1.05)' : undefined,
                                border: isFirst ? '2px solid var(--primary-200)' : undefined,
                                background: isFirst ? 'linear-gradient(180deg, var(--primary-50), white)' : undefined,
                            }}
                        >
                            <div style={{ marginBottom: 12 }}>{getRankIcon(person.rank)}</div>
                            <div className="table-user-avatar" style={{ width: 56, height: 56, fontSize: 20, margin: '0 auto 12px', background: isFirst ? 'linear-gradient(135deg, var(--primary), var(--accent))' : undefined }}>
                                {person.name.charAt(0)}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{person.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>{person.department}</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: getScoreColor(person.avgScore) }}>{person.avgScore}%</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{person.testsCompleted} tests</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Full Leaderboard Table */}
            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="table-header">
                    <span className="table-title">Complete Rankings</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Average Score</th>
                            <th>Tests</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((person, i) => (
                            <motion.tr
                                key={person.rank}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                            >
                                <td style={{ width: 60 }}>{getRankIcon(person.rank)}</td>
                                <td>
                                    <div className="table-user">
                                        <div className="table-user-avatar">{person.name.charAt(0)}</div>
                                        <span style={{ fontWeight: 600 }}>{person.name}</span>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{person.department}</span></td>
                                <td>
                                    <span style={{ fontWeight: 700, color: getScoreColor(person.avgScore) }}>{person.avgScore}%</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{person.testsCompleted}</td>
                                <td>
                                    <span style={{ color: person.trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <TrendingUp size={14} /> {person.trend}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
