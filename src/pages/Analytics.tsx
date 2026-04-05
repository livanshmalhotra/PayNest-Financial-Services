import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useAllTransactions, useFinanceStore } from '@/store/useFinanceStore';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingDown, TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const COLORS = [
  'hsl(230, 65%, 58%)',
  'hsl(260, 60%, 60%)',
  'hsl(200, 70%, 52%)',
  'hsl(152, 55%, 46%)',
  'hsl(25, 85%, 56%)',
  'hsl(0, 72%, 54%)',
  'hsl(45, 85%, 52%)',
  'hsl(320, 60%, 54%)',
];

const categoryEmoji: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️',
  Bills: '📄', Salary: '💼', Freelance: '💻', Investment: '📈', Other: '📦',
};

export default function Analytics() {
  const { userData } = useAuth();
  const { transactions: storeTxs } = useFinanceStore();
  const allTransactions = useAllTransactions();

  const expenses = allTransactions.filter(t => t.type === 'expense');

  // ── Income: same formula as SummaryCards (Overview) ──────────────────────
  // Firebase baseline (onboarding) + any income transactions added in-app
  const baseIncome = userData?.income ?? 0;
  const txIncomeDelta = storeTxs
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = baseIncome + txIncomeDelta;

  // ── Total expenses (store delta + initial debt from Firebase gap) ─────────
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  // ── Category breakdown for expenses ──────────────────────────────────────
  const categoryMap = new Map<string, number>();
  for (const t of expenses) {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Monthly income vs expenses breakdown ─────────────────────────────────
  // Seed with Firebase baseline income attributed to the current month
  const currentMonthKey = new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  const monthlyMap = new Map<string, { expense: number; income: number }>();

  // Add Firebase baseline income to current month
  if (baseIncome > 0) {
    monthlyMap.set(currentMonthKey, { expense: 0, income: baseIncome });
  }

  // Layer in all store transactions (income + expense)
  for (const t of allTransactions) {
    const d = new Date(t.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const cur = monthlyMap.get(key) || { expense: 0, income: 0 };
    if (t.type === 'expense') cur.expense += t.amount;
    else cur.income += t.amount;
    monthlyMap.set(key, cur);
  }

  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, v]) => ({ month, ...v }))
    .slice(-6);

  const topCategory = categoryData[0];

  const tooltipStyle = {
    borderRadius: '1rem',
    border: '1px solid hsl(230, 20%, 88%, 0.5)',
    background: 'hsl(0, 0%, 100%, 0.9)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 24px hsl(230, 40%, 60%, 0.12)',
    color: 'hsl(222, 25%, 12%)',
  };

  return (
    <div className="flex-1 w-full">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Visual breakdown of your financial patterns</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="financial-card gradient-expenses flex items-center gap-4">
            <div className="p-3 rounded-xl bg-expense-light">
              <TrendingDown className="h-5 w-5 text-expense" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-expense font-display">₹{totalExpense.toLocaleString()}</p>
            </div>
          </div>
          <div className="financial-card gradient-transactions flex items-center gap-4">
            <div className="p-3 rounded-xl bg-income-light">
              <TrendingUp className="h-5 w-5 text-income" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Income</p>
              <p className="text-xl font-bold text-income font-display">₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="financial-card gradient-spending flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent">
              <PieIcon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Top Expense Category</p>
              <p className="text-lg font-bold font-display text-card-foreground truncate">
                {topCategory ? `${categoryEmoji[topCategory.name] || '📦'} ${topCategory.name}` : '—'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart — Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="financial-card gradient-spending chart-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-display font-semibold text-card-foreground">Spending by Category</h2>
            </div>
            <div className="h-72">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No expense data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieShadowA" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(230, 40%, 20%)" floodOpacity="0.12" />
                      </filter>
                    </defs>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={95}
                      paddingAngle={4} cornerRadius={8}
                      dataKey="value" stroke="transparent"
                      style={{ filter: 'url(#pieShadowA)' }}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`₹${Number(v).toLocaleString()}`, n]}
                      contentStyle={tooltipStyle}
                    />
                    <Legend
                      iconType="circle"
                      formatter={(v) => (
                        <span className="text-xs font-medium text-muted-foreground">
                          {categoryEmoji[v] || ''} {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Bar Chart — Category vs Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="financial-card gradient-balance chart-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-display font-semibold text-card-foreground">Expenses by Category</h2>
            </div>
            <div className="h-72">
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No expense data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(230, 65%, 58%)" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="hsl(260, 60%, 60%)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 85%)" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(230, 10%, 55%)"
                      tickFormatter={(v) => (categoryEmoji[v] || '') + ' ' + (v.length > 6 ? v.slice(0, 5) + '…' : v)}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(230, 10%, 55%)"
                      tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Amount']}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="financial-card gradient-transactions chart-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-display font-semibold text-card-foreground">Monthly Income vs Expenses</h2>
          </div>
          <div className="h-72">
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 55%, 46%)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="hsl(152, 55%, 46%)" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 54%)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 54%)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 85%)" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(230, 10%, 55%)" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(230, 10%, 55%)"
                    tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip
                    formatter={(v, n) => [`₹${Number(v).toLocaleString()}`, n === 'income' ? 'Income' : 'Expenses']}
                    contentStyle={tooltipStyle}
                  />
                  <Legend formatter={(v) => <span className="text-xs font-medium text-muted-foreground capitalize">{v}</span>} />
                  <Bar dataKey="income" fill="url(#incomeBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="expense" fill="url(#expenseBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
