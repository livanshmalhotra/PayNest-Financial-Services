import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAllTransactions } from '@/store/useFinanceStore';

const COLORS = [
  'hsl(0, 72%, 51%)',
  'hsl(25, 85%, 55%)',
  'hsl(45, 85%, 50%)',
  'hsl(152, 60%, 42%)',
  'hsl(200, 70%, 50%)',
  'hsl(260, 60%, 55%)',
  'hsl(320, 60%, 50%)',
  'hsl(180, 55%, 45%)',
];

const SpendingChart = () => {
  const transactions = useAllTransactions();
  const expenses = transactions.filter((t) => t.type === 'expense');

  const categoryMap = new Map<string, number>();
  for (const t of expenses) {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  }

  const data = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="financial-card gradient-spending chart-card"
    >
      <h3 className="text-lg font-display font-semibold text-card-foreground mb-4">Spending by Category</h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No expenses yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="hsl(230, 40%, 20%)" floodOpacity="0.15" />
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                cornerRadius={8}
                dataKey="value"
                stroke="transparent"
                style={{ filter: 'url(#pieShadow)' }}
              >
                {data.map((_, i) => (
                  <Cell 
                    key={i} 
                    fill={COLORS[i % COLORS.length]} 
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value,name) => [`₹${Number(value ?? 0).toLocaleString()}`, name]}
                contentStyle={{
                  borderRadius: '1rem',
                  border: '1px solid hsl(230, 20%, 88%, 0.5)',
                  background: 'hsl(0, 0%, 100%, 0.8)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 24px hsl(230, 40%, 60%, 0.1)',
                }}
              />
              <Legend 
                iconType="circle"
                formatter={(value) => <span className="text-sm font-medium text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default SpendingChart;
