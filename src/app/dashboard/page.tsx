'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ClipboardList, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function EmployeeDashboardPage() {
    const { data: session } = useSession();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await fetch('/api/tests');
                if (res.ok) {
                    const data = await res.json();
                    // Only show active/published tests
                    setTests((data.tests || []).filter((t: any) => t.status === 'active'));
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchTests();
    }, []);

    const getDifficultyBadge = (d: string) => {
        if (d === 'Easy') return 'badge-success';
        if (d === 'Medium') return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div>
            <div className="page-header">
                <h1>Welcome{session?.user?.name ? `, ${session.user.name}` : ''}</h1>
                <p>Select a test to begin</p>
            </div>

            {/* Info Banner */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--primary-50)', border: '1px solid var(--primary-200)', marginBottom: 28 }}
            >
                <Shield size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: 'var(--primary-dark)' }}>
                    <strong>Note:</strong> Your results are reviewed by the administration. You will not see your scores after submission.
                </div>
            </motion.div>

            {/* Tests Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-tertiary)' }}>Loading available tests...</p>
                </div>
            ) : tests.length === 0 ? (
                <motion.div
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: 60, textAlign: 'center' }}
                >
                    <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Tests Available</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
                        There are no published tests at the moment. Your administrator will notify you when a new assessment is available.
                    </p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {tests.map((test, i) => (
                        <motion.div
                            key={test.id}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span className="badge badge-primary">{test.category}</span>
                                <span className={`badge ${getDifficultyBadge(test.difficulty)}`}>{test.difficulty}</span>
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{test.title}</h3>
                            {test.description && (
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{test.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ClipboardList size={14} /> {test.totalQuestions} Questions
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={14} /> {test.timeLimit || 30} min
                                </span>
                            </div>
                            <Link href={`/test/${test.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                                Start Test <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
