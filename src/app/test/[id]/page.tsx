'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Brain, ArrowRight, Sparkles, MessageSquare, GraduationCap } from 'lucide-react';
import Link from 'next/link';

function TestContent({ testId }: { testId: string }) {
    const { data: session } = useSession();
    const [phase, setPhase] = useState<'loading' | 'intro' | 'testing' | 'submitting' | 'submitted'>('loading');
    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [justifications, setJustifications] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const loadTest = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}`);
                if (!res.ok) { setError('Test not found'); return; }
                const data = await res.json();
                setTest(data.test);
                setQuestions(data.questions || []);
                setTimeLeft((data.test.timeLimit || 30) * 60);
                setPhase('intro');
            } catch (err) {
                setError('Failed to load test');
            }
        };
        loadTest();
    }, [testId]);

    useEffect(() => {
        if (phase !== 'testing') return;
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSelectAnswer = (optionId: string) => {
        setAnswers({ ...answers, [currentQ]: optionId });
    };

    const handleJustification = (text: string) => {
        setJustifications({ ...justifications, [currentQ]: text });
    };

    const handleSubmit = async () => {
        setPhase('submitting');
        setSubmitError('');
        try {
            const userId = (session?.user as any)?.id;
            if (!userId) {
                setSubmitError('You must be logged in to submit. Please refresh the page and log in again.');
                setPhase('testing');
                return;
            }

            const res = await fetch('/api/attempts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId,
                    userId,
                    answers: questions.map((q, i) => ({
                        selectedAnswer: answers[i] || '',
                        questionId: q.id,
                        justification: justifications[i] || '',
                    })),
                    timeTaken: ((test?.timeLimit || 30) * 60) - timeLeft,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setSubmitError(data.error || 'Submission failed. Please try again.');
                setPhase('testing');
                return;
            }

            setPhase('submitted');
        } catch (err: any) {
            console.error('Submit error:', err);
            setSubmitError(err.message || 'Submission failed. Please check your connection and try again.');
            setPhase('testing');
        }
    };

    if (phase === 'loading') {
        return (
            <div className="test-page"><div className="test-container"><div className="loading-screen">
                <div className="loading-spinner" />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>Loading test...</div>
            </div></div></div>
        );
    }

    if (error) {
        return (
            <div className="test-page"><div className="test-container">
                <div className="test-question-card" style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
                    <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Dashboard</Link>
                </div>
            </div></div>
        );
    }

    if (phase === 'intro') {
        return (
            <div className="test-page"><div className="test-container">
                <motion.div className="test-question-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
                        <GraduationCap size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{test?.title}</h1>
                    {test?.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{test.description}</p>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{questions.length}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Questions</div></div>
                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{test?.timeLimit || 30}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Minutes</div></div>
                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{test?.category}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Category</div></div>
                    </div>
                    <div style={{ padding: '10px 16px', background: '#EEF2FF', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#4338CA', marginBottom: 8, display: 'inline-block' }}>
                        💡 You can write a justification for each answer for a more detailed report.
                    </div>
                    <br />
                    <div style={{ padding: '10px 16px', background: 'var(--warning-light)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#92400E', marginBottom: 24, display: 'inline-block' }}>
                        ⚠️ Results are only visible to administrators. Each test can only be taken once.
                    </div>
                    <div><button className="btn btn-primary btn-lg" onClick={() => setPhase('testing')}>Begin Assessment <ArrowRight size={18} /></button></div>
                </motion.div>
            </div></div>
        );
    }

    if (phase === 'submitting') {
        return (
            <div className="test-page"><div className="test-container"><div className="loading-screen">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={36} className="animate-float" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="loading-spinner" />
                <div style={{ fontSize: 18, fontWeight: 700 }}>Analyzing Your Responses</div>
                <div className="loading-text">AI is generating a personalized cognitive analysis...</div>
            </div></div></div>
        );
    }

    if (phase === 'submitted') {
        return (
            <div className="test-page"><div className="test-container">
                <motion.div className="test-question-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '64px 40px' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                        <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                    </motion.div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Assessment Submitted!</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 12, maxWidth: 480, margin: '0 auto 12px', lineHeight: 1.7 }}>
                        Your responses and written justifications have been recorded. AI has generated a personalized cognitive analysis for review.
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                        Detailed results are only available to the admin team.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                        <div style={{ padding: '12px 20px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)' }}>
                                {Object.keys(answers).length} of {questions.length} answered &middot; {Object.values(justifications).filter(j => j.trim()).length} justifications written
                            </span>
                        </div>
                        <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>Return to Dashboard <ArrowRight size={18} /></Link>
                    </div>
                </motion.div>
            </div></div>
        );
    }

    // ═══ TESTING PHASE ═══
    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const options = Array.isArray(question?.options) ? question.options : [];

    return (
        <div className="test-page">
            <div className="test-container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }}>← Exit Test</Link>
                    <div className="test-timer">
                        <Clock size={16} style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-secondary)' }} />
                        <span style={{ color: timeLeft < 300 ? 'var(--danger)' : undefined }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="test-progress">
                    <div className="test-progress-bar">
                        <motion.div className="test-progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <div className="test-progress-text">{currentQ + 1}/{questions.length}</div>
                </div>

                {submitError && (
                    <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>⚠️</span>
                        <span>{submitError}</span>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div key={currentQ} className="test-question-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                            <span className="badge badge-primary">{question?.category}</span>
                            <span className="badge badge-info">Question {currentQ + 1}</span>
                        </div>
                        {question?.scenario && (
                            <div className="test-scenario"><strong>Scenario:</strong> {question.scenario}</div>
                        )}
                        <div className="test-question-text">{question?.questionText}</div>
                        <div className="test-options">
                            {options.map((opt: any) => (
                                <motion.div key={opt.id} className={`test-option ${answers[currentQ] === opt.id ? 'selected' : ''}`} onClick={() => handleSelectAnswer(opt.id)} whileTap={{ scale: 0.99 }}>
                                    <div className="test-option-radio" />
                                    <div className="test-option-label">
                                        <span className="test-option-id">{opt.id.toUpperCase()}.</span>
                                        {opt.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Written Justification */}
                        {answers[currentQ] && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Why did you choose this answer? <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional, helps generate a better report)</span>
                                    </label>
                                </div>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Explain your reasoning..."
                                    value={justifications[currentQ] || ''}
                                    onChange={(e) => handleJustification(e.target.value)}
                                    style={{ fontSize: 13, resize: 'vertical', lineHeight: 1.6 }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="test-nav">
                    <button className="btn btn-secondary" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                        <ChevronLeft size={16} /> Previous
                    </button>
                    {currentQ === questions.length - 1 ? (
                        <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                            <CheckCircle2 size={18} /> Submit Assessment
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={!answers[currentQ]}>
                            Next <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <SessionProvider>
            <TestContent testId={id} />
        </SessionProvider>
    );
}
