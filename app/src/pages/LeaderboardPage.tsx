import { useState, useEffect,Fragment } from 'react';
import { Target, TrendingUp, Activity, Loader2, ChevronDown, ChevronUp, History, CircleSlash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardUser } from '@/types';
import { toast } from 'sonner';

type SortColumn = 'accuracy' | 'wealth' | 'volume';

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>('accuracy');
  const [sortDesc, setSortDesc] = useState(true);
  
  // Expanded Row State
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortColumn(column);
      setSortDesc(true);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortColumn === 'accuracy') {
      // The Oracle Rule: Must have 3+ trades to rank high in accuracy
      const aValid = a.totalBets >= 3;
      const bValid = b.totalBets >= 3;
      if (aValid && !bValid) return sortDesc ? -1 : 1;
      if (!aValid && bValid) return sortDesc ? 1 : -1;
      
      valA = a.winRate;
      valB = b.winRate;
      // Tie-breaker: whoever has more trades
      if (valA === valB) return b.totalBets - a.totalBets;
    } else if (sortColumn === 'wealth') {
      valA = a.balance;
      valB = b.balance;
    } else if (sortColumn === 'volume') {
      valA = a.totalBets;
      valB = b.totalBets;
    }

    return sortDesc ? valB - valA : valA - valB;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency', currency: 'KES', minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      
      {/* COMPACT HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-neon-blue" />
            Global Leaderboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Click a header to sort. Click a trader to view their history.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            
            {/* TABLE HEADER (Clickable to sort!) */}
            <thead className="bg-zinc-950/50 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-4 w-16 text-center font-semibold">Rank</th>
                <th className="px-4 py-4 font-semibold">Trader</th>
                
                <th 
                  className="px-4 py-4 font-semibold cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('accuracy')}
                >
                  <div className="flex items-center gap-1">
                    <Target className={`h-3.5 w-3.5 ${sortColumn === 'accuracy' ? 'text-neon-blue' : ''}`} />
                    Accuracy
                    {sortColumn === 'accuracy' && (sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
                
                <th 
                  className="px-4 py-4 font-semibold cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center gap-1">
                    <Activity className={`h-3.5 w-3.5 ${sortColumn === 'volume' ? 'text-neon-pink' : ''}`} />
                    Trades
                    {sortColumn === 'volume' && (sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
                
                <th 
                  className="px-4 py-4 font-semibold text-right cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('wealth')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className={`h-3.5 w-3.5 ${sortColumn === 'wealth' ? 'text-neon-green' : ''}`} />
                    Wealth
                    {sortColumn === 'wealth' && (sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-zinc-800/50">
              {sortedUsers.map((user, index) => {
                const isExpanded = expandedUserId === user.id;
                
                // Podium Colors
                const rankColor = 
                  index === 0 ? 'text-yellow-500 font-black' :
                  index === 1 ? 'text-zinc-300 font-bold' :
                  index === 2 ? 'text-amber-600 font-bold' :
                  'text-zinc-600 font-medium';

                // Accuracy Colors
                const accuracyColor = 
                  user.winRate >= 70 ? 'text-neon-green' :
                  user.winRate >= 40 ? 'text-yellow-500' :
                  'text-rose-500';

                return (
                  <Fragment key={user.id}>
                    {/* MAIN ROW */}
                    <tr 
                      onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                      className={`group cursor-pointer transition-colors ${isExpanded ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/20'}`}
                    >
                      <td className={`px-4 py-4 text-center ${rankColor} text-sm`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700">
                            {user.nickname.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white group-hover:text-neon-blue transition-colors">
                            {user.nickname}
                          </span>
                        </div>
                      </td>

                      <td className={`px-4 py-4 font-bold ${accuracyColor}`}>
                        {user.winRate}%
                      </td>

                      <td className="px-4 py-4 text-zinc-300 font-medium">
                        {user.totalBets}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-white">
                        {formatCurrency(user.balance)}
                      </td>
                    </tr>

                    {/* EXPANDED PROFILE (PUBLIC LEDGER) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0 border-b border-zinc-800">
                          <div className="bg-zinc-950/50 px-6 py-4 border-l-2 border-neon-blue animate-in slide-in-from-top-2 duration-200">
                            <PublicTraderHistory email={user.email} nickname={user.nickname} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: PUBLIC TRADER HISTORY ---
// Fetches the selected user's recent bets when their row is expanded!
function PublicTraderHistory({ email, nickname }: { email: string, nickname: string }) {
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://unistake-backend.onrender.com/api/bets?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          // Only show their 3 most recent resolved/active trades to keep it clean
          setRecentTrades(data.slice(0, 3)); 
        }
      } catch (err) {
        console.error("Failed to fetch user history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [email]);

  if (loading) return <div className="text-xs text-zinc-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Loading {nickname}'s history...</div>;
  if (recentTrades.length === 0) return <div className="text-xs text-zinc-500">No public trading history available.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <History className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Market Positions</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recentTrades.map(trade => (
          <div key={trade.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                trade.status === 'Won' ? 'bg-neon-green/10 text-neon-green' :
                trade.status === 'Lost' ? 'bg-rose-500/10 text-rose-500' :
                trade.status === 'Refunded' ? 'bg-zinc-500/10 text-zinc-400' :
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                {trade.status}
              </span>
              <span className="text-[10px] text-zinc-500">{new Date(trade.placed_at).toLocaleDateString()}</span>
            </div>
            
            <p className="text-xs font-medium text-white line-clamp-2 mb-2">{trade.title}</p>
            
            <div className="flex justify-between items-end border-t border-zinc-800 pt-2 mt-auto">
              <div>
                <span className="text-[9px] text-zinc-500 block">Position</span>
                <span className="text-xs font-bold text-zinc-300">
                  {trade.chosen_option === 'A' ? trade.option_a : trade.option_b}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-500 block">Stake</span>
                <span className="text-xs font-bold text-white">
                  KES {parseFloat(trade.amount_kes).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}