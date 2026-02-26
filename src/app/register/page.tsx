'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Building2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', department: 'General', role: 'employee' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-scaleIn">
                <div className="auth-header">
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, textDecoration: 'none', color: 'var(--primary)' }}>
                        <Shield size={32} />
                        <span style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EthicsIQ</span>
                    </Link>
                    <h1>Create Account</h1>
                    <p>Join EthicsIQ to start your ethics assessment</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <input type="text" className="input" style={{ paddingLeft: 40 }} placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <input type="email" className="input" style={{ paddingLeft: 40 }} placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <input type="password" className="input" style={{ paddingLeft: 40 }} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Department</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <select className="input" style={{ paddingLeft: 40 }} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                                <option>General</option>
                                <option>Engineering</option>
                                <option>Marketing</option>
                                <option>Sales</option>
                                <option>Finance</option>
                                <option>HR</option>
                                <option>Operations</option>
                                <option>Legal</option>
                            </select>
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="employee">Employee</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link href="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
