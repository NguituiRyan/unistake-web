import { useState } from 'react';
import { User as UserIcon, Phone, TrendingUp, Loader2, ShieldCheck, Target, PieChart, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { updateNickname } = useUser();
  const [step, setStep] = useState<1 | 2>(1); // NEW: Controls which step we are on!
  
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (number: string) => {
    let cleaned = number.replace(/[^\d+]/g, ''); 
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 3) {
      toast.error('Display name must be at least 3 characters long');
      return;
    }
    
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmedNickname)) {
      toast.error('Display name can only contain letters, numbers, and spaces');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!/^(254)(7|1)\d{8}$/.test(formattedPhone)) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0712 345 678)');
      return;
    }

    setIsLoading(true);
    try {
      await updateNickname(trimmedNickname, formattedPhone);
      // Success! Move to Step 2 (The Tutorial) instead of finishing
      setStep(2);
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup profile');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-zinc-950">
      <div className="w-full max-w-md space-y-8 text-center mt-12 sm:mt-0">
        
        {/* STEP 1: PROFILE SETUP */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-16 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <TrendingUp className="h-8 w-8 text-neon-blue" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Trader Profile</h1>
              <p className="text-zinc-400">Set up your identity for the trading floor.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center">
              <div className="w-full p-4 mb-8 rounded-lg bg-zinc-950/50 border border-zinc-800 text-left flex gap-3">
                <ShieldCheck className="h-5 w-5 text-neon-green flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your display name is public. Your M-Pesa number is strictly private for secure deposits and withdrawals.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="w-full space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="nickname" className="text-zinc-300">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="nickname" 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:border-neon-blue"
                      disabled={isLoading}
                      maxLength={25}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="phone" className="text-zinc-300">M-Pesa Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:border-neon-blue"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-neon-blue hover:bg-blue-600 text-white font-semibold mt-4 text-base"
                  disabled={isLoading || !nickname || !phone}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: HOW IT WORKS (The Visual Tutorial) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">How UniStake Works</h1>
              <p className="text-zinc-400">Welcome to Kenya's Premier Information Market.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-left">
              
              {/* Point 1 */}
              <div className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <div className="h-10 w-10 rounded-full bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">1. Find an Edge</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Browse markets. Find a question where you have better information or conviction than the crowd.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <div className="h-10 w-10 rounded-full bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                  <PieChart className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">2. Take a Position</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Buy shares on the outcome you believe in. Share prices shift dynamically based on what other traders believe.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <div className="h-10 w-10 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                  <Coins className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">3. Yield Returns</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    When the market resolves, shares of the correct outcome automatically yield a proportional profit.
                  </p>
                </div>
              </div>

              <Button 
                onClick={onComplete}
                className="w-full h-12 bg-neon-green hover:bg-green-500 text-black font-bold mt-4 text-base flex items-center gap-2 group"
              >
                Enter the Market
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}