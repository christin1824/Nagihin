import { adminAuth, firestore } from '../firebaseAdmin.js';

export async function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next();

  try {
    req.user = await adminAuth.verifyIdToken(token);
    const profileSnapshot = await firestore.collection('users').doc(req.user.uid).get();
    req.profile = profileSnapshot.exists ? profileSnapshot.data() : null;
  } catch {
    req.user = null;
    req.profile = null;
  }
  return next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Autentikasi diperlukan.' });
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Akses admin diperlukan.' });
  }
  return next();
}

export function requireAdminOrOwner(req, res, next) {
  if (req.profile?.role === 'admin' || req.user?.uid === req.params.id) return next();
  return res.status(403).json({ error: 'Akses tidak diizinkan.' });
}
