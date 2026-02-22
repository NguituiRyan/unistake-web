import { useState } from 'react';
import { TrendingUp, Users, Clock, Share2, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Market, Thesis} from '@/types';
import { calculateOdds, getTheses } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns'; // We use this for "2 hours ago" formatting

interface MarketCardProps {
  market: Market;
  onClick: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  const probA = calculateOdds(market.poolA, market.poolB, 'A');
  const probB = calculateOdds(market.poolA, market.poolB, 'B');

  // Debate Arena State
  const [isDebateOpen, setIsDebateOpen] = useState(false);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [isLoadingTheses, setIsLoadingTheses] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Ending soon';
    if (diffDays === 1) return '1d left';
    return `${diffDays}d left`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const platformUrl = "https://unistake.angawatch.co.ke"; 
    const message = `🔥 Who do you think will win? \n\n*${market.title}*\n🔵 ${market.optionA}\n🔴 ${market.optionB}\n\nTake a position and prove it on UniStake: ${platformUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleDebate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the betting modal from opening!
    
    if (!isDebateOpen) {
      setIsLoadingTheses(true);
      try {
        const fetchedTheses = await getTheses(market.id);
        setTheses(fetchedTheses);
      } catch (error) {
        console.error("Failed to load theses:", error);
      } finally {
        setIsLoadingTheses(false);
      }
    }
    setIsDebateOpen(!isDebateOpen);
  };

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] flex flex-col"
    >
      <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {market.title}
        </h3>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
          {market.category}
        </span>
      </div>

      <div className="px-3 pb-3">
        <div className="flex h-10 rounded-lg overflow-hidden mb-2 bg-zinc-950 border border-zinc-800">
          <div
            className="flex items-center justify-between px-2 bg-blue-500/20 border-r border-blue-500/30 transition-all duration-500"
            style={{ width: `${probA}%` }}
          >
            <span className="text-xs font-medium text-blue-400 truncate mr-1">
              {market.optionA}
            </span>
            {probA >= 20 && (
              <span className="text-[10px] font-bold text-blue-300 shrink-0">
                {probA.toFixed(0)}%
              </span>
            )}
          </div>
          
          <div
            className="flex items-center justify-between flex-row-reverse px-2 bg-rose-500/20 border-l border-rose-500/30 transition-all duration-500"
            style={{ width: `${probB}%` }}
          >
            <span className="text-xs font-medium text-rose-400 truncate ml-1">
              {market.optionB}
            </span>
            {probB >= 20 && (
              <span className="text-[10px] font-bold text-rose-300 shrink-0">
                {probB.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-3 sm:gap-4 text-zinc-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="truncate">{formatCurrency(market.totalVolume)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{market.traders}</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>{formatDate(market.endDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-md text-zinc-500 hover:text-green-500 hover:bg-green-500/10 transition-colors"
              title="Share Market"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            {/* NEW: Toggle Debate Button */}
            <button 
              onClick={toggleDebate}
              className={`flex items-center gap-1 p-1.5 rounded-md transition-colors ${
                isDebateOpen ? 'text-neon-blue bg-neon-blue/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}
              title="View Debate Arena"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {isDebateOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* THE DEBATE ARENA EXPANSION */}
      {isDebateOpen && (
        <div 
          className="border-t border-zinc-800 bg-zinc-950/50 p-3 flex-grow cursor-default"
          onClick={(e) => e.stopPropagation()} // Keeps betting modal from opening if they click inside the arena
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Top Theses</span>
          </div>

          {isLoadingTheses ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
          ) : theses.length > 0 ? (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {theses.map((thesis) => (
                <div key={thesis.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 relative overflow-hidden">
                  
                  {/* Colored indicator bar on the left based on their position */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    thesis.chosenOption === 'A' ? 'bg-blue-500' : 'bg-rose-500'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <span className="text-sm font-bold text-white block">{thesis.nickname}</span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDistanceToNow(new Date(thesis.createdAt))} ago
                      </span>
                    </div>
                    
                    {/* Position Badge */}
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        thesis.chosenOption === 'A' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {thesis.chosenOption === 'A' ? market.optionA : market.optionB}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-400 mt-1">
                        Stake: {formatCurrency(thesis.amount)}
                      </span>
                    </div>
                  </div>
                  
                  {/* The actual argument */}
                  <p className="text-xs text-zinc-300 leading-relaxed pl-2 italic">
                    "{thesis.content}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-500">No theses yet.</p>
              <p className="text-[10px] text-zinc-600 mt-1">Take a position of KES 50+ to post the first argument.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}