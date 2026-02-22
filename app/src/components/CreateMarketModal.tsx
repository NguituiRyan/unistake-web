import { useState } from 'react';
import { Loader2, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onSubmit: (marketData: any) => Promise<void>;
}

export function CreateMarketModal({ isOpen, onClose, userBalance, onSubmit }: CreateMarketModalProps) {
  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [category, setCategory] = useState('Campus');
  const [daysOpen, setDaysOpen] = useState('7');
  const [isLoading, setIsLoading] = useState(false);

  const LISTING_FEE = 200; // UPDATED TO 200 BOB!
  const hasEnoughFunds = userBalance >= LISTING_FEE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughFunds) return;
    
    if (!title || !optionA || !optionB) {
      toast.error('Please fill in all market details');
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(daysOpen));

    setIsLoading(true);
    try {
      await onSubmit({
        title, optionA, optionB, category, endDate: endDate.toISOString()
      });
      toast.success('Market successfully listed!');
      setTitle(''); setOptionA(''); setOptionB('');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create market');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            List a New Market
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center text-center">
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-1">Listing Fee</span>
            <span className="text-3xl font-black text-white">KES 200</span>
            <span className="text-xs text-zinc-400 mt-1">Deducted from your Available Capital</span>
          </div>

          {!hasEnoughFunds && (
            <Alert className="mb-6 bg-red-950/30 border-red-900/50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400 text-sm font-medium">
                Insufficient funds. You need KES {LISTING_FEE} to act as the House.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Market Question</Label>
              <Input 
                placeholder="e.g. Will Strathmore win the rugby finals this weekend?" 
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-neon-blue"
                disabled={!hasEnoughFunds || isLoading} maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Option A (Blue)</Label>
                <Input 
                  placeholder="Yes" value={optionA} onChange={(e) => setOptionA(e.target.value)}
                  className="bg-blue-500/10 border-blue-500/30 text-blue-100 placeholder:text-blue-500/50 focus:border-blue-500"
                  disabled={!hasEnoughFunds || isLoading} maxLength={25}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Option B (Red)</Label>
                <Input 
                  placeholder="No" value={optionB} onChange={(e) => setOptionB(e.target.value)}
                  className="bg-rose-500/10 border-rose-500/30 text-rose-100 placeholder:text-rose-500/50 focus:border-rose-500"
                  disabled={!hasEnoughFunds || isLoading} maxLength={25}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Category</Label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value)} disabled={!hasEnoughFunds || isLoading}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-neon-blue"
                >
                  <option value="Campus">Campus</option>
                  <option value="Sports">Sports</option>
                  <option value="Politics">Politics</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Duration</Label>
                <select 
                  value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} disabled={!hasEnoughFunds || isLoading}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-neon-blue"
                >
                  <option value="1">24 Hours</option>
                  <option value="3">3 Days</option>
                  <option value="7">1 Week</option>
                  <option value="30">1 Month</option>
                </select>
              </div>
            </div>

            <Button 
              type="submit" disabled={!hasEnoughFunds || isLoading}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold mt-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'List Market (KES 200)'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}