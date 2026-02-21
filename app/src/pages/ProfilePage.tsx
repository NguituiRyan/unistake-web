import { useState, useEffect } from 'react';
import { User, Wallet, Target, TrendingUp, TrendingDown, Clock, Pencil, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, refreshUser } = useUser();
  const [bets, setBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Withdrawal States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bets?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        setBets(data);
      } catch (error) {
        console.error("Failed to load bets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBets();
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount) return;
    const amount = parseFloat(withdrawAmount);
    
    if (amount > user.balance) {
      return toast.error("Insufficient balance!");
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount }),
      });

      if (!response.ok) throw new Error("Failed to process withdrawal");

      toast.success(`Successfully withdrew Ksh ${amount} (Demo)`);
      setWithdrawAmount('');
      setIsWithdrawOpen(false);
      await refreshUser(); // Instantly updates the balance on screen!
    } catch (error) {
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!user) return null;

  // Categorize Bets
  const activeBets = bets.filter(b => !b.is_resolved);
  const pastBets = bets.filter(b => b.is_resolved);
  
  // Calculate Stats using the new backend 'status' field
  const wonBets = pastBets.filter(b => b.status === 'Won');
  const lostBets = pastBets.filter(b => b.status === 'Lost');
  const refundedBets = pastBets.filter(b => b.status === 'Refunded');
  
  const definitivePastBets = wonBets.length + lostBets.length;
  const winRate = definitivePastBets > 0 
    ? Math.round((wonBets.length / definitivePastBets) * 100) 
    : 0;
  
  // REAL Profit Calculation: Payouts Received - Stakes Placed
  const totalStakesResolved = pastBets.reduce((sum, bet) => sum + parseFloat(bet.amount_kes), 0);
  const totalPayoutsReceived = pastBets.reduce((sum, bet) => sum + parseFloat(bet.payout_kes || 0), 0);
  const profit = totalPayoutsReceived - totalStakesResolved;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border border-neon-blue/20 flex-shrink-0">
          <User className="h-8 w-8 text-neon-blue" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{user.nickname || 'Phantom'}</h1>
            <button className="p-1 hover:bg-zinc-800 rounded-md transition-colors">
              <Pencil className="h-4 w-4 text-zinc-500 hover:text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Mail className="h-4 w-4" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Phone className="h-4 w-4" />
            {user.phoneNumber || 'No phone number linked'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* UPDATED: Balance Card with Withdraw Button */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-500">Current Balance</p>
              <Wallet className="h-4 w-4 text-neon-green" />
            </div>
            <p className="text-2xl font-bold text-white mb-4">
              Ksh {user.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Button 
            onClick={() => setIsWithdrawOpen(true)}
            variant="outline" 
            className="w-full border-zinc-700 text-white hover:bg-zinc-800 transition-colors"
          >
            Withdraw Funds
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-500">Total Bets Placed</p>
            <Target className="h-4 w-4 text-neon-blue" />
          </div>
          <p className="text-2xl font-bold text-white">{bets.length}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {wonBets.length} won • {lostBets.length} lost
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-500">Profit / Loss</p>
            {profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-neon-green" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
            {profit > 0 ? '+' : ''}Ksh {profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-zinc-500 mt-1">{winRate}% win rate</p>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-zinc-900 border border-zinc-800 p-1 mb-6 rounded-xl h-auto">
          <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 py-3">
            <Clock className="h-4 w-4 mr-2" />
            Active Bets
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 py-3">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Past Payouts
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE BETS CONTENT */}
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <p className="text-zinc-500 text-center py-8">Loading your ledger...</p>
          ) : activeBets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-zinc-800 mb-4" />
              <p className="text-white font-medium mb-1">No Active Bets</p>
              <p className="text-sm text-zinc-500">Place a bet to see it here</p>
            </div>
          ) : (
            activeBets.map((bet) => {
              const pickName = bet.chosen_option === 'A' ? bet.option_a : (bet.chosen_option === 'B' ? bet.option_b : bet.chosen_option);
              return (
                <div key={bet.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">{bet.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Your Pick: <span className="text-neon-blue font-semibold">{pickName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">Ksh {parseFloat(bet.amount_kes).toFixed(0)}</p>
                    <p className="text-xs text-yellow-500 mt-1">Pending Resolution</p>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* PAST PAYOUTS CONTENT */}
        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <p className="text-zinc-500 text-center py-8">Loading your ledger...</p>
          ) : pastBets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-12 w-12 text-zinc-800 mb-4" />
              <p className="text-white font-medium mb-1">No Past Payouts</p>
              <p className="text-sm text-zinc-500">Resolved markets will appear here</p>
            </div>
          ) : (
            pastBets.map((bet) => {
              const isWin = bet.status === 'Won';
              const isRefund = bet.status === 'Refunded';
              const pickName = bet.chosen_option === 'A' ? bet.option_a : (bet.chosen_option === 'B' ? bet.option_b : bet.chosen_option);
              const winName = bet.winning_option === 'A' ? bet.option_a : (bet.winning_option === 'B' ? bet.option_b : bet.winning_option);
              
              return (
                <div key={bet.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between opacity-80">
                  <div>
                    <h4 className="text-white font-medium mb-1">{bet.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Your Pick: <span className="font-semibold text-white">{pickName}</span>
                    </p>
                    {!isRefund && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Winning Result: {winName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">Ksh {parseFloat(bet.payout_kes).toFixed(0)}</p>
                    {isRefund ? (
                      <p className="text-xs text-zinc-400 mt-1 font-medium bg-zinc-800 inline-block px-2 py-1 rounded-md">Refunded</p>
                    ) : isWin ? (
                      <p className="text-xs text-neon-green mt-1 font-medium bg-neon-green/10 inline-block px-2 py-1 rounded-md">Won</p>
                    ) : (
                      <p className="text-xs text-red-500 mt-1 font-medium bg-red-500/10 inline-block px-2 py-1 rounded-md">Lost</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* WITHDRAW MODAL */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Withdraw to M-Pesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            
            {/* Disclaimer Box */}
            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300 leading-relaxed">
                <span className="font-semibold text-blue-200">Demo Mode Active:</span> This will instantly deduct funds from your UniStake wallet, but live M-Pesa API integration is coming in the next update.
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-400">Amount to Withdraw (KES)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">Ksh</span>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 h-14 bg-zinc-900 border-zinc-800 text-white text-lg focus:border-neon-blue"
                  max={user.balance}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Min. withdrawal: Ksh 100</span>
                <span className="text-zinc-400">
                  Available: <span className="text-white font-medium">Ksh {user.balance.toLocaleString()}</span>
                </span>
              </div>
            </div>

            <Button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 100 || parseFloat(withdrawAmount) > user.balance}
              className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-semibold text-base transition-all"
            >
              {isWithdrawing ? (
                <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Processing...</span>
              ) : (
                'Confirm Withdrawal'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}