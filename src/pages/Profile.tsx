import { useState, useEffect } from 'react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { setTransactionInFirestore } from '@/lib/transactionService';
import { useAuth, type UserData } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Mail, Contact, Sparkles, IndianRupee, HandCoins } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { currentUser, userData, refreshUserData } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.displayName || '');
      setUsername(userData.username || '');
      setOccupation(userData.occupation || '');
      setIncome(userData.income !== undefined ? userData.income.toString() : '');
      setBalance(userData.balance !== undefined ? userData.balance.toString() : '');
    } else if (currentUser) {
      setName(currentUser.displayName || '');
    }
  }, [userData, currentUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const parsedIncome = income ? parseFloat(income) : undefined;
      const parsedBalance = balance ? parseFloat(balance) : undefined;

      const updatedData: Partial<UserData> = {
        displayName: name || undefined,
        username: username || undefined,
        occupation: occupation || undefined,
        income: parsedIncome,
        balance: parsedBalance,
        email: currentUser.email || undefined,
        uid: currentUser.uid,
      };

      // 1. Update Firebase Auth Profile
      if (name) {
        await updateAuthProfile(currentUser, { displayName: name });
      }
      
      // 2. Update Firestore user document
      await setDoc(doc(db, "users", currentUser.uid), updatedData, { merge: true });

      // 3. Write the initial payment ONCE if income > balance and it hasn't been created yet
      if (
        parsedIncome !== undefined &&
        parsedBalance !== undefined &&
        parsedIncome > parsedBalance
      ) {
        const txRef = doc(db, 'users', currentUser.uid, 'transactions', 'initial-payment');
        const txSnap = await getDoc(txRef);
        if (!txSnap.exists()) {
          await setTransactionInFirestore(currentUser.uid, {
            id: 'initial-payment',
            date: new Date().toISOString().split('T')[0],
            amount: parsedIncome - parsedBalance,
            category: 'Other',
            type: 'expense',
            description: 'Initial Payment',
          });
        }
      }

      // 4. Refresh context data
      await refreshUserData();
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and financial baseline.</p>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Personal Details */}
          <div className="space-y-6">
            <Card className="glass-card border-border/50 shadow-lg h-full transition-all duration-300 hover:shadow-xl hover:border-primary/20">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your public identity on FinTrack.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="bg-muted/30 cursor-not-allowed border-border/50 text-muted-foreground"
                  />
                  <p className="text-[0.75rem] text-muted-foreground pl-1">Email is managed by your sign-in provider.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                    <Contact className="w-4 h-4" /> Display Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. John Doe"
                    required
                    className="bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground font-bold pl-1">@</span> Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe123"
                    className="bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="w-4 h-4" /> Occupation
                  </Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="E.g. Software Engineer"
                    className="bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Financial Baseline */}
          <div className="space-y-6">
            <Card className="glass-card border-border/50 shadow-lg h-full transition-all duration-300 hover:shadow-xl hover:border-income/20 bg-gradient-to-br from-background via-background to-secondary/30">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Financial Baseline
                </CardTitle>
                <CardDescription>
                  These values set the foundation for your dashboard data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                
                <div className="space-y-2 relative group mt-2">
                  <Label htmlFor="income" className="flex items-center gap-2 text-sm font-medium">
                    <HandCoins className="w-4 h-4 text-income" /> 
                    Monthly Total Income
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="income"
                      type="number"
                      min="0"
                      step="0.01"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="0.00"
                      className="pl-9 bg-background/50 focus:bg-background transition-colors text-lg font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group mt-4">
                  <Label htmlFor="balance" className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-4 h-4 rounded-full bg-balance flex items-center justify-center">
                      <span className="text-[10px] font-bold text-balance-foreground">₹</span>
                    </div>
                    Starting Dashboard Balance
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="balance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="pl-9 bg-background/50 focus:bg-background transition-colors text-lg font-medium"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* Global Save Button */}
        <div className="mt-8 flex justify-end pb-12">
          <Button 
            type="submit" 
            size="lg"
            className="rounded-xl px-10 border-0 shadow-lg bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-orange-500/25 hover:-translate-y-0.5" 
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </Button>
        </div>
      </form>
    </div>
  );
}
