import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getCredential() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail } = process.env;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin belum dikonfigurasi. Isi FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY.',
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

const app = getApps().length ? getApps()[0] : initializeApp({ credential: getCredential() });

export const adminAuth = getAuth(app);
export const firestore = getFirestore(app);
