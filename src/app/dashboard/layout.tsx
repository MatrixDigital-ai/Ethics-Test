'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, Users, ClipboardList, Trophy, FileText, LogOut, ChevronRight } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';

function SidebarContent() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const userRole = (session?.user as any)?.role || 'employee';
    const userName = session?.user?.name || 'User';

    // Admin navigation items
    const adminNavItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/dashboard/employees', icon: Users, label: 'Employees' },
        { href: '/dashboard/tests', icon: ClipboardList, label: 'Tests' },
        { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { href: '/dashboard/reports', icon: FileText, label: 'Reports & PDF' },
    ];

    // Employee navigation items — limited, no results/reports
    const employeeNavItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { href: '/dashboard/tests', icon: ClipboardList, label: 'My Tests' },
    ];

    const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems;

    return (
        <aside className="sidebar">
            <Link href="/" className="sidebar-logo">
                <Shield size={24} />
                <span>EthicsIQ</span>
            </Link>

            <nav className="sidebar-nav">
                <span className="sidebar-section-label">
                    {userRole === 'admin' ? 'Admin Dashboard' : 'Employee Portal'}
                </span>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        {item.label}
                        {pathname === item.href && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                    </Link>
                ))}

                <span className="sidebar-section-label">Actions</span>
                <Link href="/test/start" className="sidebar-link">
                    <ClipboardList size={20} />
                    Take a Test
                </Link>
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-avatar">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{userName}</div>
                    <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
                        {userRole === 'admin' && <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: 10 }}>Admin</span>}
                        {userRole === 'employee' && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Employee</span>}
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="btn btn-ghost btn-icon"
                    title="Sign out"
                    style={{ marginLeft: 'auto' }}
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <div className="dashboard-layout">
                <SidebarContent />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
