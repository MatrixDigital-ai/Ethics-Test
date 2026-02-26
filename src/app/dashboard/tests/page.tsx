'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Brain, Clock, Users, Sparkles, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const DEMO_TESTS = [
    { id: '1', title: 'Q4 Ethics Review 2025', description: 'Comprehensive ethics assessment covering all 5 dimensions.', category: 'General Ethics', difficulty: 'Medium', totalQuestions: 10, timeLimit: 30, status: 'active' },
    { id: '2', title: 'Workplace Integrity Assessment', description: 'Focus on integrity and accountability in daily decisions.', category: 'Integrity', difficulty: 'Hard', totalQuestions: 15, timeLimit: 45, status: 'active' },
    { id: '3', title: 'Leadership Ethics', description: 'Ethics scenarios for leadership and management roles.', category: 'Accountability', difficulty: 'Hard', totalQuestions: 12, timeLimit: 35, status: 'active' },
    { id: '4', title: 'Data Privacy & Transparency', description: 'Assessment on data handling, privacy, and transparent practices.', category: 'Transparency', difficulty: 'Medium', totalQuestions: 10, timeLimit: 25, status: 'active' },
    { id: '5', title: 'Diversity & Respect', description: 'Evaluating inclusivity, respect, and fairness in the workplace.', category: 'Respect', difficulty: 'Easy', totalQuestions: 8, timeLimit: 20, status: 'active' },
];

export default function TestsPage() {
    const [tests] = useState(DEMO_TESTS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', description: '', category: 'General Ethics', difficulty: 'Medium', questionCount: 10 });

    const handleCreateTest = async () => {
        setCreating(true);
        try {
            // Generate questions with AI
            const aiRes = await fetch('/api/ai/generate-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newTest.category, difficulty: newTest.difficulty, count: newTest.questionCount }),
            });
            const { questions } = await aiRes.json();

            // Create test with questions
            await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTest, generatedQuestions: questions }),
            });

            setShowCreateModal(false);
            setNewTest({ title: '', description: '', category: 'General Ethics', difficulty: 'Medium', questionCount: 10 });
        } catch (err) {
            console.error(err);
        }
        setCreating(false);
    };

    const getDifficultyBadge = (d: string) => {
        if (d === 'Easy') return 'badge-success';
        if (d === 'Medium') return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <h1>Ethics Tests</h1>
                    <p>Create and manage AI-generated assessments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} /> Create AI Test
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                {tests.map((test, i) => (
                    <motion.div
                        key={test.id}
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span className="badge badge-primary">{test.category}</span>
                            <span className={`badge ${getDifficultyBadge(test.difficulty)}`}>{test.difficulty}</span>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{test.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{test.description}</p>
                        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ClipboardList size={14} /> {test.totalQuestions} Questions
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={14} /> {test.timeLimit} min
                            </span>
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                            <Link href={`/test/start?testId=${test.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                Start Test
                            </Link>
                            <button className="btn btn-secondary btn-sm">View Details</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Test Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
                    <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={22} style={{ color: 'var(--primary)' }} />
                                Create AI-Generated Test
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="input-group">
                                <label>Test Title</label>
                                <input className="input" placeholder="e.g., Q1 Ethics Review 2026" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea className="input" placeholder="Brief description of the test..." value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select className="input" value={newTest.category} onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}>
                                        <option>General Ethics</option>
                                        <option>Integrity</option>
                                        <option>Fairness</option>
                                        <option>Accountability</option>
                                        <option>Transparency</option>
                                        <option>Respect</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Difficulty</label>
                                    <select className="input" value={newTest.difficulty} onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })}>
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Number of Questions</label>
                                <input className="input" type="number" min={5} max={20} value={newTest.questionCount} onChange={(e) => setNewTest({ ...newTest, questionCount: Number(e.target.value) })} />
                            </div>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCreateTest} disabled={creating || !newTest.title}>
                                {creating ? (
                                    <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Generating with AI...</>
                                ) : (
                                    <><Brain size={18} /> Generate Test with Groq AI</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
