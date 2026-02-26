import { NextResponse } from 'next/server';
import { db } from '@/db';
import { testAttempts, ethicsScores, users, tests } from '@/db/schema';
import { eq, desc, sql, avg, count } from 'drizzle-orm';

export async function GET() {
    try {
        // Get overall stats
        const totalEmployees = await db.select({ count: count() }).from(users).where(eq(users.role, 'employee'));
        const totalTests = await db.select({ count: count() }).from(tests);
        const completedAttempts = await db.select({ count: count() }).from(testAttempts).where(eq(testAttempts.status, 'completed'));
        const avgScore = await db.select({ avg: avg(testAttempts.score) }).from(testAttempts).where(eq(testAttempts.status, 'completed'));

        // Get avg ethics scores for spider chart
        const avgEthics = await db.select({
            integrity: avg(ethicsScores.integrity),
            fairness: avg(ethicsScores.fairness),
            accountability: avg(ethicsScores.accountability),
            transparency: avg(ethicsScores.transparency),
            respect: avg(ethicsScores.respect),
        }).from(ethicsScores);

        // Get recent attempts 
        const recentAttempts = await db
            .select({
                id: testAttempts.id,
                score: testAttempts.score,
                completedAt: testAttempts.completedAt,
                userName: users.name,
                userDept: users.department,
                testTitle: tests.title,
            })
            .from(testAttempts)
            .leftJoin(users, eq(testAttempts.userId, users.id))
            .leftJoin(tests, eq(testAttempts.testId, tests.id))
            .where(eq(testAttempts.status, 'completed'))
            .orderBy(desc(testAttempts.completedAt))
            .limit(10);

        // Department-wise scores
        const deptScores = await db
            .select({
                department: users.department,
                avgScore: avg(testAttempts.score),
                count: count(),
            })
            .from(testAttempts)
            .leftJoin(users, eq(testAttempts.userId, users.id))
            .where(eq(testAttempts.status, 'completed'))
            .groupBy(users.department);

        // Monthly trend data
        const monthlyTrend = await db
            .select({
                month: sql<string>`TO_CHAR(${testAttempts.completedAt}, 'YYYY-MM')`,
                avgScore: avg(testAttempts.score),
                count: count(),
            })
            .from(testAttempts)
            .where(eq(testAttempts.status, 'completed'))
            .groupBy(sql`TO_CHAR(${testAttempts.completedAt}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${testAttempts.completedAt}, 'YYYY-MM')`);

        // Pass/fail distribution
        const passCount = await db
            .select({ count: count() })
            .from(testAttempts)
            .where(sql`${testAttempts.status} = 'completed' AND ${testAttempts.score} >= 70`);

        const failCount = await db
            .select({ count: count() })
            .from(testAttempts)
            .where(sql`${testAttempts.status} = 'completed' AND ${testAttempts.score} < 70`);

        return NextResponse.json({
            stats: {
                totalEmployees: totalEmployees[0]?.count || 0,
                totalTests: totalTests[0]?.count || 0,
                completedAttempts: completedAttempts[0]?.count || 0,
                avgScore: Math.round(Number(avgScore[0]?.avg || 0)),
            },
            ethicsProfile: avgEthics[0] || {
                integrity: 0, fairness: 0, accountability: 0, transparency: 0, respect: 0,
            },
            recentAttempts,
            deptScores,
            monthlyTrend,
            distribution: {
                pass: passCount[0]?.count || 0,
                fail: failCount[0]?.count || 0,
            },
        });
    } catch (error: any) {
        console.error('Dashboard data error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
