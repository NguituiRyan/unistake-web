import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Users, TrendingUp, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  // NEW: Added a step state to create a wizard flow
  const [step, setStep] = useState<1 | 2>(1); 
  
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateNickname } = useUser();

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
        
        {/* STEP 1: TRANSPARENCY & HOW IT WORKS */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border border-neon-blue/30 mb-4">
                <Users className="h-8 w-8 text-neon-blue" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to UniStake</h1>
              <p className="text-zinc-400">Before we start, here is how the platform works.</p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
              
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-zinc-800 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Peer-to-Peer Betting</h3>
                  <p className="text-sm text-zinc-400">You aren't betting against "the house". You are predicting against other Strathmore students. The house never rigs the game.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-zinc-800 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Dynamic Payouts</h3>
                  <p className="text-sm text-zinc-400">If you win, you get your stake back PLUS your percentage share of the losing side's money.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-zinc-800 p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Transparent Fees</h3>
                  <p className="text-sm text-zinc-400">UniStake takes a flat 5% fee from the <i>profits</i> to keep the servers running. If a market is unanimous, everyone gets a 100% refund.</p>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 mt-4 bg-white hover:bg-zinc-200 text-black font-semibold"
              >
                Got it, let's go <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE CREATION (Your original form) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
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

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 px-4 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !isValidNickname(nickname) || !isValidPhone(phoneNumber)}
                    className="flex-1 h-12 bg-neon-green hover:bg-green-500 text-black font-semibold"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                    {isLoading ? 'Creating Wallet...' : 'Start Trading'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}