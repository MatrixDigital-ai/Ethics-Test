'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DistributionPieChartProps {
    pass: number;
    fail: number;
}

const COLORS = ['#10B981', '#EF4444'];

export default function DistributionPieChart({ pass, fail }: DistributionPieChartProps) {
    const data = [
        { name: 'Passed', value: Number(pass) || 0 },
        { name: 'Failed', value: Number(fail) || 0 },
    ];

    const total = data[0].value + data[1].value;

    if (total === 0) {
        data[0].value = 1;
        data[1].value = 0;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1500}
                    label={({ name, percent }: any) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        fontSize: 13,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
