'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Brain, BarChart3, FileText, Users, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link href="/" className="landing-logo">
          <Shield size={28} />
          <span>EthicsIQ</span>
        </Link>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-badge">
            <Sparkles size={14} />
            AI-Powered Ethics Assessment
          </div>
          <h1 className="hero-title">
            Build a Culture of<br />
            <span className="highlight">Ethical Excellence</span>
          </h1>
          <p className="hero-subtitle">
            Transform your organization&apos;s ethical standards with AI-generated assessments,
            immersive testing experiences, and comprehensive analytics dashboards.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Free Assessment
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              View Demo Dashboard
            </Link>
          </div>

          <div className="hero-stats">
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="hero-stat-value">5</div>
              <div className="hero-stat-label">Ethics Dimensions</div>
            </motion.div>
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Groq-Powered Analysis</div>
            </motion.div>
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="hero-stat-value">PDF</div>
              <div className="hero-stat-label">Downloadable Reports</div>
            </motion.div>
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="hero-stat-value">360°</div>
              <div className="hero-stat-label">Spider Analytics</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-label">Platform Features</div>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            A comprehensive suite of tools to measure, track, and improve ethical decision-making across your organization.
          </p>
        </div>
        <div className="features-grid">
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-icon purple"><Brain size={24} /></div>
            <h3>AI Question Generation</h3>
            <p>Groq-powered AI creates realistic ethical scenarios and evaluates responses with nuanced understanding.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon green"><BarChart3 size={24} /></div>
            <h3>Spider Chart Analytics</h3>
            <p>Visualize ethics profiles across 5 dimensions — Integrity, Fairness, Accountability, Transparency, and Respect.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="feature-icon blue"><FileText size={24} /></div>
            <h3>PDF Reports</h3>
            <p>Download comprehensive ethics reports with scores, analysis, and personalized improvement recommendations.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="feature-icon orange"><Users size={24} /></div>
            <h3>Department Insights</h3>
            <p>Compare ethics scores across departments with bar charts, leaderboards, and trend analysis.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="feature-icon red"><Zap size={24} /></div>
            <h3>Immersive Testing</h3>
            <p>Scenario-based assessments with step-by-step flow, timers, and engaging animations for maximum focus.</p>
          </motion.div>
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="feature-icon indigo"><CheckCircle2 size={24} /></div>
            <h3>Risk Assessment</h3>
            <p>AI-powered risk scoring identifies employees who need additional ethics training and guidance.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 'var(--radius-xl)',
            color: 'white',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Ready to Transform Ethics Culture?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28 }}>
            Start assessing your team&apos;s ethical standards today with AI-powered insights.
          </p>
          <Link href="/register" className="btn btn-lg" style={{ background: 'white', color: '#6366F1' }}>
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
