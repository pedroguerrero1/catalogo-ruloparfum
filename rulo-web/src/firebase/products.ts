import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { CollectionName, Product } from '@/types/product';

export async function fetchCollection(name: CollectionName): Promise<Product[]> {
  const q = query(collection(db, name), orderBy('id'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Product)
    .filter((p) => p.id && (p.id as unknown as string) !== 'temp');
}

export async function saveProduct(
  name: CollectionName,
  id: number,
  data: Partial<Product>,
): Promise<void> {
  await setDoc(doc(db, name, String(id)), { ...data, id });
}

export async function deleteProduct(name: CollectionName, id: number): Promise<void> {
  await deleteDoc(doc(db, name, String(id)));
}

export async function patchProduct(
  name: CollectionName,
  id: number,
  fields: Partial<Product>,
): Promise<void> {
  await updateDoc(doc(db, name, String(id)), fields);
}
