import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerUserWithEmail(email: string, password: string, username: string, profileImageUrl: string | null = null) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;

  if (username || profileImageUrl) {
    await updateProfile(user, {
      displayName: username || undefined,
      photoURL: profileImageUrl || undefined,
    });
  }

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    username: username || '',
    profileImageUrl: profileImageUrl || null,
    createdAt: serverTimestamp(),
  });

  return userCredential;
}

export function loginUserWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}
