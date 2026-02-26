'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User, BarChart3 } from 'lucide-react';
import SpiderChart from '@/components/charts/SpiderChart';

const DEMO_REPORTS = [
    { id: '1', employeeName: 'Alice Johnson', department: 'Engineering', score: 85, date: '2026-02-20', ethics: { integrity: 88, fairness: 82, accountability: 90, transparency: 78, respect: 87 } },
    { id: '2', employeeName: 'Bob Smith', department: 'Marketing', score: 72, date: '2026-02-19', ethics: { integrity: 70, fairness: 68, accountability: 75, transparency: 73, respect: 74 } },
    { id: '3', employeeName: 'Carol Davis', department: 'HR', score: 91, date: '2026-02-18', ethics: { integrity: 93, fairness: 88, accountability: 95, transparency: 85, respect: 94 } },
    { id: '4', employeeName: 'Derek Wilson', department: 'Sales', score: 63, date: '2026-02-17', ethics: { integrity: 60, fairness: 58, accountability: 65, transparency: 70, respect: 62 } },
];

export default function ReportsPage() {
    const [reports] = useState(DEMO_REPORTS);
    const [selectedReport, setSelectedReport] = useState<typeof DEMO_REPORTS[0] | null>(null);

    const handleDownloadPDF = async (report: typeof DEMO_REPORTS[0]) => {
        // Dynamic import for client-side only
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;

        const element = document.getElementById('report-preview');
        if (!element) return;

        setSelectedReport(report);

        // Wait for render
        setTimeout(async () => {
            const el = document.getElementById('report-preview');
            if (!el) return;

            const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`TestIQ_Report_${report.employeeName.replace(/\s/g, '_')}.pdf`);
        }, 500);
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
                    <h1>Reports</h1>
                    <p>Download employee ethics reports as PDF</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
                {reports.map((report, i) => (
                    <motion.div
                        key={report.id}
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div className="table-user">
                                <div className="table-user-avatar">{report.employeeName.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{report.employeeName}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{report.department}</div>
                                </div>
                            </div>
                            <span className={`badge ${getScoreBadge(report.score)}`}>{report.score}%</span>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <SpiderChart data={report.ethics} size={200} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {report.date}</span>
                        </div>

                        <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleDownloadPDF(report)}>
                            <Download size={14} /> Download PDF Report
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Hidden Report Template for PDF Generation */}
            <div id="report-preview" style={{ position: 'absolute', left: '-9999px', top: 0, width: 800, padding: 40, background: 'white', fontFamily: 'Inter, sans-serif' }}>
                {selectedReport && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>E</div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>TestIQ Report</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>Assessment Report</div>
                            </div>
                        </div>
                        <hr style={{ borderColor: '#E2E8F0', margin: '20px 0' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Employee</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedReport.employeeName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Department</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedReport.department}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Overall Score</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: selectedReport.score >= 80 ? '#10B981' : selectedReport.score >= 60 ? '#F59E0B' : '#EF4444' }}>{selectedReport.score}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Assessment Date</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedReport.date}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Ethics Breakdown</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {Object.entries(selectedReport.ethics).map(([key, value]) => (
                                <div key={key} style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize', marginBottom: 4 }}>{key}</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444' }}>{value}%</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 24, padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>AI Assessment Summary</div>
                            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                                This employee demonstrates {selectedReport.score >= 80 ? 'strong' : selectedReport.score >= 60 ? 'adequate' : 'concerning'} ethical decision-making across all 5 dimensions.
                                {selectedReport.score >= 80 ? ' They consistently show good judgment in complex scenarios.' : ' There are areas for improvement, particularly in scenario-based ethical reasoning.'}
                            </div>
                        </div>
                        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#94A3B8' }}>
                            Generated by TestIQ — AI-Powered Test Taking Platform
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
