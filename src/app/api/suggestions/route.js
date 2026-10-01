import { NextResponse } from 'next/server';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const submitters = ['PASSENGER', 'PROVIDER'];
const reviewers = ['MANAGER', 'ADMIN'];

export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded || !submitters.includes(decoded.role)) {
    return NextResponse.json({ error: 'Only passengers and employees can submit suggestions' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : 'General';
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and suggestion details are required' }, { status: 400 });
    }
    if (title.length > 120 || description.length > 3000) {
      return NextResponse.json({ error: 'Title must be 120 characters or fewer and details 3000 characters or fewer' }, { status: 400 });
    }

    const db = await getDB();
    const now = new Date().toISOString();
    const suggestion = {
      id: await nextId('suggestions'),
      title,
      description,
      category: category || 'General',
      submitted_by: decoded.userId,
      submitted_role: decoded.role,
      status: 'SUBMITTED',
      created_at: now,
      updated_at: now,
    };
    await db.collection('suggestions').insertOne(suggestion);
    await db.collection('audit_logs').insertOne({
      action: 'SUGGESTION_SUBMITTED',
      actor_id: decoded.userId,
      suggestion_id: suggestion.id,
      timestamp: now,
      details: title,
    });
    return NextResponse.json({ message: 'Suggestion submitted for review', suggestion }, { status: 201 });
  } catch (err) {
    console.error('Suggestion creation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || !reviewers.includes(decoded.role)) {
    return NextResponse.json({ error: 'Only complaint managers and admins can view suggestions' }, { status: 403 });
  }

  try {
    const db = await getDB();
    const suggestions = await db.collection('suggestions').find({}).sort({ created_at: -1 }).toArray();
    const submitterIds = [...new Set(suggestions.map(item => item.submitted_by).filter(Boolean))];
    const users = await db.collection('users').find(
      { id: { $in: submitterIds } },
      { projection: { _id: 0, id: 1, name: 1, email: 1, phone: 1, role: 1 } }
    ).toArray();
    const byId = new Map(users.map(user => [user.id, user]));
    return NextResponse.json(suggestions.map(item => ({
      ...item,
      submitter: byId.get(item.submitted_by) || null,
    })));
  } catch (err) {
    console.error('Suggestion list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
