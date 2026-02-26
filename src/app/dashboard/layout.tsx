'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { signOut, useSession, SessionProvider } from 'next-auth/react';

function EmployeeSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userName = session?.user?.name || 'Employee';

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Available Tests' },
    ];

    return (
        <aside className="sidebar">
            <Link href="/" className="sidebar-logo">
                <GraduationCap size={24} />
                <span>TestIQ</span>
            </Link>

            <nav className="sidebar-nav">
                <span className="sidebar-section-label">My Portal</span>
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
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-avatar">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{userName}</div>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Employee</span>
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
                <EmployeeSidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
