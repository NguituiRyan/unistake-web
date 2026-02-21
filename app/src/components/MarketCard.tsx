import { TrendingUp, Users, Clock, ChevronRight, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Market } from '@/types';
import { calculateOdds } from '@/lib/api';

interface MarketCardProps {
  market: Market;
  onClick: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  const probA = calculateOdds(market.poolA, market.poolB, 'A');
  const probB = calculateOdds(market.poolA, market.poolB, 'B');

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
    return `${diffDays}d left`; // Compacted time format
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const platformUrl = "https://unistake.angawatch.co.ke"; 
    const message = `🔥 Who do you think will win? \n\n*${market.title}*\n🔵 ${market.optionA}\n🔴 ${market.optionB}\n\nStake KES and prove it on UniStake: ${platformUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]"
    >
      {/* COMPACTED TOP ROW: Title & Category together */}
      <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {market.title}
        </h3>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
          {market.category}
        </span>
      </div>

      <div className="px-3 pb-3">
        {/* TRANSLUCENT PROGRESS BAR */}
        <div className="flex h-10 rounded-lg overflow-hidden mb-2 bg-zinc-950 border border-zinc-800">
          {/* Option A - Blue (Translucent) */}
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
          
          {/* Option B - Pink (Translucent) */}
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

        {/* BOTTOM STATS ROW: Time, Volume, Traders, Share */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-3 sm:gap-4 text-zinc-500">
            {/* Volume */}
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="truncate">{formatCurrency(market.totalVolume)}</span>
            </div>
            {/* Traders */}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{market.traders}</span>
            </div>
            {/* Time Left (Moved here!) */}
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>{formatDate(market.endDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-md text-zinc-500 hover:text-green-500 hover:bg-green-500/10 transition-colors"
              title="Share to WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}