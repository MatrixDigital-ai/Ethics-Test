'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Users, FileText, TrendingUp, Plus, Eye, Trash2, Edit3, ChevronDown, ChevronUp, X, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTest, setExpandedTest] = useState<string | null>(null);
    const [testQuestions, setTestQuestions] = useState<Record<string, any[]>>({});
    const [editingTest, setEditingTest] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [deleting, setDeleting] = useState<string | null>(null);

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

    useEffect(() => { fetchData(); }, []);

    // Load questions for a test
    const loadQuestions = async (testId: string) => {
        if (testQuestions[testId]) return;
        try {
            const res = await fetch(`/api/tests/${testId}`);
            if (res.ok) {
                const data = await res.json();
                setTestQuestions(prev => ({ ...prev, [testId]: data.questions || [] }));
            }
        } catch (err) { console.error(err); }
    };

    const toggleExpand = (testId: string) => {
        if (expandedTest === testId) {
            setExpandedTest(null);
        } else {
            setExpandedTest(testId);
            loadQuestions(testId);
        }
    };

    // Delete a test
    const handleDeleteTest = async (testId: string) => {
        if (!confirm('Delete this test and ALL its submissions? This cannot be undone.')) return;
        setDeleting(testId);
        try {
            await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
            setTests(tests.filter(t => t.id !== testId));
            setAttempts(attempts.filter(a => a.testId !== testId));
        } catch (err) { console.error(err); }
        setDeleting(null);
    };

    // Edit a test
    const startEdit = (test: any) => {
        setEditingTest(test.id);
        setEditForm({ title: test.title, description: test.description, category: test.category, difficulty: test.difficulty, status: test.status });
    };

    const saveEdit = async (testId: string) => {
        try {
            await fetch(`/api/tests/${testId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            setTests(tests.map(t => t.id === testId ? { ...t, ...editForm } : t));
            setEditingTest(null);
        } catch (err) { console.error(err); }
    };

    // Delete a submission
    const handleDeleteAttempt = async (attemptId: string) => {
        if (!confirm('Delete this submission? This cannot be undone.')) return;
        try {
            await fetch(`/api/attempts/${attemptId}`, { method: 'DELETE' });
            setAttempts(attempts.filter(a => a.id !== attemptId));
        } catch (err) { console.error(err); }
    };

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
                    <p>Manage tests, view results, and control access</p>
                </div>
                <Link href="/admin/create-test" className="btn btn-primary">
                    <Plus size={16} /> Create New Test
                </Link>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="stat-card-header">
                            <div className={`stat-card-icon ${stat.color}`}><stat.icon size={20} /></div>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ═══ Tests List with expand/edit/delete ═══ */}
            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="table-header">
                    <span className="table-title">Your Tests</span>
                    <Link href="/admin/create-test" className="btn btn-ghost btn-sm">Create New →</Link>
                </div>
                {tests.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600 }}>No tests created yet</p>
                        <p style={{ fontSize: 13 }}>Click &ldquo;Create New Test&rdquo; to generate your first AI-powered test.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {tests.map((test: any) => {
                            const testAttemptCount = attempts.filter((a: any) => a.testId === test.id).length;
                            const isExpanded = expandedTest === test.id;
                            const isEditing = editingTest === test.id;
                            const qs = testQuestions[test.id] || [];

                            return (
                                <div key={test.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    {/* Test Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 16, cursor: 'pointer' }} onClick={() => !isEditing && toggleExpand(test.id)}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {isEditing ? (
                                                <input className="input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} onClick={e => e.stopPropagation()} style={{ fontWeight: 600, fontSize: 14, padding: '6px 10px' }} />
                                            ) : (
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{test.title}</div>
                                            )}
                                            <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 12 }}>
                                                <span className="badge badge-primary">{test.category}</span>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{test.totalQuestions} Q</span>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{testAttemptCount} submissions</span>
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                                                <select className="input" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: '6px 10px', fontSize: 12, width: 100 }}>
                                                    <option value="active">Active</option>
                                                    <option value="draft">Draft</option>
                                                </select>
                                                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(test.id)}><Save size={14} /> Save</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingTest(null)}><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                                                <span className={`badge ${test.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{test.status}</span>
                                                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(test)} title="Edit"><Edit3 size={14} /></button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteTest(test.id)} title="Delete" style={{ color: 'var(--danger)' }} disabled={deleting === test.id}>
                                                    <Trash2 size={14} />
                                                </button>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded: View Questions */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
                                            >
                                                <div style={{ padding: '16px 20px' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                                        Questions ({qs.length})
                                                    </div>
                                                    {qs.length === 0 ? (
                                                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Loading questions...</div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                            {qs.map((q: any, i: number) => {
                                                                const opts = Array.isArray(q.options) ? q.options : [];
                                                                return (
                                                                    <div key={q.id || i} style={{ padding: '12px 16px', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                                                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                                                            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{q.questionText}</span>
                                                                        </div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginLeft: 30 }}>
                                                                            {opts.map((opt: any) => (
                                                                                <div key={opt.id} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, background: opt.id === q.correctAnswer ? '#ECFDF5' : 'transparent', color: opt.id === q.correctAnswer ? '#059669' : 'var(--text-secondary)', fontWeight: opt.id === q.correctAnswer ? 600 : 400 }}>
                                                                                    {opt.id.toUpperCase()}. {opt.text} {opt.id === q.correctAnswer && '✓'}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* ═══ Recent Submissions with delete ═══ */}
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedAttempts.slice(0, 8).map((attempt: any) => (
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
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <Link href={`/admin/results/${attempt.id}`} className="btn btn-ghost btn-sm">
                                                <Eye size={14} /> View
                                            </Link>
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteAttempt(attempt.id)} title="Delete submission">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
