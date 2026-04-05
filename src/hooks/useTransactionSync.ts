/**
 * useTransactionSync
 * Loads the logged-in user's transactions from Firestore into the Zustand
 * store on mount / when the auth user changes, and clears on logout.
 */
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceStore } from '@/store/useFinanceStore';

export function useTransactionSync() {
  const { currentUser } = useAuth();
  const { loadTransactions, clearTransactions } = useFinanceStore();

  useEffect(() => {
    if (currentUser?.uid) {
      loadTransactions(currentUser.uid);
    } else {
      clearTransactions();
    }
  }, [currentUser?.uid]);
}
