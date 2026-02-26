'use client';

import { useState, useEffect, use, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Download, User, Clock, BarChart3, MessageSquare, Brain, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import SpiderChart from '@/components/charts/SpiderChart';

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/attempts/${id}`);
                if (res.ok) setData(await res.json());
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchResult();
    }, [id]);

    const handleDownloadPDF = async () => {
        const jsPDF = (await import('jspdf')).default;

        const { attempt, answers, ethicsScores: scores } = data;
        const analysis = attempt.aiAnalysis || {};
        const perQ = analysis.perQuestionAnalysis || [];

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 16;
        const contentW = pageW - margin * 2;
        let y = margin;

        const checkPage = (needed: number) => {
            if (y + needed > pageH - margin) {
                pdf.addPage();
                y = margin;
            }
        };

        // ─── Page 1: Header + Overview ───
        pdf.setFillColor(99, 102, 241);
        pdf.rect(0, 0, pageW, 36, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TestIQ — Assessment Report', margin, 18);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${new Date().toLocaleDateString()} • Confidential`, margin, 28);
        y = 46;

        // Candidate Info
        pdf.setTextColor(51, 51, 51);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const infoItems = [
            ['Candidate', attempt.userName || '—'],
            ['Department', attempt.userDept || '—'],
            ['Test', attempt.testTitle || '—'],
            ['Date', attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '—'],
        ];
        const colW = contentW / 4;
        infoItems.forEach(([label, value], i) => {
            const x = margin + i * colW;
            pdf.setTextColor(148, 163, 184);
            pdf.text(label, x, y);
            pdf.setTextColor(15, 23, 42);
            pdf.setFont('helvetica', 'bold');
            pdf.text(value, x, y + 5);
            pdf.setFont('helvetica', 'normal');
        });
        y += 16;

        // Score Box
        const scoreColor = (attempt.score || 0) >= 70 ? [16, 185, 129] : [239, 68, 68];
        pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.roundedRect(margin, y, 40, 20, 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${Math.round(attempt.score || 0)}%`, margin + 20, y + 13, { align: 'center' });

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(11);
        pdf.text(`${answers?.filter((a: any) => a.isCorrect).length || 0} of ${answers?.length || 0} correct`, margin + 48, y + 8);
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Risk Level: ${(analysis.riskLevel || '—').toUpperCase()}`, margin + 48, y + 15);
        y += 30;

        // Category Scores
        if (scores) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(15, 23, 42);
            pdf.text('Dimension Scores', margin, y);
            y += 8;
            const dims = Object.entries({ Integrity: scores.integrity, Fairness: scores.fairness, Accountability: scores.accountability, Transparency: scores.transparency, Respect: scores.respect });
            const dimW = contentW / dims.length;
            dims.forEach(([k, v], i) => {
                const x = margin + i * dimW;
                const val = Math.round(v as number);
                const barColor = val >= 70 ? [16, 185, 129] : val >= 50 ? [245, 158, 11] : [239, 68, 68];
                pdf.setFillColor(241, 245, 249);
                pdf.roundedRect(x, y, dimW - 4, 18, 2, 2, 'F');
                pdf.setFontSize(8);
                pdf.setTextColor(107, 114, 128);
                pdf.text(k, x + (dimW - 4) / 2, y + 6, { align: 'center' });
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(barColor[0], barColor[1], barColor[2]);
                pdf.text(`${val}%`, x + (dimW - 4) / 2, y + 14, { align: 'center' });
                pdf.setFont('helvetica', 'normal');
            });
            y += 26;
        }

        // AI Summary & Cognitive Profile
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y, pageW - margin, y);
        y += 8;

        if (analysis.summary) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(15, 23, 42);
            pdf.text('AI Summary', margin, y);
            y += 6;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(71, 85, 105);
            const summaryLines = pdf.splitTextToSize(analysis.summary, contentW);
            pdf.text(summaryLines, margin, y);
            y += summaryLines.length * 4.5 + 6;
        }

        if (analysis.cognitiveProfile) {
            checkPage(30);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(15, 23, 42);
            pdf.text('Cognitive Profile', margin, y);
            y += 6;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(71, 85, 105);
            const profLines = pdf.splitTextToSize(analysis.cognitiveProfile, contentW);
            pdf.text(profLines, margin, y);
            y += profLines.length * 4.5 + 6;
        }

        // Strengths & Improvements
        if (analysis.strengths || analysis.improvements) {
            checkPage(40);
            const halfW = contentW / 2 - 4;

            if (analysis.strengths) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(6, 95, 70);
                pdf.text('✓ Strengths', margin, y);
                let sy = y + 5;
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                analysis.strengths.forEach((s: string) => {
                    const lines = pdf.splitTextToSize(`• ${s}`, halfW);
                    pdf.text(lines, margin, sy);
                    sy += lines.length * 4 + 2;
                });
            }

            if (analysis.improvements) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(146, 64, 14);
                pdf.text('⚠ Areas for Improvement', margin + halfW + 8, y);
                let iy = y + 5;
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(146, 64, 14);
                analysis.improvements.forEach((s: string) => {
                    const lines = pdf.splitTextToSize(`• ${s}`, halfW);
                    pdf.text(lines, margin + halfW + 8, iy);
                    iy += lines.length * 4 + 2;
                });
            }
            y += 36;
        }

        // ─── Per-Question Detailed Breakdown ───
        checkPage(20);
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y, pageW - margin, y);
        y += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text('Detailed Question Analysis', margin, y);
        y += 8;

        answers?.forEach((ans: any, i: number) => {
            const qAnalysis = perQ.find((p: any) => p.questionNumber === i + 1);
            const opts = Array.isArray(ans.options) ? ans.options : [];
            const selectedText = opts.find((o: any) => o.id === ans.selectedAnswer)?.text || ans.selectedAnswer;
            const correctText = opts.find((o: any) => o.id === ans.correctAnswer)?.text || ans.correctAnswer;

            // Estimate height needed
            const qLines = pdf.splitTextToSize(ans.questionText, contentW - 20);
            let neededH = 28 + qLines.length * 4;
            if (ans.justification) neededH += 14;
            if (qAnalysis?.feedback) neededH += 10;
            checkPage(neededH);

            // Question card background
            const cardColor = ans.isCorrect ? [236, 253, 245] : [254, 242, 242];
            pdf.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
            pdf.roundedRect(margin, y, contentW, neededH, 2, 2, 'F');

            // Number badge
            const badgeColor = ans.isCorrect ? [16, 185, 129] : [239, 68, 68];
            pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
            pdf.circle(margin + 8, y + 6, 4, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${i + 1}`, margin + 8, y + 7.5, { align: 'center' });

            // Question text
            pdf.setTextColor(15, 23, 42);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text(qLines, margin + 16, y + 7);
            let qy = y + 7 + qLines.length * 4 + 2;

            // Selected vs Correct
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            if (ans.isCorrect) {
                pdf.setTextColor(6, 95, 70);
                pdf.text(`✓ Selected: ${ans.selectedAnswer.toUpperCase()} — ${selectedText}`, margin + 16, qy);
            } else {
                pdf.setTextColor(220, 38, 38);
                pdf.text(`✗ Selected: ${ans.selectedAnswer.toUpperCase()} — ${selectedText}`, margin + 16, qy);
                qy += 4.5;
                pdf.setTextColor(6, 95, 70);
                pdf.text(`✓ Correct: ${ans.correctAnswer.toUpperCase()} — ${correctText}`, margin + 16, qy);
            }
            qy += 5;

            // User justification
            if (ans.justification) {
                pdf.setTextColor(79, 70, 229);
                pdf.setFont('helvetica', 'italic');
                const justLines = pdf.splitTextToSize(`"${ans.justification}"`, contentW - 24);
                pdf.text(justLines, margin + 16, qy);
                qy += justLines.length * 4 + 2;
            }

            // AI per-question feedback
            if (qAnalysis?.feedback) {
                pdf.setTextColor(107, 114, 128);
                pdf.setFont('helvetica', 'normal');
                const fbLines = pdf.splitTextToSize(`AI: ${qAnalysis.feedback}`, contentW - 24);
                pdf.text(fbLines, margin + 16, qy);
                qy += fbLines.length * 4;
            }

            y += neededH + 4;
        });

        // Footer
        checkPage(10);
        y += 6;
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y, pageW - margin, y);
        y += 6;
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        pdf.text('TestIQ — AI-Powered Test Taking Platform • Confidential Report', pageW / 2, y, { align: 'center' });

        pdf.save(`TestIQ_${attempt.userName?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
    const perQ = analysis.perQuestionAnalysis || [];

    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <Link href="/admin/results" style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Back to Results
                    </Link>
                    <h1>{attempt.userName}&apos;s Report</h1>
                    <p>{attempt.testTitle} &middot; {attempt.userDept}</p>
                </div>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>
                    <Download size={16} /> Download Full PDF
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
                    <div className="stat-card-header"><div className={`stat-card-icon ${analysis.riskLevel === 'low' ? 'green' : analysis.riskLevel === 'medium' ? 'orange' : 'purple'}`}><AlertTriangle size={20} /></div></div>
                    <div className="stat-card-value" style={{ textTransform: 'capitalize' }}>{analysis.riskLevel || '—'}</div>
                    <div className="stat-card-label">Risk Level</div>
                </motion.div>
            </div>

            {/* Spider Chart + AI Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {scores && (
                    <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <div className="chart-card-header"><div className="chart-card-title">Performance Profile</div></div>
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
                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="chart-card-header"><div className="chart-card-title">AI Analysis</div></div>
                    {analysis.summary && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.summary}</p>}

                    {/* Cognitive Profile */}
                    {analysis.cognitiveProfile && (
                        <div style={{ padding: '12px 16px', background: '#EEF2FF', borderRadius: 'var(--radius-sm)', border: '1px solid #C7D2FE' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#4338CA', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Brain size={14} /> Cognitive Profile
                            </div>
                            <p style={{ fontSize: 13, color: '#3730A3', lineHeight: 1.6 }}>{analysis.cognitiveProfile}</p>
                        </div>
                    )}

                    {analysis.strengths && (
                        <div>
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

            {/* ═══ Per-Question Detailed Breakdown ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Detailed Question Analysis</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {answers?.map((ans: any, i: number) => {
                        const opts = Array.isArray(ans.options) ? ans.options : [];
                        const selectedText = opts.find((o: any) => o.id === ans.selectedAnswer)?.text || '';
                        const correctText = opts.find((o: any) => o.id === ans.correctAnswer)?.text || '';
                        const qAnalysis = perQ.find((p: any) => p.questionNumber === i + 1);

                        return (
                            <div key={ans.id} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${ans.isCorrect ? '#A7F3D0' : '#FECACA'}` }}>
                                {/* Question header */}
                                <div style={{ padding: '14px 20px', background: ans.isCorrect ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: ans.isCorrect ? 'var(--success)' : 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>{ans.questionText}</div>
                                        <span className="badge badge-primary" style={{ marginTop: 4, fontSize: 10 }}>{ans.category}</span>
                                    </div>
                                    {ans.isCorrect ? (
                                        <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                    ) : (
                                        <XCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                                    )}
                                </div>

                                {/* Answer details */}
                                <div style={{ padding: '14px 20px' }}>
                                    {/* Options with highlighting */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                        {opts.map((opt: any) => {
                                            const isSelected = opt.id === ans.selectedAnswer;
                                            const isCorrectOpt = opt.id === ans.correctAnswer;
                                            let bg = 'var(--bg)';
                                            let border = 'var(--border)';
                                            let color = 'var(--text-primary)';
                                            let icon = null;
                                            if (isCorrectOpt) { bg = '#ECFDF5'; border = '#A7F3D0'; color = '#059669'; icon = <CheckCircle2 size={14} style={{ color: '#059669' }} />; }
                                            if (isSelected && !ans.isCorrect) { bg = '#FEF2F2'; border = '#FECACA'; color = '#DC2626'; icon = <XCircle size={14} style={{ color: '#DC2626' }} />; }
                                            if (isSelected && ans.isCorrect) { bg = '#ECFDF5'; border = '#A7F3D0'; color = '#059669'; icon = <CheckCircle2 size={14} style={{ color: '#059669' }} />; }

                                            return (
                                                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-xs)', background: bg, border: `1px solid ${border}`, fontSize: 13, color }}>
                                                    <span style={{ fontWeight: 700, width: 20 }}>{opt.id.toUpperCase()}.</span>
                                                    <span style={{ flex: 1 }}>{opt.text}</span>
                                                    {icon}
                                                    {isSelected && <span style={{ fontSize: 10, fontWeight: 600 }}>YOUR ANSWER</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* User's written justification */}
                                    {ans.justification && (
                                        <div style={{ padding: '10px 14px', background: '#EEF2FF', borderRadius: 'var(--radius-sm)', border: '1px solid #C7D2FE', marginBottom: 10 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#4338CA', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <MessageSquare size={12} /> Candidate&apos;s Reasoning
                                            </div>
                                            <p style={{ fontSize: 13, color: '#3730A3', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{ans.justification}&rdquo;</p>
                                        </div>
                                    )}

                                    {/* Correct answer explanation */}
                                    {ans.explanation && (
                                        <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0', marginBottom: 10 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>📖 Explanation</div>
                                            <p style={{ fontSize: 13, color: '#065F46', lineHeight: 1.6 }}>{ans.explanation}</p>
                                        </div>
                                    )}

                                    {/* AI per-question feedback */}
                                    {qAnalysis?.feedback && (
                                        <div style={{ padding: '10px 14px', background: '#FFF7ED', borderRadius: 'var(--radius-sm)', border: '1px solid #FED7AA' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Brain size={12} /> AI Feedback
                                            </div>
                                            <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>{qAnalysis.feedback}</p>
                                            {qAnalysis.recommendedReading && (
                                                <div style={{ fontSize: 12, color: '#92400E', marginTop: 6, fontStyle: 'italic' }}>
                                                    📚 {qAnalysis.recommendedReading}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
