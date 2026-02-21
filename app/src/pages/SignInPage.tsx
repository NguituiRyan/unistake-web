import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react'; // <-- Added ArrowLeft

interface SignInPageProps {
  onSignIn: (isNewUser: boolean) => void;
  onBack: () => void; // <-- NEW: Added onBack prop
}

export function SignInPage({ onSignIn, onBack }: SignInPageProps) {
  const { login } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      
      {/* NEW: The Back Button Escape Hatch */}
      <button
        onClick={onBack}
        className="absolute top-6 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Markets</span>
      </button>

      <div className="w-full max-w-md space-y-8 text-center mt-12 sm:mt-0">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-neon-green" />
            <h2 className="text-xl font-semibold text-white">Student Access</h2>
          </div>
          
          <div className="w-full p-4 mb-8 rounded-lg bg-zinc-950/50 border border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm leading-relaxed">
              Security Check: You <span className="text-white font-bold">MUST</span> use your official <br className="hidden sm:block" />
              <span className="text-white font-bold text-base bg-zinc-800 px-2 py-1 rounded-md mx-1 shadow-sm">@strathmore.edu</span>
              <br className="hidden sm:block" />
              email to join the platform.
            </p>
          </div>

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
      </div>
    </div>
  );
}