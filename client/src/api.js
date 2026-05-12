import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

const userCol = (col) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return collection(db, 'users', uid, col);
};

export const getAll = async (col, filters = {}, sortField = 'createdAt', limitCount = 50) => {
  const constraints = [];
  if (filters.field && filters.value) constraints.push(where(filters.field, '==', filters.value));
  constraints.push(orderBy(sortField, 'desc'));
  constraints.push(limit(limitCount));
  const q = query(userCol(col), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getOne = async (col, id) => {
  const snap = await getDoc(doc(db, 'users', auth.currentUser.uid, col, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const create = async (col, data) => {
  const docRef = await addDoc(userCol(col), { ...data, createdAt: Date.now() });
  return { id: docRef.id, ...data };
};

export const update = async (col, id, data) => {
  await updateDoc(doc(db, 'users', auth.currentUser.uid, col, id), data);
};

export const remove = async (col, id) => {
  await deleteDoc(doc(db, 'users', auth.currentUser.uid, col, id));
};
