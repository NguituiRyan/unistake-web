import { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
// NEW: Import user context to check authentication state
import { useUser } from '@/contexts/UserContext'; 

interface BettingModalProps {
  market: Market | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (marketId: string, option: 'A' | 'B', amount: number) => Promise<void>;
  userBalance: number;
}

export function BettingModal({ market, isOpen, onClose, onPlaceBet, userBalance }: BettingModalProps) {
  // NEW: Get auth state
  const { isAuthenticated } = useUser(); 

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate odds dynamically
  const probA = market ? calculateOdds(market.poolA, market.poolB, 'A') : 50;
  const probB = market ? calculateOdds(market.poolA, market.poolB, 'B') : 50;

  // Calculate potential return dynamically
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
    
    // THE BOUNCER INTERCEPT: If guest, trigger Sign-In and close modal immediately
    if (!isAuthenticated) {
      await onPlaceBet(market.id, selectedOption, betAmount);
      onClose(); // Close the modal so the Sign-In screen is fully visible
      return;
    }

    // IF LOGGED IN: Proceed with normal validation and betting
    if (betAmount > userBalance) return;

    setIsLoading(true);
    
    try {
      await onPlaceBet(market.id, selectedOption, betAmount);
      setIsSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedOption(null);
        setAmount('');
        onClose();
      }, 1500);
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedOption(null);
      setAmount('');
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-lg font-bold text-white">
            Place Your Bet
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-neon-green/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-neon-green" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">Bet Placed!</h3>
                <p className="text-zinc-400">Good luck!</p>
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
                  Select Outcome
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
                        {probA.toFixed(1)}% chance
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
                        {probB.toFixed(1)}% chance
                      </p>
                    </div>
                    {selectedOption === 'B' && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-neon-pink" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bet Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="betAmount" className="text-sm font-medium text-zinc-300">
                    Bet Amount (KES)
                  </Label>
                  {/* NEW: Hide balance if not logged in */}
                  <span className="text-xs text-zinc-500">
                    {isAuthenticated ? `Balance: ${formatCurrency(userBalance)}` : 'Sign in to play'}
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
                
                {/* Quick Amount Buttons */}
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

              {/* Potential Return */}
              {selectedOption && amount && parseFloat(amount) > 0 && (
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Potential Return</span>
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

              {/* Insufficient Balance Warning - ONLY shows if logged in */}
              {isAuthenticated && amount && parseFloat(amount) > userBalance && (
                <Alert className="bg-red-950/30 border-red-900/50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400 text-sm">
                    Insufficient balance. Please deposit more funds.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button - Dynamic text based on Auth! */}
              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !selectedOption || 
                  !amount || 
                  parseFloat(amount) <= 0 || 
                  (isAuthenticated && parseFloat(amount) > userBalance) // NEW: Only disable for balance if logged in
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
                    {isAuthenticated ? 'Placing Bet...' : 'Redirecting...'}
                  </span>
                ) : (
                  isAuthenticated ? 'Place Bet' : 'Sign in to Place Bet'
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}