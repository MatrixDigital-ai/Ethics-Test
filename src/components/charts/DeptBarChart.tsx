'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DeptBarChartProps {
    data: { department: string; avgScore: number; count: number }[];
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];

export default function DeptBarChart({ data }: DeptBarChartProps) {
    const chartData = data.map((d) => ({
        name: d.department || 'Unknown',
        score: Math.round(Number(d.avgScore) || 0),
        count: d.count,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 12 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        fontSize: 13,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Avg Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={1500}>
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
