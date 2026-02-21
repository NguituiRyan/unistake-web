import { useState, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { MarketCard } from '@/components/MarketCard';
import { BettingModal } from '@/components/BettingModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Market, User } from '@/types';

interface MarketsPageProps {
  markets: Market[];
  user: User | null; 
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

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      
      {/* Scrollable Category Tabs */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Added min-w-max so the buttons don't crush each other on small screens */}
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto inline-flex min-w-max gap-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm rounded-md transition-colors"
              >
                All Markets
              </TabsTrigger>
              {categories.filter(c => c !== 'all').map(category => (
                <TabsTrigger 
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm capitalize rounded-md transition-colors"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
          <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
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
        userBalance={user?.balance || 0} 
      />
    </main>
  );
}