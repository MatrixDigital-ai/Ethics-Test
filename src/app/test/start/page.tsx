'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Shield, Brain, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Demo questions for when API isn't connected
const DEMO_QUESTIONS = [
    {
        questionText: 'How should you handle discovering that a colleague is falsifying expense reports?',
        scenario: 'You notice that a colleague in your team has been submitting expense reports for client dinners that never took place. The amounts are small but consistent. This colleague is also a close friend who helped you during your onboarding.',
        options: [
            { id: 'a', text: 'Report the issue to your manager or ethics committee immediately, regardless of personal relationships' },
            { id: 'b', text: 'Ignore it since the amounts are small and don\'t significantly impact the company' },
            { id: 'c', text: 'Confront your colleague privately and give them a chance to stop and self-report' },
            { id: 'd', text: 'Start documenting the behavior but wait to see if it escalates before taking action' },
        ],
        correctAnswer: 'a',
        category: 'Integrity',
        explanation: 'Reporting unethical behavior immediately upholds organizational integrity regardless of personal relationships.',
    },
    {
        questionText: 'Your team lead assigns a critical project to a less-qualified person over a more qualified candidate from a different background. What do you do?',
        scenario: 'A high-visibility project needs a lead developer. Your team lead assigns it to their close friend despite another team member having significantly more relevant experience and qualifications. The overlooked person is from a different cultural background.',
        options: [
            { id: 'a', text: 'Say nothing as it\'s the team lead\'s decision to make' },
            { id: 'b', text: 'Raise the concern with the team lead, focusing on qualifications and fair selection criteria' },
            { id: 'c', text: 'Gossip about the unfair decision with other colleagues to build support' },
            { id: 'd', text: 'Alert HR about potential bias and request a transparent selection process' },
        ],
        correctAnswer: 'b',
        category: 'Fairness',
        explanation: 'Directly addressing the concern with evidence-based reasoning promotes fairness while maintaining professional relationships.',
    },
    {
        questionText: 'A software bug you introduced causes a significant data issue. The bug has not been traced to you yet. What is the most ethical course of action?',
        scenario: 'During a routine deployment, a bug in your code caused several hundred customer records to display incorrect billing information. The QA team is investigating but hasn\'t identified the source. Your manager is under pressure from executives to find the cause.',
        options: [
            { id: 'a', text: 'Wait for the investigation to run its course — they\'ll find it eventually' },
            { id: 'b', text: 'Immediately take responsibility, explain what happened, and propose a fix' },
            { id: 'c', text: 'Quietly fix the bug in the next update without drawing attention to your mistake' },
            { id: 'd', text: 'Suggest that the bug might be in a different area to divert attention' },
        ],
        correctAnswer: 'b',
        category: 'Accountability',
        explanation: 'Taking immediate responsibility, explaining what happened, and proposing solutions demonstrates true accountability.',
    },
    {
        questionText: 'Your company is about to make changes that will negatively affect employees. You have inside knowledge. What should you do?',
        scenario: 'You overheard in a leadership meeting that the company plans to restructure your department, which will result in layoffs next month. Several colleagues have been asking you about the department\'s stability as they are making financial decisions.',
        options: [
            { id: 'a', text: 'Share the information freely with all affected colleagues so they can prepare' },
            { id: 'b', text: 'Keep the information confidential but advocate to leadership for transparent communication' },
            { id: 'c', text: 'Deny any knowledge when asked directly by colleagues' },
            { id: 'd', text: 'Use the information to secure your own position before others find out' },
        ],
        correctAnswer: 'b',
        category: 'Transparency',
        explanation: 'Respecting confidentiality while advocating for transparent communication balances ethical obligations.',
    },
    {
        questionText: 'A new team member makes a suggestion during a meeting that is dismissed. You think the idea has merit. How do you respond?',
        scenario: 'During a team meeting, a recently hired junior developer proposes an alternative approach to a technical problem. The senior developers quickly dismiss the idea without consideration. You recognize that the suggestion actually addresses a real pain point.',
        options: [
            { id: 'a', text: 'Stay silent to avoid contradicting the senior developers' },
            { id: 'b', text: 'Bring up the idea in a private conversation with the senior developers later' },
            { id: 'c', text: 'Speak up in the meeting to acknowledge the idea and suggest giving it fair consideration' },
            { id: 'd', text: 'Take the idea and present it as your own in a future meeting' },
        ],
        correctAnswer: 'c',
        category: 'Respect',
        explanation: 'Speaking up to acknowledge someone\'s contribution in front of the group shows respect and creates an inclusive environment.',
    },
];

