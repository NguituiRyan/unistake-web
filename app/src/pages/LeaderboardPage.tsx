import { useState, useEffect } from 'react';
import { Trophy, Medal, Target, TrendingUp, Activity, Loader2, Award } from 'lucide-react';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardUser } from '@/types';
import { toast } from 'sonner';

type LeaderboardMode = 'wealth' | 'accuracy' | 'volume';

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<LeaderboardMode>('wealth');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (error) {
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // --- DYNAMIC SORTING LOGIC ---
  const sortedUsers = [...users].sort((a, b) => {
    if (activeMode === 'wealth') {
      return b.balance - a.balance;
    }
    if (activeMode === 'accuracy') {
      // The Oracle Rule: Must have at least 3 trades to rank for accuracy!
      const aValid = a.totalBets >= 3;
      const bValid = b.totalBets >= 3;
      
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      
      // If win rates are tied, the person with MORE trades wins the tiebreaker
      return b.winRate - a.winRate || b.totalBets - a.totalBets;
    }
    if (activeMode === 'volume') {
      return b.totalBets - a.totalBets;
    }
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const topThree = sortedUsers.slice(0, 3);
  const theRest = sortedUsers.slice(3);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="h-16 w-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Campus Oracles</h1>
        <p className="text-zinc-400 max-w-lg mb-8">
          The top forecasters on the platform. Build your reputation through accurate predictions.
        </p>

        {/* MODE TOGGLES */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md">
          <button
            onClick={() => setActiveMode('wealth')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${
              activeMode === 'wealth' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Wealth
          </button>
          <button
            onClick={() => setActiveMode('accuracy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${
              activeMode === 'accuracy' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Target className="h-4 w-4" /> Accuracy
          </button>
          <button
            onClick={() => setActiveMode('volume')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${
              activeMode === 'volume' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity className="h-4 w-4" /> Volume
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
          <p>Compiling market data...</p>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
          <Award className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No traders have hit the board yet.</p>
        </div>
      ) : (
        <>
          {/* THE PODIUM (TOP 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
            
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center relative md:order-1 order-2 md:h-[90%]">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-zinc-400 to-zinc-300 rounded-t-2xl opacity-50" />
                <Medal className="h-8 w-8 text-zinc-400 mb-2" />
                <h3 className="text-lg font-bold text-white mb-1">{topThree[1].nickname}</h3>
                <div className="text-2xl font-black text-zinc-300 mb-4">
                  {activeMode === 'wealth' && formatCurrency(topThree[1].balance)}
                  {activeMode === 'accuracy' && `${topThree[1].winRate}%`}
                  {activeMode === 'volume' && topThree[1].totalBets}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <div className="bg-zinc-950 p-2 rounded-lg">Trades: {topThree[1].totalBets}</div>
                  <div className="bg-zinc-950 p-2 rounded-lg">Win: {topThree[1].winRate}%</div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {topThree[0] && (
              <div className="bg-zinc-900 border-2 border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center text-center relative md:order-2 order-1 shadow-[0_0_30px_rgba(234,179,8,0.1)] md:-translate-y-4">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-t-2xl" />
                <Trophy className="h-10 w-10 text-yellow-500 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <h3 className="text-xl font-bold text-white mb-1">{topThree[0].nickname}</h3>
                <div className="text-3xl font-black text-yellow-500 mb-4">
                  {activeMode === 'wealth' && formatCurrency(topThree[0].balance)}
                  {activeMode === 'accuracy' && `${topThree[0].winRate}%`}
                  {activeMode === 'volume' && topThree[0].totalBets}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <div className="bg-zinc-950 p-2 rounded-lg">Trades: {topThree[0].totalBets}</div>
                  <div className="bg-zinc-950 p-2 rounded-lg">Win: {topThree[0].winRate}%</div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center relative md:order-3 order-3 md:h-[80%]">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-700 to-amber-600 rounded-t-2xl opacity-50" />
                <Medal className="h-8 w-8 text-amber-600 mb-2" />
                <h3 className="text-lg font-bold text-white mb-1">{topThree[2].nickname}</h3>
                <div className="text-2xl font-black text-amber-600 mb-4">
                  {activeMode === 'wealth' && formatCurrency(topThree[2].balance)}
                  {activeMode === 'accuracy' && `${topThree[2].winRate}%`}
                  {activeMode === 'volume' && topThree[2].totalBets}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <div className="bg-zinc-950 p-2 rounded-lg">Trades: {topThree[2].totalBets}</div>
                  <div className="bg-zinc-950 p-2 rounded-lg">Win: {topThree[2].winRate}%</div>
                </div>
              </div>
            )}
          </div>

          {/* THE LIST (RANKS 4-100) */}
          {theRest.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-zinc-800/50">
                {theRest.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="w-8 text-center text-zinc-500 font-bold text-lg">
                      #{index + 4}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{user.nickname}</h4>
                      <div className="flex gap-3 mt-1 text-[11px] text-zinc-500 uppercase tracking-wider">
                        <span>{user.totalBets} Trades</span>
                        <span>•</span>
                        <span>{user.winRate}% Conviction</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-lg">
                        {activeMode === 'wealth' && formatCurrency(user.balance)}
                        {activeMode === 'accuracy' && `${user.winRate}%`}
                        {activeMode === 'volume' && user.totalBets}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}