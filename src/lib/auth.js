import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'railassist_jwt_secret_key_2024';

export function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  try {
    return jwt.verify(parts[1], JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
