import { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, Activity, History, ShieldCheck, ArrowUpRight, ArrowDownRight, CircleSlash } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

// The interface matching our backend /api/bets endpoint
interface BetHistory {
  id: number;
  title: string;
  chosen_option: 'A' | 'B';
  amount_kes: string;
  placed_at: string;
  is_resolved: boolean;
  winning_option: string | null;
  option_a: string;
  option_b: string;
  status: 'Won' | 'Lost' | 'Pending' | 'Refunded';
  payout_kes: number;
}

export function ProfilePage() {
  const { user } = useUser();
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`https://unistake-backend.onrender.com/api/bets?email=${user.email}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        toast.error('Could not load trading history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // --- CALCULATE TRADER STATS DYNAMICALLY ---
  const stats = useMemo(() => {
    let resolvedCount = 0;
    let wonCount = 0;
    let totalStaked = 0;
    let totalYield = 0;

    history.forEach(trade => {
      const stake = parseFloat(trade.amount_kes);
      totalStaked += stake;

      if (trade.status === 'Won') {
        wonCount++;
        resolvedCount++;
        totalYield += (trade.payout_kes - stake); // Pure profit
      } else if (trade.status === 'Lost') {
        resolvedCount++;
        totalYield -= stake; // Pure loss
      }
      // We ignore 'Pending' and 'Refunded' for accuracy math!
    });

    const convictionScore = resolvedCount > 0 ? Math.round((wonCount / resolvedCount) * 100) : 0;

    return {
      convictionScore,
      resolvedCount,
      wonCount,
      totalStaked,
      totalYield
    };
  }, [history]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="h-20 w-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg shrink-0">
          <ShieldCheck className="h-10 w-10 text-neon-blue" />
        </div>
        
        <div className="text-center sm:text-left z-10">
          <h1 className="text-2xl font-bold text-white mb-1">{user.nickname}</h1>
          <p className="text-zinc-400 text-sm mb-3">{user.email}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-xs text-zinc-500">Available Capital:</span>
            <span className="text-sm font-bold text-neon-green">{formatCurrency(user.balance)}</span>
          </div>
        </div>
      </div>

      {/* STATS DASHBOARD */}
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-neon-blue" />
        Performance Analytics
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        
        {/* The Conviction Score (Accuracy) */}
        <Card className="bg-zinc-900 border-zinc-800 p-4 relative overflow-hidden group">
          <div className={`absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 ${
            stats.convictionScore >= 70 ? 'bg-neon-green' : stats.convictionScore >= 40 ? 'bg-yellow-500' : 'bg-rose-500'
          }`} />
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Conviction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.convictionScore}%</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{stats.wonCount} of {stats.resolvedCount} correct</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Net Yield</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold ${stats.totalYield >= 0 ? 'text-neon-green' : 'text-rose-500'}`}>
              {stats.totalYield > 0 ? '+' : ''}{formatCurrency(stats.totalYield)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">All-time profit/loss</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <History className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Positions</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{history.length}</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Total lifetime trades</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Volume</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{formatCurrency(stats.totalStaked)}</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Total capital deployed</p>
        </Card>

      </div>

      {/* TRADING LEDGER */}
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-neon-blue" />
        Trading Ledger
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading ledger...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No trading history found. Take a position!</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {history.map((trade) => (
              <div key={trade.id} className="p-4 sm:p-5 hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Market Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      trade.status === 'Won' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' :
                      trade.status === 'Lost' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      trade.status === 'Refunded' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {trade.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(trade.placed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-white line-clamp-2">{trade.title}</h4>
                </div>

                {/* Trade Math */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0 bg-zinc-950/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Position</p>
                    <p className="text-sm font-semibold text-zinc-300">
                      {trade.chosen_option === 'A' ? trade.option_a : trade.option_b}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Stake: {formatCurrency(parseFloat(trade.amount_kes))}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Yield</p>
                    <p className={`text-sm font-bold flex items-center justify-end gap-1 ${
                      trade.status === 'Won' ? 'text-neon-green' : 
                      trade.status === 'Lost' ? 'text-rose-500' : 
                      'text-white'
                    }`}>
                      {trade.status === 'Won' && <ArrowUpRight className="h-3.5 w-3.5" />}
                      {trade.status === 'Lost' && <ArrowDownRight className="h-3.5 w-3.5" />}
                      {trade.status === 'Refunded' && <CircleSlash className="h-3.5 w-3.5" />}
                      {trade.status === 'Pending' ? '--' : formatCurrency(trade.payout_kes)}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}