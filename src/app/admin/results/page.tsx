'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminResultsPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const res = await fetch('/api/attempts');
                if (res.ok) {
                    const data = await res.json();
                    setAttempts(data.attempts || []);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchAttempts();
    }, []);

    const filtered = attempts.filter(a =>
        (a.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.testTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.userDept || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <h1>Test Results</h1>
                <p>View all employee test submissions and detailed results</p>
            </div>

            <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 40, maxWidth: 400 }}
                        placeholder="Search by employee, test, or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--text-tertiary)' }}>Loading results...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600 }}>No test submissions yet</p>
                        <p style={{ fontSize: 13 }}>Results will appear here once employees complete their tests.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Test Name</th>
                                <th>Score</th>
                                <th>Result</th>
                                <th>Submitted</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((attempt, i) => (
                                <motion.tr
                                    key={attempt.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <td>
                                        <div className="table-user">
                                            <div className="table-user-avatar">{(attempt.userName || 'U').charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{attempt.userName}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{attempt.userDept || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{attempt.testTitle}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 80 }}>
                                                <div className="score-bar">
                                                    <div
                                                        className={`score-bar-fill ${(attempt.score || 0) >= 80 ? 'high' : (attempt.score || 0) >= 60 ? 'medium' : 'low'}`}
                                                        style={{ width: `${attempt.score || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{attempt.score != null ? `${Math.round(attempt.score)}%` : '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${(attempt.score || 0) >= 70 ? 'badge-success' : 'badge-danger'}`}>
                                            {(attempt.score || 0) >= 70 ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : '—'}
                                    </td>
                                    <td>
                                        <Link href={`/admin/results/${attempt.id}`} className="btn btn-primary btn-sm">
                                            <Eye size={14} /> View Details
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
}
