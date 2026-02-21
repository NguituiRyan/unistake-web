import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target,
  Percent,
  Phone,
  Loader2,
//   CheckCircle2 // Removed unused import
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import type { LeaderboardUser } from '@/types';
import { getLeaderboard, maskPhoneNumber } from '@/lib/api'; 

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const realLeaderboard = await getLeaderboard();
      const rankedUsers = realLeaderboard.map((user, index) => ({ 
        ...user, 
        rank: index + 1 
      }));
      setUsers(rankedUsers);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/5',
          icon: <Crown className="h-6 w-6 text-yellow-500" />,
          badge: 'bg-yellow-500 text-black',
          glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
        };
      case 2:
        return {
          border: 'border-zinc-400/50',
          bg: 'bg-gradient-to-b from-zinc-400/20 to-zinc-500/5',
          icon: <Medal className="h-6 w-6 text-zinc-400" />,
          badge: 'bg-zinc-400 text-black',
          glow: 'shadow-[0_0_30px_rgba(161,161,170,0.3)]',
        };
      case 3:
        return {
          border: 'border-amber-600/50',
          bg: 'bg-gradient-to-b from-amber-600/20 to-amber-700/5',
          icon: <Medal className="h-6 w-6 text-amber-600" />,
          badge: 'bg-amber-600 text-white',
          glow: 'shadow-[0_0_30px_rgba(217,119,6,0.3)]',
        };
      default:
        return {
          border: 'border-zinc-800',
          bg: 'bg-zinc-900',
          icon: <span className="text-zinc-500 font-bold">#{rank}</span>,
          badge: 'bg-zinc-800 text-zinc-400',
          glow: '',
        };
    }
  };

  const topThree = users.slice(0, 3);
  const currentUserRank = currentUser 
    ? users.findIndex(u => u.email === currentUser.email) + 1 
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Campus Leaderboard</h1>
                <p className="text-sm text-zinc-500">Top traders by successful predictions</p>
              </div>
            </div>
            
            {currentUserRank && currentUserRank > 0 && (
              <div className="text-right">
                <p className="text-sm text-zinc-500">Your Rank</p>
                <p className="text-2xl sm:text-4xl font-bold text-neon-blue">#{currentUserRank}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Top 3 Podium - UPDATED: Now uses CSS Grid to span full width */}
        {topThree.length >= 3 && (
          <div className="mb-10">
            {/* Changed from flex to grid for wider columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-2">
              
              {/* 2nd Place - Column 1 */}
              <div className="flex flex-col items-center w-full">
                <Card className={`w-full p-3 sm:p-4 ${getRankStyle(2).bg} border-2 ${getRankStyle(2).border} ${getRankStyle(2).glow}`}>
                  <div className="flex flex-col items-center">
                    {getRankStyle(2).icon}
                    {/* Simplified Name Display: Truncates nicely now that card is wider */}
                    <p className="text-sm sm:text-base font-bold text-white mt-2 truncate w-full text-center">
                      {topThree[1].nickname}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">{topThree[1].wonBets || 0} Wins</p>
                  </div>
                </Card>
                <div className="w-full h-16 sm:h-24 bg-zinc-800/50 rounded-b-lg mt-1 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-zinc-500">2</span>
                </div>
              </div>

              {/* 1st Place - Column 2 (Popped up higher with negative margin and z-index) */}
              <div className="flex flex-col items-center w-full -mt-6 z-10">
                <Card className={`w-full p-4 sm:p-5 ${getRankStyle(1).bg} border-2 ${getRankStyle(1).border} ${getRankStyle(1).glow}`}>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {getRankStyle(1).icon}
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
                    </div>
                    {/* Simplified Name Display */}
                    <p className="text-base sm:text-lg font-bold text-white mt-2 truncate w-full text-center">
                      {topThree[0].nickname}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-white mt-1">{topThree[0].wonBets || 0} Wins</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Target className="h-3 w-3 text-zinc-500" />
                      <span className="text-xs text-zinc-500">{topThree[0].winRate}% WR</span>
                    </div>
                  </div>
                </Card>
                <div className="w-full h-24 sm:h-32 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-b-lg mt-1 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-yellow-500">1</span>
                </div>
              </div>

              {/* 3rd Place - Column 3 */}
              <div className="flex flex-col items-center w-full">
                <Card className={`w-full p-3 sm:p-4 ${getRankStyle(3).bg} border-2 ${getRankStyle(3).border} ${getRankStyle(3).glow}`}>
                  <div className="flex flex-col items-center">
                    {getRankStyle(3).icon}
                    {/* Simplified Name Display */}
                    <p className="text-sm sm:text-base font-bold text-white mt-2 truncate w-full text-center">
                      {topThree[2].nickname}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">{topThree[2].wonBets || 0} Wins</p>
                  </div>
                </Card>
                <div className="w-full h-12 sm:h-16 bg-zinc-800/50 rounded-b-lg mt-1 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-zinc-500">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS SUMMARY GRID REMOVED HERE to save real estate */}

        {/* Full Leaderboard List */}
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden mt-8">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
            {/* UPDATED HEADER: Added trader count here */}
            <h2 className="text-lg font-semibold text-white">
              Full Rankings ({users.length} Total Traders)
            </h2>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {users.map((user, index) => {
              const style = getRankStyle(user.rank || index + 1);
              const isCurrentUser = currentUser && user.email === currentUser.email;
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-zinc-800/50 transition-colors ${
                    isCurrentUser ? 'bg-neon-blue/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 sm:w-10">
                    <Badge className={`${style.badge} font-bold text-xs`}>
                      #{user.rank}
                    </Badge>
                  </div>

                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0 hidden sm:block">
                    {user.rank && user.rank <= 3 ? (
                      style.icon
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-sm font-medium text-zinc-400">
                          {user.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate text-sm sm:text-base ${isCurrentUser ? 'text-neon-blue' : 'text-white'}`}>
                        {user.nickname}
                      </p>
                      {isCurrentUser && (
                        <Badge className="bg-neon-blue/20 text-neon-blue text-xs flex-shrink-0">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1 truncate">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{maskPhoneNumber(user.phoneNumber)}</span>
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0 hidden sm:flex">
                        <Target className="h-3 w-3" />
                        {user.totalBets} bets placed
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-white text-sm sm:text-base truncate flex items-center justify-end gap-1.5">
                      {user.wonBets || 0} <span className="text-xs text-zinc-400 font-normal">Wins</span>
                    </p>
                    <div className="flex items-center justify-end gap-1 text-xs mt-1">
                      <Percent className="h-3 w-3 text-zinc-500" />
                      <span className={user.winRate >= 50 ? 'text-neon-green' : 'text-zinc-500'}>
                        {user.winRate}% WR
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Motivational Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            {currentUserRank && currentUserRank > 10 
              ? "Keep analyzing markets to climb the ranks!" 
              : "You're among the top analysts!"}
          </p>
        </div>
      </div>
    </div>
  );
}