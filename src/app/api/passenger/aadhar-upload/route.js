import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Access denied' }, { status: 401 });
  }

  try {
    const { aadhar_number, aadhar_image } = await req.json();

    if (!aadhar_number || !aadhar_image) {
      return NextResponse.json({ error: 'Aadhaar number and image are required' }, { status: 400 });
    }

    const cleanNumber = aadhar_number.replace(/\D/g, '');
    if (cleanNumber.length !== 12) {
      return NextResponse.json({ error: 'Aadhaar number must be exactly 12 digits' }, { status: 400 });
    }

    const db = await getDB();
    const user = await db.collection('users').findOne({ id: decoded.userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData = {
      aadhar_number: cleanNumber,
      aadhar_image: aadhar_image,
      verification_status: 'PENDING',
      verification_submitted_at: new Date().toISOString(),
      verification_notes: null,
    };

    await db.collection('users').updateOne(
      { id: decoded.userId },
      { $set: updateData }
    );

    // Audit log
    await db.collection('audit_logs').insertOne({
      action: 'AADHAAR_UPLOADED',
      actor_id: decoded.userId,
      booking_id: null,
      timestamp: new Date().toISOString(),
      details: `User ${user.name} (${user.email}) uploaded Aadhaar card for ID verification.`,
    });

    const updatedUser = await db.collection('users').findOne({ id: decoded.userId });
    const { password_hash, ...safeUser } = updatedUser;

    return NextResponse.json({
      message: 'Aadhaar card uploaded successfully. Pending admin review.',
      user: safeUser,
    });
  } catch (err) {
    console.error('Aadhaar upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
