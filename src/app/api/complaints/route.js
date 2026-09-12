import { NextResponse } from 'next/server';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const MAX_IMAGES = 5;
const MAX_IMAGE_LENGTH = 2_000_000;

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || !['PASSENGER', 'MANAGER', 'ADMIN'].includes(decoded.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const db = await getDB();
    const query = decoded.role === 'PASSENGER'
      ? { $or: [{ reporter_id: decoded.userId }, { 'resolution.accused_user_id': decoded.userId }] }
      : {};
    const complaints = await db.collection('complaints').find(query).sort({ created_at: -1 }).toArray();
    const safeComplaints = complaints.map(({ reporter_name, ...complaint }) => complaint);
    return NextResponse.json(safeComplaints);
  } catch (err) {
    console.error('Complaint list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PASSENGER') {
    return NextResponse.json({ error: 'Only passengers can submit complaints' }, { status: 403 });
  }

  try {
    const { category, description, station, train_number, platform, occurred_at, images = [] } = await req.json();
    if (!category || !description || !station) {
      return NextResponse.json({ error: 'Category, description, and station are required' }, { status: 400 });
    }
    if (!Array.isArray(images) || images.length > MAX_IMAGES) {
      return NextResponse.json({ error: `You can attach up to ${MAX_IMAGES} images` }, { status: 400 });
    }
    if (images.some(image => !image?.data || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_LENGTH)) {
      return NextResponse.json({ error: 'Each image must be a valid file smaller than 2 MB' }, { status: 400 });
    }

    const db = await getDB();
    const now = new Date().toISOString();
    const complaint = {
      id: await nextId('complaints'),
      reporter_id: decoded.userId,
      category,
      description: description.trim(),
      station,
      train_number: train_number || null,
      platform: platform || null,
      occurred_at: occurred_at || now,
      images: images.map(image => ({ name: image.name || 'evidence', type: image.type || 'image/jpeg', data: image.data })),
      status: 'OPEN',
      resolution: null,
      created_at: now,
      updated_at: now,
    };

    await db.collection('complaints').insertOne(complaint);
    await db.collection('audit_logs').insertOne({
      action: 'COMPLAINT_SUBMITTED',
      actor_id: decoded.userId,
      complaint_id: complaint.id,
      timestamp: now,
      details: `Passenger reported ${category} at ${station}`,
    });

    return NextResponse.json({ message: 'Complaint submitted for review', complaint }, { status: 201 });
  } catch (err) {
    console.error('Complaint creation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
