import { TrendingUp, Users, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Market } from '@/types';
import { calculateOdds } from '@/lib/api';

interface MarketCardProps {
  market: Market;
  onClick: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  // Calculate odds dynamically
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
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
    >
      {/* Header with category and time */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
        <Badge 
          variant="secondary" 
          className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs font-medium"
        >
          {market.category}
        </Badge>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(market.endDate)}</span>
        </div>
      </div>

      {/* Market Title */}
      <div className="px-4 py-4">
        <h3 className="text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-neon-blue transition-colors">
          {market.title}
        </h3>
      </div>

      {/* Probability Bars - Dynamic */}
      <div className="px-4 pb-4">
        <div className="flex h-10 rounded-lg overflow-hidden mb-3">
          {/* Option A Bar */}
          <div
            className="relative flex items-center justify-start px-3 bg-neon-blue transition-all duration-500"
            style={{ width: `${probA}%` }}
          >
            <span className="text-xs font-bold text-white truncate">
              {market.optionA}
            </span>
            {probA > 25 && (
              <span className="absolute right-2 text-xs font-bold text-white/90">
                {probA.toFixed(0)}%
              </span>
            )}
          </div>
          
          {/* Option B Bar */}
          <div
            className="relative flex items-center justify-end px-3 bg-neon-pink transition-all duration-500"
            style={{ width: `${probB}%` }}
          >
            {probB > 25 && (
              <span className="absolute left-2 text-xs font-bold text-white/90">
                {probB.toFixed(0)}%
              </span>
            )}
            <span className="text-xs font-bold text-white truncate">
              {market.optionB}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="truncate">Vol: {formatCurrency(market.totalVolume)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Users className="h-3.5 w-3.5" />
              <span>{market.traders} traders</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Card>
  );
}
