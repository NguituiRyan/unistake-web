import { useState, useCallback } from 'react';
import { TrendingUp, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { MarketCard } from '@/components/MarketCard';
import { BettingModal } from '@/components/BettingModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Market, User } from '@/types';

interface MarketsPageProps {
  markets: Market[];
  user: User;
  onPlaceBet: (marketId: string, option: 'A' | 'B', amount: number) => Promise<void>;
}

export function MarketsPage({ markets, user, onPlaceBet }: MarketsPageProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleMarketClick = useCallback((market: Market) => {
    setSelectedMarket(market);
    setIsBettingOpen(true);
  }, []);

  // 1. First, strip out the resolved markets
  const activeMarketsOnly = markets.filter(m => m.status === 'active');
  
  // 2. Then, apply the category tabs
  const filteredMarkets = activeTab === 'all' 
    ? activeMarketsOnly 
    : activeMarketsOnly.filter(m => m.category.toLowerCase() === activeTab.toLowerCase());
  const categories = ['all', ...Array.from(new Set(markets.map(m => m.category.toLowerCase())))];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border border-neon-blue/30">
            <TrendingUp className="h-5 w-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Prediction Markets</h1>
            <p className="text-sm text-zinc-500">Bet on campus events and earn KES</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm"
          >
            All Markets
          </TabsTrigger>
          {categories.filter(c => c !== 'all').map(category => (
            <TabsTrigger 
              key={category}
              value={category}
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm capitalize"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats Bar - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-neon-blue flex-shrink-0" />
            <span className="text-xs text-zinc-500 truncate">Active Markets</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">{markets.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-neon-pink flex-shrink-0" />
            <span className="text-xs text-zinc-500 truncate">Total Volume</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {formatCurrency(markets.reduce((acc, m) => acc + m.totalVolume, 0))}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-neon-green flex-shrink-0" />
            <span className="text-xs text-zinc-500 truncate">Ending Soon</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {markets.filter(m => {
              const date = new Date(m.endDate);
              const now = new Date();
              const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays <= 2;
            }).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-neon-green flex-shrink-0" />
            <span className="text-xs text-zinc-500 truncate">Your Balance</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-neon-green truncate">
            {formatCurrency(user.balance)}
          </p>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map(market => (
          <MarketCard 
            key={market.id} 
            market={market} 
            onClick={() => handleMarketClick(market)} 
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMarkets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No markets found</h3>
          <p className="text-sm text-zinc-500">Check back later for new markets</p>
        </div>
      )}

      {/* Betting Modal */}
      <BettingModal
        market={selectedMarket}
        isOpen={isBettingOpen}
        onClose={() => setIsBettingOpen(false)}
        onPlaceBet={onPlaceBet}
        userBalance={user.balance}
      />
    </main>
  );
}
