'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, ArrowLeft, Edit3, Trash2, Plus, Save, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuestionData {
    questionText: string;
    scenario: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    category: string;
    explanation: string;
}

export default function CreateTestPage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'generating' | 'preview' | 'publishing' | 'done'>('form');
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'General Knowledge',
        difficulty: 'Medium',
        questionCount: 5,
    });
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState<any>(null);

    // ─── Step 1: Generate questions with AI ───
    const handleGenerate = async () => {
        if (!form.title.trim()) { setError('Please enter a test title'); return; }
        setStep('generating');
        setError('');

        try {
            const res = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, mode: 'generate' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
            setQuestions(data.questions);
            setStep('preview');
        } catch (err: any) {
            setError(err.message);
            setStep('form');
        }
    };

    // ─── Step 2: Publish — save to DB ───
    const handlePublish = async () => {
        setStep('publishing');
        setError('');

        try {
            const res = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'publish',
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    difficulty: form.difficulty,
                    questionsList: questions,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to publish test');
            setResult(data);
            setStep('done');
        } catch (err: any) {
            setError(err.message);
            setStep('preview');
        }
    };

    // ─── Edit a question inline ───
    const updateQuestion = (idx: number, field: keyof QuestionData, value: any) => {
        const updated = [...questions];
        (updated[idx] as any)[field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIdx: number, optIdx: number, text: string) => {
        const updated = [...questions];
        updated[qIdx].options[optIdx].text = text;
        setQuestions(updated);
    };

    const deleteQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
        setEditingIdx(null);
    };

    const addBlankQuestion = () => {
        setQuestions([...questions, {
            questionText: 'New Question',
            scenario: '',
            options: [{ id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' }, { id: 'c', text: 'Option C' }, { id: 'd', text: 'Option D' }],
            correctAnswer: 'a',
            category: form.category,
            explanation: '',
        }]);
        setEditingIdx(questions.length);
    };

    // ═══════════════════════════════════════
    // STEP: FORM — Enter test details
    // ═══════════════════════════════════════
    if (step === 'form') {
        return (
            <div>
                <div className="page-header">
                    <Link href="/admin" style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={28} style={{ color: 'var(--primary)' }} />
                        Create AI-Powered Test
                    </h1>
                    <p>Generate test questions using Groq AI, review &amp; edit, then publish</p>
                </div>

                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640, padding: 36 }}>
                    {error && (
                        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 13, marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="input-group">
                            <label>Test Title *</label>
                            <input className="input" placeholder="e.g., JavaScript Fundamentals Quiz" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea className="input" rows={3} placeholder="Brief description of what this test covers..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="input-group">
                                <label>Category / Topic</label>
                                <input className="input" placeholder="e.g., JavaScript, History, Science" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Difficulty</label>
                                <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Number of Questions</label>
                            <input className="input" type="number" min={3} max={20} value={form.questionCount} onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })} />
                        </div>

                        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} onClick={handleGenerate} disabled={!form.title.trim()}>
                            <Brain size={18} /> Generate Questions with AI
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // STEP: GENERATING — Loading state
    // ═══════════════════════════════════════
    if (step === 'generating') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Brain size={28} color="white" />
                </motion.div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Generating Questions...</div>
                <div style={{ fontSize: 14, color: 'var(--text-tertiary)', maxWidth: 400, textAlign: 'center' }}>
                    Groq AI is creating {form.questionCount} questions about &ldquo;{form.category}&rdquo; at {form.difficulty} difficulty. This takes 5-15 seconds.
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // STEP: PUBLISHING — Saving to DB
    // ═══════════════════════════════════════
    if (step === 'publishing') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
                <div className="loading-spinner" />
                <div style={{ fontSize: 20, fontWeight: 700 }}>Publishing Test...</div>
                <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Saving {questions.length} questions to database</div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // STEP: DONE — Success
    // ═══════════════════════════════════════
    if (step === 'done') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
                <motion.div className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 500, textAlign: 'center', padding: 48 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
                    </motion.div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Test Published! ✅</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}><strong>{form.title}</strong></p>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 28 }}>
                        {result?.questionCount || questions.length} questions are now live. Employees can take this test from their dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => { setStep('form'); setForm({ title: '', description: '', category: 'General Knowledge', difficulty: 'Medium', questionCount: 5 }); setQuestions([]); }}>
                            Create Another
                        </button>
                        <Link href="/admin" className="btn btn-secondary">Back to Dashboard</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // STEP: PREVIEW — Review & edit questions
    // ═══════════════════════════════════════
    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <button onClick={() => setStep('form')} style={{ fontSize: 14, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: 0 }}>
                        <ArrowLeft size={14} /> Back to Settings
                    </button>
                    <h1><Eye size={24} style={{ color: 'var(--primary)' }} /> Review Questions</h1>
                    <p>Review, edit, or delete questions before publishing — <strong>{form.title}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={() => { setStep('form'); }}>
                        <ArrowLeft size={14} /> Regenerate
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handlePublish} disabled={questions.length === 0}>
                        <Save size={16} /> Publish Test ({questions.length} Questions)
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 13, marginBottom: 20 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                <AnimatePresence>
                    {questions.map((q, idx) => {
                        const isEditing = editingIdx === idx;
                        const isExpanded = expandedIdx === idx;

                        return (
                            <motion.div
                                key={idx}
                                className="card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ padding: 0, overflow: 'hidden' }}
                            >
                                {/* Question Header */}
                                <div
                                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: isEditing ? 'var(--primary-50)' : undefined }}
                                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                                            {q.questionText}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                            <span className="badge badge-primary" style={{ fontSize: 10 }}>{q.category}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Correct: {q.correctAnswer.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setEditingIdx(isEditing ? null : idx); setExpandedIdx(idx); }} title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); deleteQuestion(idx); }} title="Delete" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {(isExpanded || isEditing) && (
                                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                                        {/* Scenario */}
                                        {(q.scenario || isEditing) && (
                                            <div style={{ marginTop: 12 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scenario</label>
                                                {isEditing ? (
                                                    <textarea className="input" rows={2} value={q.scenario} onChange={(e) => updateQuestion(idx, 'scenario', e.target.value)} style={{ marginTop: 4, fontSize: 13 }} />
                                                ) : (
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{q.scenario}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Question Text (edit mode) */}
                                        {isEditing && (
                                            <div style={{ marginTop: 12 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question</label>
                                                <textarea className="input" rows={2} value={q.questionText} onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)} style={{ marginTop: 4, fontSize: 13 }} />
                                            </div>
                                        )}

                                        {/* Options */}
                                        <div style={{ marginTop: 16 }}>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Options</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: opt.id === q.correctAnswer ? '#ECFDF5' : 'var(--bg)', border: `1px solid ${opt.id === q.correctAnswer ? '#A7F3D0' : 'var(--border)'}` }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: opt.id === q.correctAnswer ? 'var(--success)' : 'var(--border)', color: opt.id === q.correctAnswer ? 'white' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                                            {opt.id.toUpperCase()}
                                                        </div>
                                                        {isEditing ? (
                                                            <input className="input" value={opt.text} onChange={(e) => updateOption(idx, optIdx, e.target.value)} style={{ flex: 1, fontSize: 13, padding: '6px 10px' }} />
                                                        ) : (
                                                            <span style={{ fontSize: 13, flex: 1 }}>{opt.text}</span>
                                                        )}
                                                        {isEditing && (
                                                            <button
                                                                className={`btn btn-sm ${opt.id === q.correctAnswer ? 'btn-primary' : 'btn-ghost'}`}
                                                                onClick={() => updateQuestion(idx, 'correctAnswer', opt.id)}
                                                                style={{ fontSize: 10, padding: '4px 8px' }}
                                                            >
                                                                {opt.id === q.correctAnswer ? '✓ Correct' : 'Set Correct'}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        {(q.explanation || isEditing) && (
                                            <div style={{ marginTop: 12 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explanation</label>
                                                {isEditing ? (
                                                    <textarea className="input" rows={2} value={q.explanation} onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)} style={{ marginTop: 4, fontSize: 13 }} />
                                                ) : (
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{q.explanation}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Edit mode: category */}
                                        {isEditing && (
                                            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                                                <div className="input-group" style={{ flex: 1 }}>
                                                    <label style={{ fontSize: 11 }}>Category</label>
                                                    <input className="input" value={q.category} onChange={(e) => updateQuestion(idx, 'category', e.target.value)} style={{ fontSize: 13 }} />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => setEditingIdx(null)}>
                                                        <CheckCircle2 size={14} /> Done Editing
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Add question */}
            <button className="btn btn-secondary" onClick={addBlankQuestion} style={{ marginBottom: 20 }}>
                <Plus size={16} /> Add Question Manually
            </button>

            {/* Bottom publish bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'sticky', bottom: 20, padding: '16px 24px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <div style={{ fontWeight: 700 }}>{questions.length} Questions Ready</div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Click any question to expand, edit, or delete</div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handlePublish} disabled={questions.length === 0}>
                    <Save size={18} /> Publish Test
                </button>
            </motion.div>
        </div>
    );
}
