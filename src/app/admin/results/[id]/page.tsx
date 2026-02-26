'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Download, User, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import SpiderChart from '@/components/charts/SpiderChart';

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/attempts/${id}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchResult();
    }, [id]);

    const handleDownloadPDF = async () => {
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;
        const el = document.getElementById('result-pdf');
        if (!el) return;
        el.style.display = 'block';
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
        el.style.display = 'none';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
        pdf.save(`TestIQ_${data.attempt.userName?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-tertiary)' }}>Loading result...</p>
            </div>
        );
    }

    if (!data || !data.attempt) {
        return (
            <div style={{ padding: 60, textAlign: 'center' }}>
                <p style={{ fontWeight: 600 }}>Result not found</p>
                <Link href="/admin/results" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Results</Link>
            </div>
        );
    }

    const { attempt, answers, ethicsScores: scores } = data;
    const analysis = attempt.aiAnalysis || {};

    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <Link href="/admin/results" style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Back to Results
                    </Link>
                    <h1>{attempt.userName}&apos;s Result</h1>
                    <p>{attempt.testTitle} &middot; {attempt.userDept}</p>
                </div>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>
                    <Download size={16} /> Download PDF
                </button>
            </div>

            {/* Score Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="stat-card-header"><div className={`stat-card-icon ${(attempt.score || 0) >= 70 ? 'green' : 'orange'}`}><BarChart3 size={20} /></div></div>
                    <div className="stat-card-value" style={{ color: (attempt.score || 0) >= 70 ? 'var(--success)' : 'var(--danger)' }}>{Math.round(attempt.score || 0)}%</div>
                    <div className="stat-card-label">Overall Score</div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-card-header"><div className="stat-card-icon blue"><User size={20} /></div></div>
                    <div className="stat-card-value" style={{ fontSize: 18 }}>{attempt.userName}</div>
                    <div className="stat-card-label">{attempt.userDept}</div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-card-header"><div className="stat-card-icon purple"><CheckCircle2 size={20} /></div></div>
                    <div className="stat-card-value">{answers?.filter((a: any) => a.isCorrect).length}/{answers?.length}</div>
                    <div className="stat-card-label">Correct Answers</div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-card-header"><div className={`stat-card-icon ${analysis.riskLevel === 'low' ? 'green' : analysis.riskLevel === 'medium' ? 'orange' : 'purple'}`}><Clock size={20} /></div></div>
                    <div className="stat-card-value" style={{ textTransform: 'capitalize' }}>{analysis.riskLevel || '—'}</div>
                    <div className="stat-card-label">Risk Level</div>
                </motion.div>
            </div>

            {/* Spider Chart + AI Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {scores && (
                    <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <div className="chart-card-header">
                            <div className="chart-card-title">Ethics Profile</div>
                        </div>
                        <SpiderChart data={{ integrity: scores.integrity, fairness: scores.fairness, accountability: scores.accountability, transparency: scores.transparency, respect: scores.respect }} size={300} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                            {Object.entries({ integrity: scores.integrity, fairness: scores.fairness, accountability: scores.accountability, transparency: scores.transparency, respect: scores.respect }).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-xs)', fontSize: 13 }}>
                                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{k}</span>
                                    <span style={{ fontWeight: 700, color: (v as number) >= 70 ? 'var(--success)' : 'var(--danger)' }}>{Math.round(v as number)}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <div className="chart-card-header">
                        <div className="chart-card-title">AI Analysis</div>
                    </div>
                    {analysis.summary && (
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{analysis.summary}</p>
                    )}
                    {analysis.strengths && (
                        <div style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>✅ Strengths</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {analysis.strengths.map((s: string, i: number) => (
                                    <li key={i} style={{ fontSize: 13, color: '#065F46', padding: '6px 12px', background: 'var(--success-light)', borderRadius: 'var(--radius-xs)' }}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {analysis.improvements && (
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>⚠️ Areas for Improvement</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {analysis.improvements.map((s: string, i: number) => (
                                    <li key={i} style={{ fontSize: 13, color: '#92400E', padding: '6px 12px', background: 'var(--warning-light)', borderRadius: 'var(--radius-xs)' }}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Answer Breakdown */}
            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <div className="table-header">
                    <span className="table-title">Answer Breakdown</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Category</th>
                            <th>Answer</th>
                            <th>Correct</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answers?.map((ans: any, i: number) => (
                            <tr key={ans.id}>
                                <td>{i + 1}</td>
                                <td style={{ maxWidth: 300 }}>
                                    <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.5 }}>{ans.questionText}</div>
                                </td>
                                <td><span className="badge badge-primary">{ans.category}</span></td>
                                <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{ans.selectedAnswer}</td>
                                <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{ans.correctAnswer}</td>
                                <td>
                                    {ans.isCorrect ? (
                                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> Correct</span>
                                    ) : (
                                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> Wrong</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Hidden PDF Template */}
            <div id="result-pdf" style={{ display: 'none', width: 800, padding: 40, background: 'white', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>E</div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>TestIQ — Assessment Report</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>Generated on {new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                <hr style={{ borderColor: '#E2E8F0', margin: '16px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div><div style={{ fontSize: 11, color: '#94A3B8' }}>Employee</div><div style={{ fontWeight: 700 }}>{attempt.userName}</div></div>
                    <div><div style={{ fontSize: 11, color: '#94A3B8' }}>Department</div><div style={{ fontWeight: 700 }}>{attempt.userDept}</div></div>
                    <div><div style={{ fontSize: 11, color: '#94A3B8' }}>Test</div><div style={{ fontWeight: 700 }}>{attempt.testTitle}</div></div>
                    <div><div style={{ fontSize: 11, color: '#94A3B8' }}>Score</div><div style={{ fontWeight: 900, fontSize: 24, color: (attempt.score || 0) >= 70 ? '#10B981' : '#EF4444' }}>{Math.round(attempt.score || 0)}%</div></div>
                </div>
                {scores && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Ethics Dimensions</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
                            {Object.entries({ integrity: scores.integrity, fairness: scores.fairness, accountability: scores.accountability, transparency: scores.transparency, respect: scores.respect }).map(([k, v]) => (
                                <div key={k} style={{ padding: 10, background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'capitalize' }}>{k}</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: (v as number) >= 70 ? '#10B981' : '#EF4444' }}>{Math.round(v as number)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {analysis.summary && (
                    <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 6, fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                        <strong>AI Summary:</strong> {analysis.summary}
                    </div>
                )}
                <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>TestIQ — AI-Powered Test Taking Platform</div>
            </div>
        </div>
    );
}
