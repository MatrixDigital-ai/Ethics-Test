'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Users, ClipboardCheck, TrendingUp, Award, Download, Calendar, ArrowUpRight, ArrowDownRight, Shield, ArrowRight, ClipboardList } from 'lucide-react';
import SpiderChart from '@/components/charts/SpiderChart';
import DeptBarChart from '@/components/charts/DeptBarChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import DistributionPieChart from '@/components/charts/DistributionPieChart';
import Link from 'next/link';

// Demo data for when DB is not connected
const DEMO_DATA = {
    stats: { totalEmployees: 156, totalTests: 12, completedAttempts: 423, avgScore: 78 },
    ethicsProfile: { integrity: 82, fairness: 75, accountability: 88, transparency: 71, respect: 85 },
    recentAttempts: [
        { id: '1', score: 85, completedAt: '2026-02-20T10:00:00Z', userName: 'Alice Johnson', userDept: 'Engineering', testTitle: 'Q4 Ethics Review' },
        { id: '2', score: 72, completedAt: '2026-02-19T14:30:00Z', userName: 'Bob Smith', userDept: 'Marketing', testTitle: 'Workplace Integrity' },
        { id: '3', score: 91, completedAt: '2026-02-18T09:15:00Z', userName: 'Carol Davis', userDept: 'HR', testTitle: 'Leadership Ethics' },
        { id: '4', score: 63, completedAt: '2026-02-17T16:00:00Z', userName: 'Derek Wilson', userDept: 'Sales', testTitle: 'Q4 Ethics Review' },
        { id: '5', score: 88, completedAt: '2026-02-16T11:30:00Z', userName: 'Eva Martinez', userDept: 'Finance', testTitle: 'Data Privacy Ethics' },
    ],
    deptScores: [
        { department: 'Engineering', avgScore: 82, count: 45 },
        { department: 'Marketing', avgScore: 75, count: 28 },
        { department: 'HR', avgScore: 90, count: 15 },
        { department: 'Sales', avgScore: 68, count: 32 },
        { department: 'Finance', avgScore: 85, count: 20 },
        { department: 'Operations', avgScore: 77, count: 16 },
    ],
    monthlyTrend: [
        { month: '2025-09', avgScore: 72, count: 55 },
        { month: '2025-10', avgScore: 74, count: 62 },
        { month: '2025-11', avgScore: 76, count: 70 },
        { month: '2025-12', avgScore: 75, count: 68 },
        { month: '2026-01', avgScore: 78, count: 80 },
        { month: '2026-02', avgScore: 81, count: 88 },
    ],
    distribution: { pass: 342, fail: 81 },
};

// ─── Employee Dashboard View ───
function EmployeeDashboard() {
    return (
        <div>
            <div className="page-header">
                <h1>Welcome to EthicsIQ</h1>
                <p>Your ethics assessment portal</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: 40, textAlign: 'center' }}
                >
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                        <ClipboardList size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Take an Ethics Test</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        Complete scenario-based ethics assessments to contribute to your organization&apos;s ethical standards.
                    </p>
                    <Link href="/test/start" className="btn btn-primary btn-lg">
                        Start Assessment <ArrowRight size={18} />
                    </Link>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ padding: 40 }}
                >
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>How It Works</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { num: '1', title: 'Start Assessment', desc: 'Begin with AI-generated ethical scenarios' },
                            { num: '2', title: 'Answer Questions', desc: 'Choose the most ethical response to each scenario' },
                            { num: '3', title: 'Submit Responses', desc: 'Your answers are recorded for admin review' },
                            { num: '4', title: 'Admin Reviews', desc: 'Results are visible only to administrators' },
                        ].map((step) => (
                            <div key={step.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                                    {step.num}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{step.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--warning-light)', border: '1px solid #FDE68A' }}
            >
                <Shield size={24} style={{ color: '#92400E', flexShrink: 0 }} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E' }}>Results are Admin-Only</div>
                    <div style={{ fontSize: 13, color: '#92400E', opacity: 0.8 }}>Your test results, scores, and analytics are only visible to administrators. You will receive feedback through your manager or HR.</div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Admin Dashboard View ───
function AdminDashboard() {
    const [data, setData] = useState(DEMO_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const result = await res.json();
                    if (result.stats.totalEmployees > 0) {
                        setData(result);
                    }
                }
            } catch {
                // Use demo data
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const stats = [
        { icon: Users, label: 'Total Employees', value: data.stats.totalEmployees, trend: '+12%', up: true, color: 'purple' },
        { icon: ClipboardCheck, label: 'Tests Completed', value: data.stats.completedAttempts, trend: '+8%', up: true, color: 'green' },
        { icon: TrendingUp, label: 'Average Score', value: `${data.stats.avgScore}%`, trend: '+3%', up: true, color: 'blue' },
        { icon: Award, label: 'Total Tests', value: data.stats.totalTests, trend: '+2', up: true, color: 'orange' },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return 'badge-success';
        if (score >= 60) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div>
            <div className="page-header page-header-actions">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor your organization&apos;s ethics performance</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
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
                            <span className={`stat-card-trend ${stat.up ? 'up' : 'down'}`}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Ethics Profile</div>
                            <div className="chart-card-subtitle">Organization-wide spider analysis</div>
                        </div>
                        <span className="badge badge-primary">5 Dimensions</span>
                    </div>
                    <SpiderChart data={data.ethicsProfile} size={320} />
                </motion.div>

                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Pass / Fail Distribution</div>
                            <div className="chart-card-subtitle">Overall test results breakdown</div>
                        </div>
                    </div>
                    <DistributionPieChart pass={data.distribution.pass} fail={data.distribution.fail} />
                </motion.div>

                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Department Scores</div>
                            <div className="chart-card-subtitle">Average ethics score by department</div>
                        </div>
                    </div>
                    <DeptBarChart data={data.deptScores} />
                </motion.div>

                <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <div className="chart-card-header">
                        <div>
                            <div className="chart-card-title">Score Trend</div>
                            <div className="chart-card-subtitle">Monthly average over 6 months</div>
                        </div>
                    </div>
                    <TrendLineChart data={data.monthlyTrend} />
                </motion.div>
            </div>

            {/* Recent Activity Table */}
            <motion.div className="table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <div className="table-header">
                    <span className="table-title">Recent Test Results</span>
                    <Link href="/dashboard/employees" className="btn btn-ghost btn-sm">View All →</Link>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Test</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentAttempts.map((attempt: any) => (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 100 }}>
                                            <div className="score-bar">
                                                <div className={`score-bar-fill ${getScoreColor(attempt.score)}`} style={{ width: `${attempt.score}%` }} />
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{attempt.score}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${getScoreBadge(attempt.score)}`}>{attempt.score >= 70 ? 'Passed' : 'Failed'}</span>
                                </td>
                                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard Page ───
export default function DashboardPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'employee';

    if (userRole === 'admin') {
        return <AdminDashboard />;
    }

    return <EmployeeDashboard />;
}
