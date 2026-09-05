import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const employeeId = parseInt(id);

  try {
    const db = await getDB();
    await db.collection('users').deleteOne({ id: employeeId, role: 'PROVIDER' });
    return NextResponse.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Delete employee error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
