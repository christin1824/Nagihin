import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { firestore } from './firebaseAdmin.js';
import { optionalAuth, requireAdmin, requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const allowedOrigins = process.env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedCollections = new Set([
  'users',
  'kamar',
  'tagihan',
  'penghuni',
  'tiket_perbaikan',
  'pesan',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin tidak diizinkan oleh backend.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(optionalAuth);

function assertCollection(collectionName) {
  if (!allowedCollections.has(collectionName)) {
    const error = new Error('Koleksi tidak tersedia.');
    error.status = 404;
    throw error;
  }
}

function canReadCollection(req, collectionName) {
  if (req.profile?.role === 'admin') return true;
  return collectionName === 'kamar'
    || (Boolean(req.user) && ['tiket_perbaikan', 'pesan'].includes(collectionName));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user, profile: req.profile });
});

app.get('/api/collections/:collectionName', async (req, res, next) => {
  try {
    const { collectionName } = req.params;
    assertCollection(collectionName);
    if (!canReadCollection(req, collectionName)) {
      return res.status(403).json({ error: 'Akses koleksi tidak diizinkan.' });
    }

    let query = firestore.collection(collectionName);
    const { field, value } = req.query;
    if (collectionName === 'pesan' && req.profile?.role !== 'admin') {
      query = query.where('clientUid', '==', req.user.uid);
    } else if (field && value !== undefined) {
      query = query.where(field, '==', value);
    }
    const snapshot = await query.get();
    return res.json(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/collections/:collectionName', requireAuth, async (req, res, next) => {
  try {
    const { collectionName } = req.params;
    assertCollection(collectionName);
    if (req.profile?.role !== 'admin' && !['users', 'tiket_perbaikan', 'pesan'].includes(collectionName)) {
      return res.status(403).json({ error: 'Akses tulis tidak diizinkan.' });
    }

    const data = { ...req.body };
    if (collectionName === 'users' && data.uid && data.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Dokumen user tidak sesuai dengan sesi.' });
    }
    if (collectionName === 'pesan') data.clientUid = req.user.uid;
    const reference = collectionName === 'users'
      ? firestore.collection(collectionName).doc(req.user.uid)
      : firestore.collection(collectionName).doc();
    await reference.set(data);
    return res.status(201).json({ id: reference.id, ...data });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/collections/:collectionName/:id', requireAuth, async (req, res, next) => {
  try {
    const { collectionName, id } = req.params;
    assertCollection(collectionName);
    if (req.profile?.role !== 'admin' && collectionName !== 'users') {
      return res.status(403).json({ error: 'Akses tulis tidak diizinkan.' });
    }
    if (collectionName === 'users' && req.user.uid !== id && req.profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Akses profil tidak diizinkan.' });
    }

    await firestore.collection(collectionName).doc(id).set(req.body, { merge: true });
    return res.json({ id, ...req.body });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/collections/:collectionName/:id', requireAdmin, async (req, res, next) => {
  try {
    const { collectionName, id } = req.params;
    assertCollection(collectionName);
    await firestore.collection(collectionName).doc(id).delete();
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/api/collections/:collectionName/batch', requireAdmin, async (req, res, next) => {
  try {
    const { collectionName } = req.params;
    assertCollection(collectionName);
    if (!Array.isArray(req.body.items)) {
      return res.status(400).json({ error: 'items harus berupa array.' });
    }
    const batch = firestore.batch();
    req.body.items.forEach((item) => {
      const id = item.id || item._docId || item.kamar;
      if (!id) throw new Error('Setiap item batch membutuhkan id, _docId, atau kamar.');
      const data = { ...item };
      delete data.id;
      delete data._docId;
      batch.set(firestore.collection(collectionName).doc(String(id)), data, { merge: true });
    });
    await batch.commit();
    return res.json({ updated: req.body.items.length });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Nagih.in API berjalan di http://localhost:${port}`);
});
