'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Users, FileText, TrendingUp, Plus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testsRes, attemptsRes] = await Promise.all([
                    fetch('/api/tests'),
                    fetch('/api/attempts'),
                ]);
                if (testsRes.ok) {
                    const data = await testsRes.json();
                    setTests(data.tests || []);
                }
                if (attemptsRes.ok) {
                    const data = await attemptsRes.json();
                    setAttempts(data.attempts || []);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const avgScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAttempts.length)
        : 0;

    const stats = [
        { icon: ClipboardList, label: 'Total Tests', value: tests.length, color: 'purple' },
        { icon: Users, label: 'Submissions', value: completedAttempts.length, color: 'blue' },
        { icon: TrendingUp, label: 'Avg Score', value: avgScore > 0 ? `${avgScore}%` : '—', color: 'green' },
        { icon: FileText, label: 'Active Tests', value: tests.filter((t: any) => t.status === 'active').length, color: 'orange' },
    ];

    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage ethics tests and view employee results</p>
                </div>
                <Link href="/admin/create-test" className="btn btn-primary">
                    <Plus size={16} /> Create New Test
                </Link>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="stat-card-header">
                            <div className={`stat-card-icon ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tests List */}
            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="table-header">
                    <span className="table-title">Your Tests</span>
                    <Link href="/admin/create-test" className="btn btn-ghost btn-sm">Create New →</Link>
                </div>
                {tests.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600 }}>No tests created yet</p>
                        <p style={{ fontSize: 13 }}>Click &ldquo;Create New Test&rdquo; to generate your first AI-powered ethics test.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Category</th>
                                <th>Questions</th>
                                <th>Submissions</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map((test: any) => {
                                const testAttemptCount = attempts.filter((a: any) => a.testId === test.id).length;
                                return (
                                    <tr key={test.id}>
                                        <td style={{ fontWeight: 600 }}>{test.title}</td>
                                        <td><span className="badge badge-primary">{test.category}</span></td>
                                        <td>{test.totalQuestions}</td>
                                        <td style={{ fontWeight: 600 }}>{testAttemptCount}</td>
                                        <td>
                                            <span className={`badge ${test.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                            {new Date(test.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Recent Submissions */}
            {completedAttempts.length > 0 && (
                <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 24 }}>
                    <div className="table-header">
                        <span className="table-title">Recent Submissions</span>
                        <Link href="/admin/results" className="btn btn-ghost btn-sm">View All →</Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Test</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedAttempts.slice(0, 5).map((attempt: any) => (
                                <tr key={attempt.id}>
                                    <td>
                                        <div className="table-user">
                                            <div className="table-user-avatar">{(attempt.userName || 'U').charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{attempt.userName}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{attempt.userDept}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{attempt.testTitle}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: (attempt.score || 0) >= 70 ? 'var(--success)' : 'var(--danger)' }}>
                                            {attempt.score != null ? `${Math.round(attempt.score)}%` : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${(attempt.score || 0) >= 70 ? 'badge-success' : 'badge-danger'}`}>
                                            {(attempt.score || 0) >= 70 ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td>
                                        <Link href={`/admin/results/${attempt.id}`} className="btn btn-ghost btn-sm">
                                            <Eye size={14} /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
}
