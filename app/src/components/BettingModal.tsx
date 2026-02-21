import { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Market } from '@/types';
import { calculateOdds, calculatePotentialReturn } from '@/lib/api';
import { useUser } from '@/contexts/UserContext'; 

// NEW: Updated prop signature to support passing the thesis text back to App.tsx
interface BettingModalProps {
  market: Market | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (marketId: string, option: 'A' | 'B', amount: number, thesis?: string) => Promise<void>;
  userBalance: number;
}

export function BettingModal({ market, isOpen, onClose, onPlaceBet, userBalance }: BettingModalProps) {
  const { isAuthenticated } = useUser(); 

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [amount, setAmount] = useState('');
  const [thesis, setThesis] = useState(''); // NEW: State for the reasoning
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const probA = market ? calculateOdds(market.poolA, market.poolB, 'A') : 50;
  const probB = market ? calculateOdds(market.poolA, market.poolB, 'B') : 50;

  const potentialReturn = useMemo(() => {
    if (!selectedOption || !amount || !market) return 0;
    
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) return 0;

    return calculatePotentialReturn(betAmount, market.poolA, market.poolB, selectedOption);
  }, [selectedOption, amount, market]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!market || !selectedOption || !amount) return;

    const betAmount = parseFloat(amount);
    
    if (!isAuthenticated) {
      await onPlaceBet(market.id, selectedOption, betAmount);
      onClose(); 
      return;
    }

    if (betAmount > userBalance) return;

    setIsLoading(true);
    
    try {
      // NEW: Pass the thesis up to the backend if they wrote one!
      await onPlaceBet(market.id, selectedOption, betAmount, thesis);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedOption(null);
        setAmount('');
        setThesis(''); // Clear the thesis box on success
        onClose();
      }, 1500);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedOption(null);
      setAmount('');
      setThesis('');
      setIsSuccess(false);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!market) return null;

  // Verify "Skin in the game" for the thesis box
  const hasEnoughSkinInGame = parseFloat(amount || '0') >= 50;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-lg font-bold text-white">
            Take Position
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-neon-green/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-neon-green" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">Trade Submitted!</h3>
                <p className="text-zinc-400">Your position is locked.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Market Title */}
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-1">Market</p>
                <p className="text-sm font-medium text-white">{market.title}</p>
              </div>

              {/* Option Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-300">
                  Forecast
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOption('A')}
                    disabled={isLoading}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === 'A'
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${
                        selectedOption === 'A' ? 'text-neon-blue' : 'text-white'
                      }`}>
                        {market.optionA}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {probA.toFixed(1)}% probability
                      </p>
                    </div>
                    {selectedOption === 'A' && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-neon-blue" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOption('B')}
                    disabled={isLoading}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === 'B'
                        ? 'border-neon-pink bg-neon-pink/10'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${
                        selectedOption === 'B' ? 'text-neon-pink' : 'text-white'
                      }`}>
                        {market.optionB}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {probB.toFixed(1)}% probability
                      </p>
                    </div>
                    {selectedOption === 'B' && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-neon-pink" />
                    )}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="betAmount" className="text-sm font-medium text-zinc-300">
                    Position Size (KES)
                  </Label>
                  <span className="text-xs text-zinc-500">
                    {isAuthenticated ? `Balance: ${formatCurrency(userBalance)}` : 'Sign in to trade'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                    KES
                  </span>
                  <Input
                    id="betAmount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    min="10"
                    max={isAuthenticated ? userBalance : undefined}
                    className="pl-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-neon-green focus:ring-neon-green/20"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-2">
                  {[50, 100, 500, 1000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={isLoading || (isAuthenticated && quickAmount > userBalance)}
                      className="flex-1 py-1.5 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* NEW: The Thesis Input Area (Position Gated) */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-zinc-400" />
                  <Label htmlFor="thesis" className="text-sm font-medium text-zinc-300">
                    Defend Your Position (Optional)
                  </Label>
                </div>
                <textarea
                  id="thesis"
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  disabled={!hasEnoughSkinInGame || isLoading}
                  placeholder={hasEnoughSkinInGame 
                    ? "Why are you taking this side? This builds your Conviction Score..." 
                    : "🔒 Stake at least KES 50 to publish a thesis."}
                  className="w-full h-20 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* Potential Return */}
              {selectedOption && amount && parseFloat(amount) > 0 && (
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Potential Yield</span>
                    <TrendingUp className="h-4 w-4 text-neon-green" />
                  </div>
                  <p className="text-2xl font-bold text-neon-green">
                    {formatCurrency(potentialReturn)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Profit: {formatCurrency(potentialReturn - parseFloat(amount || '0'))}
                  </p>
                </div>
              )}

              {/* Insufficient Balance */}
              {isAuthenticated && amount && parseFloat(amount) > userBalance && (
                <Alert className="bg-red-950/30 border-red-900/50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400 text-sm">
                    Insufficient balance. Please deposit more funds.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !selectedOption || 
                  !amount || 
                  parseFloat(amount) <= 0 || 
                  (isAuthenticated && parseFloat(amount) > userBalance) 
                }
                className={`w-full h-12 font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAuthenticated 
                    ? 'bg-neon-green hover:bg-green-500 text-black hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]' 
                    : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isAuthenticated ? 'Submitting Trade...' : 'Redirecting...'}
                  </span>
                ) : (
                  isAuthenticated ? 'Submit Trade' : 'Sign in to Trade'
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}