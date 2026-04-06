import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Trash2, Plus, MoreVertical } from 'lucide-react';
import { useFinanceStore, useFilteredTransactions, type Category, type TransactionType } from '@/store/useFinanceStore';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const categories: Category[] = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Salary', 'Freelance', 'Investment', 'Other'];

const TransactionList = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';
  const {
    role, searchQuery, filterCategory, filterType, sortBy, sortOrder,
    setSearchQuery, setFilterCategory, setFilterType, setSortBy, setSortOrder,
    addTransaction, deleteTransaction, updateTransaction,
  } = useFinanceStore();
  const filtered = useFilteredTransactions();
  const isAdmin = role === 'admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: 'Other' as Category, type: 'expense' as TransactionType, date: new Date().toISOString().split('T')[0] });
  const [editForm, setEditForm] = useState<{ id: string, description: string, amount: string, category: Category, type: TransactionType, date: string } | null>(null);

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

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="financial-card gradient-transactions"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-display font-semibold text-card-foreground">Transactions</h3>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-xl">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>New Transaction</DialogTitle>
                <DialogDescription className="sr-only">Fill in the details to add a new transaction.</DialogDescription>
              </DialogHeader>
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

                <div><Label htmlFor="new-list-desc">Description</Label><Input id="new-list-desc" value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} /></div>
                <div><Label htmlFor="new-list-amount">Amount</Label><Input id="new-list-amount" type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} /></div>
                <div><Label htmlFor="new-list-date">Date</Label><Input id="new-list-date" type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} /></div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v as Category })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAdd}
                  className="w-full rounded-xl font-semibold text-white shadow-lg
                    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                    hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400
                    active:from-indigo-700 active:via-purple-700 active:to-pink-700
                    active:scale-[0.97] active:shadow-inner
                    transition-all duration-150 border-0"
                >
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Update Transaction Dialog */}
        <Dialog open={!!editForm} onOpenChange={(open) => !open && setEditForm(null)}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Update Transaction</DialogTitle>
              <DialogDescription className="sr-only">Edit the details of this transaction.</DialogDescription>
            </DialogHeader>
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

                <div><Label htmlFor="edit-list-desc">Description</Label><Input id="edit-list-desc" value={editForm.description} onChange={(e) => setEditForm(prev => prev && { ...prev, description: e.target.value })} /></div>
                <div><Label htmlFor="edit-list-amount">Amount</Label><Input id="edit-list-amount" type="number" value={editForm.amount} onChange={(e) => setEditForm(prev => prev && { ...prev, amount: e.target.value })} /></div>
                <div><Label htmlFor="edit-list-date">Date</Label><Input id="edit-list-date" type="date" value={editForm.date} onChange={(e) => setEditForm(prev => prev && { ...prev, date: e.target.value })} /></div>
                
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | 'all')}>
          <SelectTrigger className="w-full sm:w-36 rounded-xl"><SlidersHorizontal className="h-4 w-4 mr-1.5" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="all">All Categories</SelectItem></SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType | 'all')}>
          <SelectTrigger className="w-full sm:w-32 rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
        </Select>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-3">
        <Button variant="ghost" size="sm" onClick={() => toggleSort('date')} className="gap-1 text-xs text-muted-foreground rounded-xl">
          <ArrowUpDown className="h-3 w-3" /> Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggleSort('amount')} className="gap-1 text-xs text-muted-foreground rounded-xl">
          <ArrowUpDown className="h-3 w-3" /> Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Distinct Rectangle Box Marker */}
                  <div 
                    className="h-10 w-2.5 rounded-md shrink-0" 
                    style={{ backgroundColor: t.type === 'income' ? 'hsl(var(--income))' : 'hsl(var(--expense))' }} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {t.category}
                  </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-white' : 'text-expense'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </span>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id, uid)} className="h-7 w-7 p-0 text-muted-foreground hover:text-expense rounded-xl">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditForm({...t, amount: t.amount.toString()})} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-xl">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionList;
