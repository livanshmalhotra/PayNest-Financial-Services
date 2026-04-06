import { create } from 'zustand';

import {
  fetchTransactions,
  setTransactionInFirestore,
  deleteTransactionFromFirestore,
} from '@/lib/transactionService';

export type TransactionType = 'income' | 'expense';
export type Role = 'viewer' | 'admin';
export type Category =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  type: TransactionType;
  description: string;
}

interface FinanceState {
  transactions: Transaction[];
  loading: boolean;
  role: Role;
  searchQuery: string;
  filterCategory: Category | 'all';
  filterType: TransactionType | 'all';
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';

  // Actions
  setRole: (role: Role) => void;
  setSearchQuery: (q: string) => void;
  setFilterCategory: (c: Category | 'all') => void;
  setFilterType: (t: TransactionType | 'all') => void;
  setSortBy: (s: 'date' | 'amount') => void;
  setSortOrder: (o: 'asc' | 'desc') => void;

  /** Load transactions from Firestore into the store */
  loadTransactions: (uid: string) => Promise<void>;

  /** Add a transaction — writes to Firestore + local store */
  addTransaction: (t: Omit<Transaction, 'id'>, uid: string) => Promise<void>;

  /** Delete a transaction — removes from Firestore + local store */
  deleteTransaction: (id: string, uid: string) => Promise<void>;

  updateTransaction: (id: string, t: Partial<Transaction>, uid: string) => Promise<void>;

  /** Clear store on logout */
  clearTransactions: () => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  loading: false,
  role: 'admin',
  searchQuery: '',
  filterCategory: 'all',
  filterType: 'all',
  sortBy: 'date',
  sortOrder: 'desc',

  setRole: (role) => set({ role }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterType: (filterType) => set({ filterType }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  loadTransactions: async (uid) => {
    set({ loading: true });
    try {
      const txs = await fetchTransactions(uid);
      set({ transactions: txs });
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (t, uid) => {
    // Generate a stable id locally so UI is instantly reactive
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    const tx: Transaction = { ...t, id };

    // Optimistic update — show immediately
    set((state) => ({ transactions: [tx, ...state.transactions] }));

    // Persist to Firestore (upsert with the same id)
    try {
      await setTransactionInFirestore(uid, tx);
    } catch (err) {
      console.error('Failed to save transaction to Firestore:', err);
      // Roll back on failure
      set((state) => ({
        transactions: state.transactions.filter((x) => x.id !== id),
      }));
    }
  },

  deleteTransaction: async (id, uid) => {
    // Optimistic removal
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));

    // Delete from Firestore
    try {
      await deleteTransactionFromFirestore(uid, id);
    } catch (err) {
      console.error('Failed to delete transaction from Firestore:', err);
    }
  },

  updateTransaction: async (id, updates, uid) => {
    // Optimistic update
    let oldTx: Transaction | undefined;
    set((state) => {
      oldTx = state.transactions.find(t => t.id === id);
      return {
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
    });

    // Write to Firestore if we have a uid and found the old tx
    if (uid && oldTx) {
      try {
        await setTransactionInFirestore(uid, { ...oldTx, ...updates });
      } catch (err) {
        console.error('Failed to update transaction in Firestore:', err);
        // Rollback
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? oldTx! : t
          ),
        }));
      }
    }
  },

  clearTransactions: () => set({ transactions: [] }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const useAllTransactions = () => {
  const { transactions } = useFinanceStore();
  return transactions;
};

export const useFilteredTransactions = () => {
  const transactions = useAllTransactions();
  const { searchQuery, filterCategory, filterType, sortBy, sortOrder } =
    useFinanceStore();

  let filtered = [...transactions];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter((t) => t.category === filterCategory);
  }

  if (filterType !== 'all') {
    filtered = filtered.filter((t) => t.type === filterType);
  }

  filtered.sort((a, b) => {
    const mul = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'date')
      return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
    return mul * (a.amount - b.amount);
  });

  return filtered;
};

export const useSummary = () => {
  const { transactions } = useFinanceStore();
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpenses, totalBalance: totalIncome - totalExpenses };
};
