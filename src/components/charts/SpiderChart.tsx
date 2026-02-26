'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface SpiderChartProps {
    data: {
        integrity: number;
        fairness: number;
        accountability: number;
        transparency: number;
        respect: number;
    };
    size?: number;
}

export default function SpiderChart({ data, size = 300 }: SpiderChartProps) {
    const chartData = [
        { dimension: 'Integrity', value: Number(data.integrity) || 0, fullMark: 100 },
        { dimension: 'Fairness', value: Number(data.fairness) || 0, fullMark: 100 },
        { dimension: 'Accountability', value: Number(data.accountability) || 0, fullMark: 100 },
        { dimension: 'Transparency', value: Number(data.transparency) || 0, fullMark: 100 },
        { dimension: 'Respect', value: Number(data.respect) || 0, fullMark: 100 },
    ];

    return (
        <ResponsiveContainer width="100%" height={size}>
            <RadarChart data={chartData} cx="50%" cy="50%">
                <PolarGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                />
                <Radar
                    name="Ethics Score"
                    dataKey="value"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ fill: '#6366F1', strokeWidth: 0, r: 4 }}
                    animationBegin={0}
                    animationDuration={1500}
                />
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number | undefined) => [`${Math.round(value ?? 0)}%`, 'Score']}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
