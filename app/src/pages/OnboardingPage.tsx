import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, User, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface OnboardingPageProps {
  onComplete: () => void;
}

const SUGGESTED_NICKNAMES = ['CryptoKing', 'BetMaster', 'LuckyCharm', 'RiskTaker', 'SmartBet', 'HighRoller', 'TheOracle'];

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateNickname } = useUser();

  const isValidNickname = (name: string) => name.length >= 3 && name.length <= 20 && /^[a-zA-Z0-9_]+$/.test(name);
  const isValidPhone = (phone: string) => phone.startsWith('+254') && phone.length >= 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname)) return toast.error('Invalid nickname');
    if (!isValidPhone(phoneNumber)) return toast.error('Phone must start with +254');

    setIsLoading(true);
    try {
      await updateNickname(nickname, phoneNumber);
      toast.success(`Welcome ${nickname}! Your wallet is ready.`);
      onComplete();
    } catch (error) {
      toast.error('Failed to setup account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30 mb-4">
            <Sparkles className="h-8 w-8 text-neon-green" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Profile</h1>
          <p className="text-zinc-500">Set your Legend Name and link your M-Pesa</p>
        </div>

        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Your Nickname</Label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g., CryptoKing"
                  className="pl-12 h-12 bg-zinc-950 border-zinc-800 text-white focus:border-neon-green"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">M-Pesa Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254712345678"
                  className="pl-12 h-12 bg-zinc-950 border-zinc-800 text-white focus:border-neon-green"
                />
              </div>
              <p className="text-xs text-zinc-500">Required for depositing and withdrawing KES.</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isValidNickname(nickname) || !isValidPhone(phoneNumber)}
              className="w-full h-12 bg-neon-green hover:bg-green-500 text-black font-semibold"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />}
              {isLoading ? 'Creating Wallet...' : 'Start Trading'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}