/**
 * Firestore transaction service
 * Collection path: users/{uid}/transactions/{txId}
 */
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/store/useFinanceStore';

const txCol = (uid: string) => collection(db, 'users', uid, 'transactions');

/** Fetch all transactions for a user, sorted by date descending */
export async function fetchTransactions(uid: string): Promise<Transaction[]> {
  const q = query(txCol(uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

/** Add a transaction to Firestore. Returns the Firestore-generated id. */
export async function addTransactionToFirestore(
  uid: string,
  tx: Omit<Transaction, 'id'>
): Promise<string> {
  const ref = await addDoc(txCol(uid), tx);
  return ref.id;
}

/** Add a transaction with a pre-determined id (upsert) */
export async function setTransactionInFirestore(
  uid: string,
  tx: Transaction
): Promise<void> {
  const { id, ...data } = tx;
  await setDoc(doc(txCol(uid), id), data);
}

/** Delete a transaction from Firestore */
export async function deleteTransactionFromFirestore(
  uid: string,
  txId: string
): Promise<void> {
  await deleteDoc(doc(txCol(uid), txId));
}
