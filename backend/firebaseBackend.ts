import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../Aquastainable/firebase';

export type TankData = {
  id: string;
  tankId: string;
  user_id: string;
  tankName: string;
  tankImg: string;
  waterType: string;
  tankSize: number;
  overview: string;
  aquaCare: Record<string, unknown>;
  createdAt?: unknown;
};

export type CreateTankInput = {
  user_id: string;
  tankName: string;
  tankImg?: string;
  waterType: string;
  tankSize: number | string;
  overview?: string;
  aquaCare?: Record<string, unknown>;
  tankId?: string;
};

function generateTankId() {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && 'randomUUID' in cryptoObject) {
    return cryptoObject.randomUUID();
  }

  return `tank_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

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

export async function createTankRecord(input: CreateTankInput): Promise<TankData> {
  const tankId = input.tankId || generateTankId();
  const payload: TankData = {
    id: tankId,
    tankId,
    user_id: input.user_id,
    tankName: input.tankName.trim(),
    tankImg: input.tankImg || '',
    waterType: input.waterType.trim(),
    tankSize: Number(input.tankSize),
    overview: input.overview || '',
    aquaCare: input.aquaCare || {},
    createdAt: serverTimestamp(),
  };

  if (!payload.user_id || !payload.tankName || !payload.waterType || !Number.isFinite(payload.tankSize) || payload.tankSize <= 0) {
    throw new Error('Tank data is incomplete. Please enter a valid tank name, water type, and size.');
  }

  await setDoc(doc(db, 'tanks', tankId), payload);

  return payload;
}

export async function getTanksForUser(userId: string): Promise<TankData[]> {
  const tanksRef = collection(db, 'tanks');
  const q = query(tanksRef, where('user_id', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    tankId: docSnapshot.data().tankId || docSnapshot.id,
    ...(docSnapshot.data() as Omit<TankData, 'id' | 'tankId'>),
  }));
}

export async function getTankById(tankId: string) {
  const snapshot = await getDocs(query(collection(db, 'tanks')));
  const tank = snapshot.docs.find((docSnapshot) => docSnapshot.id === tankId || docSnapshot.data().tankId === tankId);

  if (!tank) {
    return null;
  }

  const data = tank.data();
  return {
    id: tank.id,
    tankId: data.tankId || tank.id,
    ...data,
  } as TankData;
}
