import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';

const InsightsSection = () => {
  const { transactions } = useFinanceStore();
  const expenses = transactions.filter((t) => t.type === 'expense');

  const categoryMap = new Map<string, number>();
  for (const t of expenses) categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthExpenses = expenses.filter((t) => t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0);
  const prevMonthExpenses = expenses.filter((t) => t.date.startsWith(prevMonth)).reduce((s, t) => s + t.amount, 0);
  const changePercent = prevMonthExpenses > 0 ? ((thisMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0;
  const spendingUp = changePercent > 0;

  const insights = [
    {
      icon: BarChart3,
      title: 'Top Spending',
      value: topCategory ? `${topCategory[0]} — ₹${topCategory[1].toLocaleString()}` : 'No data',
      color: 'text-primary',
      bg: 'bg-balance-light',
    },
    {
      icon: spendingUp ? TrendingUp : TrendingDown,
      title: 'Monthly Trend',
      value: prevMonthExpenses > 0
        ? `Spending ${spendingUp ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(0)}%`
        : 'Not enough data',
      color: spendingUp ? 'text-expense' : 'text-income',
      bg: spendingUp ? 'bg-expense-light' : 'bg-income-light',
    },
    {
      icon: AlertCircle,
      title: 'Observation',
      value: topCategory && topCategory[1] > 500
        ? `${topCategory[0]} spending is high this period`
        : 'Spending looks healthy',
      color: 'text-muted-foreground',
      bg: 'bg-secondary',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="financial-card gradient-insights"
    >
      <h3 className="text-lg font-display font-semibold text-card-foreground mb-4">Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${insight.bg} backdrop-blur-sm border border-border/30`}
          >
            <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">{insight.title}</p>
              <p className="text-sm font-medium text-card-foreground">{insight.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InsightsSection;
