'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendLineChartProps {
    data: { month: string; avgScore: number; count: number }[];
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
    const chartData = data.map((d) => ({
        month: d.month,
        score: Math.round(Number(d.avgScore) || 0),
        tests: d.count,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11 }}
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
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ fill: '#6366F1', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: '#6366F1', stroke: '#E0E7FF', strokeWidth: 3 }}
                    animationDuration={2000}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
