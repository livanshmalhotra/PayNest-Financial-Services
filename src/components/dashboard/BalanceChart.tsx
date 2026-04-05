import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAllTransactions } from '@/store/useFinanceStore';
import { useAuth } from '@/contexts/AuthContext';

const BalanceChart = () => {
  const transactions = useAllTransactions();
  const { userData } = useAuth();

  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const dailyMap = new Map<string, number>();
  
  let runningIncome = userData?.income ?? 0;
  let runningExpense = 0;

  if (sorted.length > 0) {
    for (const t of sorted) {
      if (t.type === 'income') runningIncome += t.amount;
      else runningExpense += t.amount;
      
      dailyMap.set(t.date, runningIncome - runningExpense);
    }
  } else {
    // Fallback if there are no transactions at all
    dailyMap.set(new Date().toISOString().split('T')[0], runningIncome - runningExpense);
  }

  const data = Array.from(dailyMap.entries()).map(([date, balance]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="financial-card gradient-balance chart-card"
    >
      <h3 className="text-lg font-display font-semibold text-card-foreground mb-4">Balance Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(230, 65%, 55%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(230, 65%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 85%)" strokeOpacity={0.4} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(230, 10%, 50%)" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(230, 10%, 50%)"
              tickFormatter={(v: number | string) => `₹${v}`}
            />
            <Tooltip
              formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, 'Balance']}
              contentStyle={{
                borderRadius: '1rem',
                border: '1px solid hsl(230, 20%, 88%, 0.5)',
                background: 'hsl(0, 0%, 100%, 0.8)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px hsl(230, 40%, 60%, 0.1)',
              }}
            />
            <Area type="monotone" dataKey="balance" stroke="hsl(230, 65%, 55%)" fill="url(#balanceGradient)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default BalanceChart;
