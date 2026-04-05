import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuth } from '@/contexts/AuthContext';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const cards = [
  { key: 'balance', label: 'Total Balance', icon: IndianRupee, gradient: 'gradient-balance', glow: 'glow-primary' },
  { key: 'income', label: 'Total Income', icon: TrendingUp, gradient: 'gradient-transactions', glow: 'glow-income' },
  { key: 'expenses', label: 'Total Expenses', icon: TrendingDown, gradient: 'gradient-expenses', glow: 'glow-expense' },
] as const;

const colorMap = {
  balance: { icon: 'text-balance', bg: 'bg-balance-light', text: 'text-balance-foreground' },
  income: { icon: 'text-income', bg: 'bg-income-light', text: 'text-income-foreground' },
  expenses: { icon: 'text-expense', bg: 'bg-expense-light', text: 'text-expense-foreground' },
} as const;

const SummaryCards = () => {
  const { userData } = useAuth();
  const { transactions } = useFinanceStore();

  // Firebase baseline values (from onboarding)
  const baseIncome  = userData?.income  ?? 0;
  const baseBalance = userData?.balance ?? 0;

  // Initial debt from onboarding: if balance < income, the gap is pre-existing expenses
  const baseExpenses = baseIncome > baseBalance ? baseIncome - baseBalance : 0;

  // Deltas from user-added transactions in the local store
  const txIncomeDelta  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const txExpenseDelta = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Final live values
  const income   = baseIncome + txIncomeDelta;
  const expenses = baseExpenses + txExpenseDelta;
  const balance  = income - expenses;

  const values = { balance, income, expenses };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`financial-card ${card.gradient} ${card.glow} group cursor-default animate-float`}
          style={{ animationDelay: `${i * 0.5}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
            <div className={`p-2 rounded-xl ${colorMap[card.key].bg} backdrop-blur-sm`}>
              <card.icon className={`h-4 w-4 ${colorMap[card.key].icon}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold font-display ${colorMap[card.key].text}`}>
            {formatCurrency(values[card.key])}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
