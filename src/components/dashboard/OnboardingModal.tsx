import { useState, useEffect } from 'react';
import { IndianRupee, HandCoins, ArrowRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, type UserData } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OnboardingModal() {
  const { currentUser, docExists, refreshUserData, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [income, setIncome] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If auth is loaded, we have a currentUser, but the docExists is false, show onboarding.
    // docExists explicitly checks in Firestore when Auth state changes.
    if (!authLoading && currentUser && docExists === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [currentUser, docExists, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const numIncome = parseFloat(income);
    const numBalance = parseFloat(balance);

    if (isNaN(numIncome) || numIncome < 0) {
      toast.error("Please enter a valid (non-negative) total income.");
      return;
    }
    
    if (isNaN(numBalance) || numBalance < 0) {
      toast.error("Please enter a valid (non-negative) base balance.");
      return;
    }

    setLoading(true);
    try {
      const newUserDoc: UserData = {
        uid: currentUser.uid,
        email: currentUser.email || undefined,
        displayName: currentUser.displayName || undefined,
        income: numIncome,
        balance: numBalance,
        // @ts-ignore - appending createdAt which might not be strictly defined in interface
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", currentUser.uid), newUserDoc);
      await refreshUserData(currentUser.uid);
      
      toast.success("Profile setup complete!");
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Error setting up profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Prevent closing by clicking outside during critical onboarding
  const handleOpenChange = (newOpen: boolean) => {
    // only allow programmatic closing once they finish
    if (!newOpen && docExists) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-border/50 bg-background/80 backdrop-blur-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-display font-bold text-center flex flex-col items-center gap-2">
            <span className="text-4xl">👋</span>
            Welcome! Let's set up your profile
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter your financial starting details to kick off your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2 relative group">
              <Label htmlFor="income" className="flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-income" />
                Monthly Income
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="income"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="pl-9 bg-background/50 transition-all duration-300 focus:bg-background group-hover:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 relative group">
              <Label htmlFor="balance" className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-balance flex items-center justify-center">
                  <span className="text-[10px] font-bold text-balance-foreground">₹</span>
                </div>
                Starting Balance
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="pl-9 bg-background/50 transition-all duration-300 focus:bg-background group-hover:border-primary/50"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-500 hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <span className="flex items-center gap-2">
                Complete Setup <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
