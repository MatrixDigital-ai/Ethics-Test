'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/dashboard');
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account to continue</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <input
                                type="email"
                                className="input"
                                style={{ paddingLeft: 40 }}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
                            <input
                                type="password"
                                className="input"
                                style={{ paddingLeft: 40 }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-link">
                    Don&apos;t have an account? <Link href="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
}
