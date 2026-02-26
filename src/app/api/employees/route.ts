import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, testAttempts, ethicsScores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const employeeList = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                department: users.department,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.role, 'employee'))
            .orderBy(desc(users.createdAt));

        return NextResponse.json({ employees: employeeList });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}
