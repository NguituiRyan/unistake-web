import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { ShieldCheck, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignInPageProps {
  onSignIn: (isNewUser: boolean) => void;
  onBack: () => void; 
}

export function SignInPage({ onSignIn, onBack }: SignInPageProps) {
  const { login, loginWithEmail, registerWithEmail } = useUser();  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. Button clicked! Mode:", isSignUp ? "Sign Up" : "Log In");
    console.log("2. Email:", email, "| Password length:", password.length);
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log("3. Attempting to contact backend...");
      let result;
      
      if (isSignUp) {
        if (!registerWithEmail) throw new Error("registerWithEmail function is missing from Context!");
        result = await registerWithEmail(email, password);
      } else {
        if (!loginWithEmail) throw new Error("loginWithEmail function is missing from Context!");
        result = await loginWithEmail(email, password);
      }
      
      console.log("4. Backend responded with success!", result);
      
      onSignIn(result.isNewUser);
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!');
      
    } catch (err: any) {
      console.error("❌ ERROR CAUGHT:", err);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
      console.log("5. Loading state cleared.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-zinc-950">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Markets</span>
      </button>

      <div className="w-full max-w-md space-y-8 text-center mt-12 sm:mt-0">
        
        {/* Logo & Identity */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo.png" 
            alt="UniStake Logo" 
            className="h-14 sm:h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            Kenya's Premier Information Market
          </h1>
          <p className="text-zinc-400 font-medium">Trade on your beliefs. Profit from being right.</p>
        </div>

        {/* Auth Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-neon-blue" />
            <h2 className="text-xl font-semibold text-white">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
          </div>
          
          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:border-neon-blue"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:border-neon-blue"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-neon-blue hover:bg-blue-600 text-white font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Log In')}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="relative w-full mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          {/* GOOGLE BUTTON */}
          <div className="flex justify-center w-full hover:scale-[1.02] transition-transform">
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
              text={isSignUp ? "signup_with" : "signin_with"}
              size="large"
              width="100%"
            />
          </div>

          {/* TOGGLE SIGN UP / LOG IN */}
          <p className="mt-8 text-sm text-zinc-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-neon-blue hover:text-blue-400 font-semibold transition-colors"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}