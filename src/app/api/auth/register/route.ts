import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { name, email, password, department, role } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                passwordHash,
                department: department || 'General',
                role: role || 'employee',
            })
            .returning();

        return NextResponse.json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
