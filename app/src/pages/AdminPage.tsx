import { useState, useEffect } from 'react';
import { Shield, Plus, CheckCircle2, TrendingUp, AlertTriangle, Loader2, Trophy, Users, DollarSign } from 'lucide-react';
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
  const { refreshUser } = useUser();
  const { user } = useUser();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | ''>('');
  const [formData, setFormData] = useState({ title: '', optionA: '', optionB: '', category: '', endDate: '' });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      const data = await getMarkets();
      setMarkets(data);
    } catch (error) {
      toast.error('Failed to load markets from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.optionA || !formData.optionB || !formData.category || !formData.endDate) {
      return toast.error('Please fill in all fields');
    }

    setIsCreating(true);
    try {
      await createMarket(formData);
      toast.success('Market created successfully!');
      setFormData({ title: '', optionA: '', optionB: '', category: '', endDate: '' });
      await fetchMarkets(); // Refresh the table
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
      // Send the actual text to the backend
      const winningOptionText = winner === 'A' ? selectedMarket.optionA : selectedMarket.optionB;
      await resolveMarket({ marketId: selectedMarket.id, winner: winningOptionText });
      
      toast.success(`Market resolved! ${winningOptionText} wins! Payouts distributed.`);
      setResolveDialogOpen(false);
      
      // Refresh the Active Markets table
      await fetchMarkets(); 
      
      // THE MAGIC WIRE: This instantly grabs your new post-payout balance!
      await refreshUser(); 
      
    } catch (error) {
      toast.error('Failed to resolve market');
    } finally {
      setIsResolving(false);
    }
  };

  const activeMarkets = markets.filter(m => m.status === 'active');
  const resolvedMarkets = markets.filter(m => m.status === 'resolved');

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Form */}
          <div className="lg:col-span-1">
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
                <Button type="submit" disabled={isCreating} className="w-full bg-neon-green text-black font-bold">
                  {isCreating ? 'Creating...' : 'Create Market'}
                </Button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Active Markets</h2>
              {isLoading ? <p className="text-white">Loading from database...</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Market</TableHead><TableHead>Options</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {activeMarkets.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-white">{m.title}</TableCell>
                        <TableCell className="text-zinc-400">{m.optionA} vs {m.optionB}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => { setSelectedMarket(m); setResolveDialogOpen(true); }} className="bg-red-600 hover:bg-red-700">Resolve</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Resolve Market</DialogTitle></DialogHeader>
          {selectedMarket && (
            <div className="grid grid-cols-2 gap-3 py-4">
              <Button onClick={() => setWinner('A')} variant="outline" className={winner === 'A' ? 'bg-neon-blue text-black' : 'text-black'}>{selectedMarket.optionA}</Button>
              <Button onClick={() => setWinner('B')} variant="outline" className={winner === 'B' ? 'bg-neon-pink text-black' : 'text-black'}>{selectedMarket.optionB}</Button>
            </div>
          )}
          <Button onClick={handleResolve} disabled={!winner || isResolving} className="w-full bg-red-600">
            {isResolving ? 'Resolving...' : 'Confirm Resolution'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}