type Phase = 'intro' | 'testing' | 'evaluating' | 'submitted';

export default function TestStartPage() {
    const [phase, setPhase] = useState<Phase>('intro');
    const [questions] = useState(DEMO_QUESTIONS);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min

    // Timer
    useEffect(() => {
        if (phase !== 'testing') return;
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    handleSubmit();
                    return 0;
                }
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

    const handleSubmit = async () => {
        setPhase('evaluating');

        // Send answers to backend for admin to review later
        try {
            await fetch('/api/ai/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: questions.map((q, i) => ({ selectedAnswer: answers[i] || '', questionId: i })),
                    questions,
                }),
            });
        } catch {
            // Silently fail - results are stored for admin
        }

        // Employee just sees a "submitted" confirmation — NO results shown
        setTimeout(() => {
            setPhase('submitted');
        }, 2000);
    };

    // ─── INTRO SCREEN ───
    if (phase === 'intro') {
        return (
            <div className="test-page">
                <div className="test-container">
                    <motion.div
                        className="test-question-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '60px 40px' }}
                    >
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
                            <Shield size={36} color="white" />
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Assessment</h1>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                            You will be presented with {questions.length} real-world ethical scenarios. Take your time to consider each situation carefully. Your results will be reviewed by the administration.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 40 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{questions.length}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Questions</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>30</div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Minutes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>5</div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Dimensions</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px 20px', background: 'var(--warning-light)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#92400E', marginBottom: 28, display: 'inline-block' }}>
                            ⚠️ Results are only visible to administrators. You will not see your score after submission.
                        </div>
                        <div>
                            <button className="btn btn-primary btn-lg" onClick={() => setPhase('testing')}>
                                Begin Assessment <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── EVALUATING SCREEN ───
    if (phase === 'evaluating') {
        return (
            <div className="test-page">
                <div className="test-container">
                    <div className="loading-screen">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Brain size={36} className="animate-float" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="loading-spinner" />
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Submitting Your Responses</div>
                        <div className="loading-text">Processing your assessment...</div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SUBMITTED SUCCESS SCREEN (No Results for Employees) ───
    if (phase === 'submitted') {
        return (
            <div className="test-page">
                <div className="test-container">
                    <motion.div
                        className="test-question-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '64px 40px' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}
                        >
                            <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                        </motion.div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
                            Assessment Submitted Successfully!
                        </h1>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 12, maxWidth: 480, margin: '0 auto 12px', lineHeight: 1.7 }}>
                            Thank you for completing the assessment. Your responses have been recorded and will be reviewed by the administration team.
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                            You will not be able to view your results. Your manager or HR representative will follow up if needed.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                            <div style={{ padding: '16px 24px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)' }}>
                                    {Object.keys(answers).length} of {questions.length} questions answered
                                </span>
                            </div>

                            <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
                                Return to Dashboard <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── TEST TAKING SCREEN ───
    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
        <div className="test-page">
            <div className="test-container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }}>
                        ← Exit Test
                    </Link>
                    <div className="test-timer">
                        <Clock size={16} style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-secondary)' }} />
                        <span style={{ color: timeLeft < 300 ? 'var(--danger)' : undefined }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="test-progress">
                    <div className="test-progress-bar">
                        <motion.div
                            className="test-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="test-progress-text">{currentQ + 1}/{questions.length}</div>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        className="test-question-card"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                            <span className="badge badge-primary">{question.category}</span>
                            <span className="badge badge-info">Question {currentQ + 1}</span>
                        </div>

                        {question.scenario && (
                            <div className="test-scenario">
                                <strong>Scenario:</strong> {question.scenario}
                            </div>
                        )}

                        <div className="test-question-text">{question.questionText}</div>

                        <div className="test-options">
                            {question.options.map((opt) => (
                                <motion.div
                                    key={opt.id}
                                    className={`test-option ${answers[currentQ] === opt.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectAnswer(opt.id)}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="test-option-radio" />
                                    <div className="test-option-label">
                                        <span className="test-option-id">{opt.id.toUpperCase()}.</span>
                                        {opt.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="test-nav">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                        disabled={currentQ === 0}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    {currentQ === questions.length - 1 ? (
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length < questions.length}
                        >
                            <CheckCircle2 size={18} /> Submit Assessment
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                            disabled={!answers[currentQ]}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
