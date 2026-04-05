import SummaryCards from '@/components/dashboard/SummaryCards';
import BalanceChart from '@/components/dashboard/BalanceChart';
import SpendingChart from '@/components/dashboard/SpendingChart';
import TransactionList from '@/components/dashboard/TransactionList';
import InsightsSection from '@/components/dashboard/InsightsSection';
import OnboardingModal from '@/components/dashboard/OnboardingModal';

const Index = () => {
  return (
    <div className="flex-1 w-full relative">
      <OnboardingModal />
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <SummaryCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BalanceChart />
          <SpendingChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
          <InsightsSection />
        </div>
      </main>
    </div>
  );
};

export default Index;
