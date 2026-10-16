import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { AuthContext } from './auth-context';

async function loadProfile(currentUser) {
  const directSnapshot = await getDoc(doc(db, 'users', currentUser.uid));
  if (directSnapshot.exists()) return directSnapshot.data();

  const profileQuery = query(
    collection(db, 'users'),
    where('uid', '==', currentUser.uid),
  );
  const profileResults = await getDocs(profileQuery);
  if (!profileResults.empty) return profileResults.docs[0].data();

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth && db));
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth || !db) {
      return undefined;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      try {
        setAuthError('');
        setUser(currentUser);
        if (currentUser) {
          setProfile(await loadProfile(currentUser));
        } else {
          setProfile(null);
        }
      } catch (profileError) {
        setProfile(null);
        setAuthError(`Profil Firebase tidak bisa dibaca di project nagihin-fc85d: ${profileError.message}`);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const register = async ({ name, phone, room, email, password }) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase belum dikonfigurasi. Isi file .env terlebih dahulu.');
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const newProfile = {
      uid: credential.user.uid,
      nama: name,
      hp: phone,
      kamar: room,
      email,
      role: 'penghuni',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), newProfile);
    setProfile(newProfile);
  };

  const login = (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      return Promise.reject(new Error('Firebase belum dikonfigurasi. Isi file .env terlebih dahulu.'));
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (auth) return signOut(auth);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
