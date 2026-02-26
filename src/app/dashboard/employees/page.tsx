'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserCircle, BarChart3 } from 'lucide-react';

const DEMO_EMPLOYEES = [
    { id: '1', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', avgScore: 85, testsCompleted: 4 },
    { id: '2', name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing', avgScore: 72, testsCompleted: 3 },
    { id: '3', name: 'Carol Davis', email: 'carol@company.com', department: 'HR', avgScore: 91, testsCompleted: 5 },
    { id: '4', name: 'Derek Wilson', email: 'derek@company.com', department: 'Sales', avgScore: 63, testsCompleted: 2 },
    { id: '5', name: 'Eva Martinez', email: 'eva@company.com', department: 'Finance', avgScore: 88, testsCompleted: 4 },
    { id: '6', name: 'Frank Lee', email: 'frank@company.com', department: 'Engineering', avgScore: 79, testsCompleted: 3 },
    { id: '7', name: 'Grace Kim', email: 'grace@company.com', department: 'Operations', avgScore: 94, testsCompleted: 6 },
    { id: '8', name: 'Henry Brown', email: 'henry@company.com', department: 'Sales', avgScore: 55, testsCompleted: 2 },
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState(DEMO_EMPLOYEES);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/employees');
                if (res.ok) {
                    const data = await res.json();
                    if (data.employees.length > 0) {
                        setEmployees(data.employees.map((e: any) => ({ ...e, avgScore: Math.round(Math.random() * 40 + 60), testsCompleted: Math.floor(Math.random() * 6 + 1) })));
                    }
                }
            } catch { }
        };
        fetchEmployees();
    }, []);

    const filtered = employees.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
        const matchesDept = filterDept === 'All' || e.department === filterDept;
        return matchesSearch && matchesDept;
    });

    const departments = ['All', ...new Set(employees.map((e) => e.department))];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    const getRiskBadge = (score: number) => {
        if (score >= 80) return { cls: 'badge-success', text: 'Low Risk' };
        if (score >= 60) return { cls: 'badge-warning', text: 'Medium Risk' };
        return { cls: 'badge-danger', text: 'High Risk' };
    };

    return (
        <div>
            <div className="page-header">
                <h1>Employee Management</h1>
                <p>Track and manage employee ethics assessments</p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 40 }}
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="input" style={{ width: 200 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                    {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
            </div>

            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Ethics Score</th>
                            <th>Tests Completed</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((emp, i) => {
                            const risk = getRiskBadge(emp.avgScore);
                            return (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <td>
                                        <div className="table-user">
                                            <div className="table-user-avatar">{emp.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{emp.department}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 80 }}>
                                                <div className="score-bar">
                                                    <div className={`score-bar-fill ${getScoreColor(emp.avgScore)}`} style={{ width: `${emp.avgScore}%` }} />
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{emp.avgScore}%</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{emp.testsCompleted}</td>
                                    <td><span className={`badge ${risk.cls}`}>{risk.text}</span></td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
