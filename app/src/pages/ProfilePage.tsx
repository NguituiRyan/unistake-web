import { useState, useEffect } from 'react';
import { User, Wallet, Target, TrendingUp, TrendingDown, Clock, Pencil, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function ProfilePage() {
  const { user } = useUser();
  const [bets, setBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (!user) return null;

  // Categorize Bets
  const activeBets = bets.filter(b => !b.is_resolved);
  const pastBets = bets.filter(b => b.is_resolved);
  
  // THE TRANSLATOR: Checks if they won regardless of if the DB saved 'A' or the actual name 'ry'
  const isBetWinner = (b: any) => {
    if (!b.is_resolved || !b.winning_option) return false;
    if (b.chosen_option === b.winning_option) return true;
    
    const actualPickName = b.chosen_option === 'A' ? b.option_a : (b.chosen_option === 'B' ? b.option_b : b.chosen_option);
    return actualPickName === b.winning_option;
  };

  // Calculate Stats
  const wonBets = pastBets.filter(b => isBetWinner(b));
  const lostBets = pastBets.filter(b => !isBetWinner(b) && b.winning_option !== null);
  
  const winRate = pastBets.length > 0 ? Math.round((wonBets.length / pastBets.length) * 100) : 0;
  
  // Profit Calculation
  const totalWon = wonBets.reduce((sum, bet) => sum + parseFloat(bet.amount_kes), 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + parseFloat(bet.amount_kes), 0);
  const profit = totalWon - totalLost;

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
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-500">Current Balance</p>
            <Wallet className="h-4 w-4 text-neon-green" />
          </div>
          <p className="text-2xl font-bold text-white">
            Ksh {user.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
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
          <TabsTrigger 
            value="active" 
            className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 py-3"
          >
            <Clock className="h-4 w-4 mr-2" />
            Active Bets
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 py-3"
          >
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
              const isWin = isBetWinner(bet);
              const pickName = bet.chosen_option === 'A' ? bet.option_a : (bet.chosen_option === 'B' ? bet.option_b : bet.chosen_option);
              const winName = bet.winning_option === 'A' ? bet.option_a : (bet.winning_option === 'B' ? bet.option_b : bet.winning_option);
              
              return (
                <div key={bet.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between opacity-80">
                  <div>
                    <h4 className="text-white font-medium mb-1">{bet.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Your Pick: <span className="font-semibold text-white">{pickName}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Winning Result: {winName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">Ksh {parseFloat(bet.amount_kes).toFixed(0)}</p>
                    {isWin ? (
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
    </main>
  );
}