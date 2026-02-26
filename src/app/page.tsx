'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, BarChart3, FileText, Users, Sparkles, ArrowRight, CheckCircle2, Zap, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link href="/" className="landing-logo">
          <GraduationCap size={28} />
          <span>TestIQ</span>
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
            AI-Powered Test Platform
          </div>
          <h1 className="hero-title">
            Create & Take Tests<br />
            <span className="highlight">Powered by AI</span>
          </h1>
          <p className="hero-subtitle">
            Generate intelligent tests with Groq AI, deliver immersive assessments,
            and get instant scoring with comprehensive analytics and PDF reports.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-stats">
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Groq-Generated Questions</div>
            </motion.div>
            <motion.div
              className="hero-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="hero-stat-value">Auto</div>
              <div className="hero-stat-label">Instant Scoring</div>
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
              <div className="hero-stat-label">Analytics Dashboard</div>
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
            A complete suite of tools to create, manage, and analyze tests — all powered by artificial intelligence.
          </p>
        </div>
        <div className="features-grid">
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="feature-icon purple"><Brain size={24} /></div>
            <h3>AI Question Generation</h3>
            <p>Groq-powered AI creates intelligent, scenario-based questions on any topic in seconds.</p>
          </motion.div>
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="feature-icon green"><BarChart3 size={24} /></div>
            <h3>Detailed Analytics</h3>
            <p>Spider charts, score breakdowns, and category-wise analysis for every test attempt.</p>
          </motion.div>
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <div className="feature-icon blue"><FileText size={24} /></div>
            <h3>PDF Reports</h3>
            <p>Download comprehensive reports with scores, AI analysis, strengths, and improvement areas.</p>
          </motion.div>
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <div className="feature-icon orange"><Users size={24} /></div>
            <h3>Admin Dashboard</h3>
            <p>Create tests, view all submissions, and download individual PDF reports — all in one place.</p>
          </motion.div>
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
            <div className="feature-icon red"><Zap size={24} /></div>
            <h3>Immersive Test Experience</h3>
            <p>Step-by-step test flow with timers, progress bars, and engaging animations for focused assessments.</p>
          </motion.div>
          <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
            <div className="feature-icon indigo"><CheckCircle2 size={24} /></div>
            <h3>Instant AI Evaluation</h3>
            <p>Answers are scored automatically with AI-generated insights on strengths and areas to improve.</p>
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
            Ready to Create Your First Test?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28 }}>
            Start generating AI-powered tests and get instant analytics today.
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
