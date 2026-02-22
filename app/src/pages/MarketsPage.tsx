import { useState, useCallback } from 'react';
import { TrendingUp, Plus } from 'lucide-react'; // <-- Added Plus icon
import { MarketCard } from '@/components/MarketCard';
import { BettingModal } from '@/components/BettingModal';
import { CreateMarketModal } from '@/components/CreateMarketModal'; // <-- Added Import
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Market, User } from '@/types';

interface MarketsPageProps {
  markets: Market[];
  user: User | null; 
  onPlaceBet: (marketId: string, option: 'A' | 'B', amount: number, thesis?: string) => Promise<void>;
  onCreateMarket: (data: any) => Promise<void>; // <-- Added new prop!
}

export function MarketsPage({ markets, user, onPlaceBet, onCreateMarket }: MarketsPageProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); // <-- Modal state
  const [activeTab, setActiveTab] = useState('all');

  const handleMarketClick = useCallback((market: Market) => {
    setSelectedMarket(market);
    setIsBettingOpen(true);
  }, []);

  const activeMarketsOnly = markets.filter(m => m.status === 'active');
  const filteredMarkets = activeTab === 'all' 
    ? activeMarketsOnly 
    : activeMarketsOnly.filter(m => m.category.toLowerCase() === activeTab.toLowerCase());
  const categories = ['all', ...Array.from(new Set(markets.map(m => m.category.toLowerCase())))];

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      
      {/* Scrollable Category Tabs + Create Market Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto inline-flex min-w-max gap-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm rounded-md transition-colors">
                All Markets
              </TabsTrigger>
              {categories.filter(c => c !== 'all').map(category => (
                <TabsTrigger key={category} value={category} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 px-4 py-2 text-sm capitalize rounded-md transition-colors">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* THE NEW BUTTON */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-md font-bold text-sm transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] shrink-0"
        >
          <Plus className="h-4 w-4" /> List Market
        </button>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map(market => (
          <MarketCard key={market.id} market={market} onClick={() => handleMarketClick(market)} />
        ))}
      </div>

      {filteredMarkets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 mt-4">
          <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
            <TrendingUp className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No active markets</h3>
          <p className="text-sm text-zinc-500 mb-4">Be the first to list a market in this category.</p>
          <button onClick={() => setIsCreateOpen(true)} className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold">
            + List Market Now
          </button>
        </div>
      )}

      {/* Betting Modal */}
      <BettingModal
        market={selectedMarket} isOpen={isBettingOpen} onClose={() => setIsBettingOpen(false)}
        onPlaceBet={onPlaceBet} userBalance={user?.balance || 0} 
      />

      {/* NEW: Create Market Modal */}
      <CreateMarketModal
        isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
        userBalance={user?.balance || 0} onSubmit={onCreateMarket}
      />
    </main>
  );
}