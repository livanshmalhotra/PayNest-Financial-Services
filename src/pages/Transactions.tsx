import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Trash2, Plus, ArrowDownCircle, ArrowUpCircle, MoreVertical, Download } from 'lucide-react';
import { useState } from 'react';
import { useFinanceStore, useFilteredTransactions, useAllTransactions, type Category, type TransactionType } from '@/store/useFinanceStore';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const categories: Category[] = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Salary', 'Freelance', 'Investment', 'Other'];

const categoryEmoji: Record<Category, string> = {
  Food: '🍔', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️',
  Bills: '📄', Salary: '💼', Freelance: '💻', Investment: '📈', Other: '📦',
};

export default function Transactions() {
  const { currentUser, userData } = useAuth();
  const uid = currentUser?.uid ?? '';
  const {
    role, searchQuery, filterCategory, filterType, sortBy, sortOrder,
    setSearchQuery, setFilterCategory, setFilterType, setSortBy, setSortOrder,
    addTransaction, deleteTransaction, updateTransaction,
  } = useFinanceStore();
  const filtered = useFilteredTransactions();
  const isAdmin = role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string, description: string, amount: string, category: Category, type: TransactionType, date: string } | null>(null);
  const [newTx, setNewTx] = useState({
    description: '', amount: '', category: 'Other' as Category,
    type: 'expense' as TransactionType, date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = () => {
    if (!newTx.description || !newTx.amount) return;
    addTransaction({ ...newTx, amount: parseFloat(newTx.amount) }, uid);
    setNewTx({ description: '', amount: '', category: 'Other', type: 'expense', date: new Date().toISOString().split('T')[0] });
    setDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editForm || !editForm.description || !editForm.amount) return;
    const { id, amount, ...rest} = editForm;
    updateTransaction(id, { ...rest, amount: parseFloat(amount) }, uid);
    setEditForm(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zorvyn_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const baseIncome = userData?.income ?? 0;
  const allTxs = useAllTransactions();

  // Exactly mirror Overview Logic using all transactions to prevent filtering out baseline metrics
  const totalIncome = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + baseIncome;
  const totalExpense = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex-1 w-full">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">View and manage all your financial activity</p>
        </motion.div>

        {/* Summary Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="financial-card gradient-transactions flex items-center gap-4">
            <div className="p-3 rounded-xl bg-income-light">
              <ArrowUpCircle className="h-5 w-5 text-income" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Income</p>
              <p className="text-lg font-bold text-income font-display">+₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="financial-card gradient-expenses flex items-center gap-4">
            <div className="p-3 rounded-xl bg-expense-light">
              <ArrowDownCircle className="h-5 w-5 text-expense" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Expenses</p>
              <p className="text-lg font-bold text-expense font-display">-₹{totalExpense.toLocaleString()}</p>
            </div>
          </div>
          <div className="financial-card gradient-balance flex items-center gap-4">
            <div className="p-3 rounded-xl bg-balance-light">
              <SlidersHorizontal className="h-5 w-5 text-balance" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Showing Entries</p>
              <p className="text-lg font-bold text-balance-foreground font-display">{filtered.length} entries</p>
            </div>
          </div>
        </motion.div>

        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="financial-card gradient-transactions mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-display font-semibold text-card-foreground">All Transactions</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 rounded-xl border-border bg-background hover:bg-muted" onClick={handleExportCSV}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              {isAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 rounded-xl">
                      <Plus className="h-4 w-4" /> Add Transaction
                    </Button>
                  </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    {/* Transaction Type toggles */}
                    <div className="flex gap-2">
                      <Button 
                        variant={newTx.type === 'expense' ? 'default' : 'outline'} 
                        className={`flex-1 rounded-xl transition-all duration-200 ${newTx.type === 'expense' ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 border-transparent' : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'}`}
                        onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                      >
                        Expense
                      </Button>
                      <Button 
                        variant={newTx.type === 'income' ? 'default' : 'outline'} 
                        className={`flex-1 rounded-xl transition-all duration-200 ${newTx.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 border-transparent' : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'}`}
                        onClick={() => setNewTx({ ...newTx, type: 'income' })}
                      >
                        Savings
                      </Button>
                    </div>

                    <div><Label htmlFor="new-desc">Description</Label><Input id="new-desc" value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} /></div>
                    <div><Label htmlFor="new-amount">Amount</Label><Input id="new-amount" type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} /></div>
                    <div><Label htmlFor="new-date">Date</Label><Input id="new-date" type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} /></div>
                    
                    <div>
                      <Label>Category</Label>
                      <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v as Category })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAdd} className="w-full rounded-xl">Add Transaction</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            </div>

            {/* Update Transaction Dialog */}
            <Dialog open={!!editForm} onOpenChange={(open) => !open && setEditForm(null)}>
              <DialogContent className="glass-card">
                <DialogHeader><DialogTitle>Update Transaction</DialogTitle></DialogHeader>
                {editForm && (
                  <div className="space-y-4 pt-2">
                    {/* Transaction Type toggles */}
                    <div className="flex gap-2">
                      <Button 
                        variant={editForm.type === 'expense' ? 'default' : 'outline'} 
                        className={`flex-1 rounded-xl transition-all duration-200 ${editForm.type === 'expense' ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 border-transparent' : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'}`}
                        onClick={() => setEditForm(prev => prev && { ...prev, type: 'expense' })}
                      >
                        Expense
                      </Button>
                      <Button 
                        variant={editForm.type === 'income' ? 'default' : 'outline'} 
                        className={`flex-1 rounded-xl transition-all duration-200 ${editForm.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 border-transparent' : 'text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100'}`}
                        onClick={() => setEditForm(prev => prev && { ...prev, type: 'income' })}
                      >
                        Savings
                      </Button>
                    </div>

                    <div><Label htmlFor="edit-desc">Description</Label><Input id="edit-desc" value={editForm.description} onChange={(e) => setEditForm(prev => prev && { ...prev, description: e.target.value })} /></div>
                    <div><Label htmlFor="edit-amount">Amount</Label><Input id="edit-amount" type="number" value={editForm.amount} onChange={(e) => setEditForm(prev => prev && { ...prev, amount: e.target.value })} /></div>
                    <div><Label htmlFor="edit-date">Date</Label><Input id="edit-date" type="date" value={editForm.date} onChange={(e) => setEditForm(prev => prev && { ...prev, date: e.target.value })} /></div>
                    
                    <div>
                      <Label>Category</Label>
                      <Select value={editForm.category} onValueChange={(v) => setEditForm(prev => prev && { ...prev, category: v as Category })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="destructive" className="rounded-xl w-1/3 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-colors" onClick={() => {
                        deleteTransaction(editForm.id, uid);
                        setEditForm(null);
                      }}>
                        Delete
                      </Button>
                      <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors" onClick={handleUpdate}>Update Transaction</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | 'all')}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl"><SlidersHorizontal className="h-4 w-4 mr-1.5" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{categoryEmoji[c]} {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType | 'all')}>
              <SelectTrigger className="w-full sm:w-36 rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="w-1 p-0" />
                  <th
                    className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th
                    className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort('amount')}
                  >
                    <span className="flex items-center justify-end gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  {isAdmin && <th className="w-12" />}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <SlidersHorizontal className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No transactions match your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/20 last:border-0 transition-colors duration-150 hover:bg-muted/30"
                    >
                      {/* Distinct Rectangle Box Marker */}
                      <td className="w-1 p-0 pl-4 align-middle">
                        <div
                          className="h-8 w-2.5 rounded-md"
                          style={{ backgroundColor: t.type === 'income' ? 'hsl(var(--income))' : 'hsl(var(--expense))' }}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-card-foreground">{t.description}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium">
                          {categoryEmoji[t.category as Category]} {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          t.type === 'income'
                            ? 'bg-income-light text-income'
                            : 'bg-expense-light text-expense'
                        }`}>
                          {t.type === 'income' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                          {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-right font-semibold font-display tabular-nums ${
                        t.type === 'income' ? 'text-white' : 'text-expense'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3.5 text-right w-[100px]">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id, uid)} className="h-7 w-7 p-0 text-muted-foreground hover:text-expense rounded-xl">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditForm({...t, amount: t.amount.toString()})} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-xl">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
