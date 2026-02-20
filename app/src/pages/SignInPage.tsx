import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { GraduationCap, ShieldCheck } from 'lucide-react';

interface SignInPageProps {
  onSignIn: (isNewUser: boolean) => void;
}

export function SignInPage({ onSignIn }: SignInPageProps) {
  const { login } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo Area */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-neon-blue rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Uni<span className="text-neon-blue">Stake</span>
          </h1>
          <p className="text-zinc-400">Campus Prediction Markets</p>
        </div>

        {/* Login Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-neon-green" />
            <h2 className="text-xl font-semibold text-white">Student Access</h2>
          </div>
          
          <p className="text-sm text-zinc-400 mb-8">
            Please sign in with your Strathmore University email address to continue.
          </p>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    const result = await login(credentialResponse.credential);
                    onSignIn(result.isNewUser);
                  } catch (err: any) {
                    toast.error(err.message || 'Login failed');
                  }
                }
              }}
              onError={() => {
                toast.error('Google Sign-In Failed');
              }}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
              size="large"
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-1 rounded bg-neon-green/20 text-neon-green">KES</span>
              <p className="font-medium text-white text-sm">Bet with KES</p>
            </div>
            <p className="text-xs text-zinc-500">M-Pesa integration coming soon</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-1 rounded bg-neon-blue/20 text-neon-blue">#1</span>
              <p className="font-medium text-white text-sm">Compete</p>
            </div>
            <p className="text-xs text-zinc-500">Climb the campus leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}