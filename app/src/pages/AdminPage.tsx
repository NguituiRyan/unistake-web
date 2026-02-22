import { useState, useEffect } from 'react';
import { Shield, Plus, CheckCircle2, TrendingUp, AlertTriangle, Loader2, Trophy, Users, DollarSign, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { getMarkets, createMarket, resolveMarket } from '@/lib/api';
import type { Market } from '@/types';

const CATEGORIES = ['Sports', 'Weather', 'Campus Life', 'Politics', 'Entertainment', 'Academic'];

export function AdminPage() {
  const { refreshUser, user } = useUser();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [pendingMarkets, setPendingMarkets] = useState<any[]>([]); // NEW STATE for approvals
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | ''>('');
  const [formData, setFormData] = useState({ title: '', optionA: '', optionB: '', category: '', endDate: '' });

  useEffect(() => {
    fetchMarkets();
    fetchPendingMarkets(); // Fetch the queue on load
  }, []);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      const data = await getMarkets();
      setMarkets(data);
    } catch (error) {
      toast.error('Failed to load active markets');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Fetch unapproved markets from the backend
  const fetchPendingMarkets = async () => {
    try {
      const res = await fetch('https://unistake-backend.onrender.com/api/admin/pending-markets');
      if (res.ok) {
        const data = await res.json();
        setPendingMarkets(data);
      }
    } catch (error) {
      console.error("Failed to load pending markets");
    }
  };

  // NEW: Handle Approve or Reject
  const handleApprovalAction = async (marketId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('https://unistake-backend.onrender.com/api/admin/approve-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_id: marketId, action })
      });
      
      if (!res.ok) throw new Error("Failed to process action");
      
      toast.success(action === 'approve' ? 'Market Approved & Live!' : 'Market Rejected & User Refunded');
      
      // Refresh both tables to show the change
      await fetchPendingMarkets();
      await fetchMarkets();
    } catch (error) {
      toast.error("Error processing market");
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return toast.error('You must be logged in to create a market');
    if (!formData.title || !formData.optionA || !formData.optionB || !formData.category || !formData.endDate) {
      return toast.error('Please fill in all fields');
    }

    setIsCreating(true);
    try {
      await createMarket(user.email, formData); 
      toast.success('Market created successfully!');
      setFormData({ title: '', optionA: '', optionB: '', category: '', endDate: '' });
      await fetchMarkets(); 
    } catch (error) {
      toast.error('Failed to create market');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedMarket || !winner) return;
    setIsResolving(true);
    
    try {
      const winningOptionText = winner === 'A' ? selectedMarket.optionA : selectedMarket.optionB;
      await resolveMarket({ marketId: selectedMarket.id, winner: winningOptionText });
      
      toast.success(`Market resolved! ${winningOptionText} wins! Payouts distributed.`);
      setResolveDialogOpen(false);
      setWinner(''); 
      
      await fetchMarkets(); 
      await refreshUser(); 
      
    } catch (error) {
      toast.error('Failed to resolve market');
    } finally {
      setIsResolving(false);
    }
  };

  const activeMarkets = markets.filter(m => m.status === 'active');
  const resolvedMarkets = markets.filter(m => m.status === 'resolved');

  const houseEarnings = resolvedMarkets.reduce((total, market) => {
    if (market.winningOption === 'Refunded') return total;
    if (market.totalVolume < 1000) return total; 
    
    // We only calculate the Admin cut here (4.5%) since Creator got 0.5%
    const losingPool = market.winningOption === market.optionA ? Number(market.poolB) : Number(market.poolA);
    return total + (losingPool * 0.045); // UPDATED to 4.5%
  }, 0);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center">
        <div>
          <Shield className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        
        {/* NEW SECTION: PENDING APPROVALS */}
        {pendingMarkets.length > 0 && (
          <div className="mb-8 p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <h2 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> 
              Approval Queue ({pendingMarkets.length})
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="border-yellow-500/20">
                  <TableHead className="text-yellow-600">Creator</TableHead>
                  <TableHead className="text-yellow-600">Question</TableHead>
                  <TableHead className="text-yellow-600">Options</TableHead>
                  <TableHead className="text-yellow-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMarkets.map(m => (
                  <TableRow key={m.id} className="border-yellow-500/10">
                    <TableCell className="text-white font-medium">{m.creator_name}</TableCell>
                    <TableCell className="text-zinc-300">{m.title}</TableCell>
                    <TableCell className="text-zinc-400">{m.option_a} vs {m.option_b}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => handleApprovalAction(m.id.toString(), 'reject')} className="bg-red-950 hover:bg-red-900 text-red-500 border border-red-900">
                          <X className="h-4 w-4 mr-1"/> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprovalAction(m.id.toString(), 'approve')} className="bg-green-500 hover:bg-green-400 text-black font-bold">
                          <Check className="h-4 w-4 mr-1"/> Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30">
              <h2 className="text-sm font-medium text-zinc-400 mb-1">Total House Earnings</h2>
              <p className="text-3xl font-bold text-neon-green">
                KES {houseEarnings.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-zinc-500 mt-2">4.5% fee on pools over 1,000 KES</p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-6">Create New Market</h2>
              <form onSubmit={handleCreateMarket} className="space-y-4">
                <Input placeholder="Market Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-zinc-950 text-white" />
                <Input placeholder="Option A" value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} className="bg-zinc-950 text-white" />
                <Input placeholder="Option B" value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} className="bg-zinc-950 text-white" />
                <Select onValueChange={val => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-zinc-950 text-white"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="bg-zinc-950 text-white" />
                <Button type="submit" disabled={isCreating} className="w-full bg-neon-green text-black font-bold hover:bg-green-500 transition-colors">
                  {isCreating ? 'Creating...' : 'Create Market'}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Active Markets</h2>
              {isLoading ? <p className="text-zinc-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Loading from database...</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead className="text-zinc-400">Market</TableHead><TableHead className="text-zinc-400">Options</TableHead><TableHead className="text-zinc-400">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {activeMarkets.map(m => (
                      <TableRow key={m.id} className="border-zinc-800">
                        <TableCell className="text-white font-medium">{m.title}</TableCell>
                        <TableCell className="text-zinc-400">{m.optionA} vs {m.optionB}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => { setSelectedMarket(m); setResolveDialogOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white">Resolve</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeMarkets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-zinc-500 py-8">No active markets found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Resolve Market</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400 mb-2">Select the winning outcome for: <span className="text-white font-semibold">{selectedMarket?.title}</span></p>
          {selectedMarket && (
            <div className="grid grid-cols-2 gap-3 py-4">
              <Button onClick={() => setWinner('A')} variant="outline" className={winner === 'A' ? 'bg-neon-blue text-black border-neon-blue' : 'text-white border-zinc-700 hover:bg-zinc-800'}>
                {selectedMarket.optionA}
              </Button>
              <Button onClick={() => setWinner('B')} variant="outline" className={winner === 'B' ? 'bg-neon-pink text-black border-neon-pink' : 'text-white border-zinc-700 hover:bg-zinc-800'}>
                {selectedMarket.optionB}
              </Button>
            </div>
          )}
          <Button onClick={handleResolve} disabled={!winner || isResolving} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12">
            {isResolving ? <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Resolving & Paying Out...</span> : 'Confirm Resolution'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}