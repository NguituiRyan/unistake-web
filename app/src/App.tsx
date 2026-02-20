import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { Navbar } from '@/components/Navbar';
import { DepositDrawer } from '@/components/DepositDrawer';
import { SignInPage } from '@/pages/SignInPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { MarketsPage } from '@/pages/MarketsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import type { Market } from '@/types';

import { deposit, placeBet, getMarkets } from '@/lib/api';

type PageType = 'markets' | 'admin' | 'profile' | 'leaderboard';

function AppContent() {
  const { user, isAuthenticated, refreshUser } = useUser();
  
  // State
  const [currentPage, setCurrentPage] = useState<PageType>('markets');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false); // <-- NEW: Controls the login screen overlay
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // FETCH REAL MARKETS: Now fetches for EVERYONE (removed isAuthenticated check)
  useEffect(() => {
    if (!showOnboarding) {
      const loadMarkets = async () => {
        try {
          const realMarkets = await getMarkets();
          setMarkets(realMarkets);
        } catch (error) {
          console.error("Failed to load markets:", error);
        }
      };
      
      loadMarkets(); 
      const pollInterval = setInterval(loadMarkets, 5000); 
      return () => clearInterval(pollInterval); 
    }
  }, [showOnboarding]);

  const handleSignIn = (isNewUser: boolean) => {
    setShowSignIn(false); // Close the sign-in view when done
    if (isNewUser) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success('Welcome to UniStake!', {
      description: 'Start exploring markets and place your first bet.',
    });
  };

  const handleDeposit = useCallback(async (phoneNumber: string, amount: number) => {
    if (!user) return;
    try {
      const result = await deposit(user.email, amount, phoneNumber);
      if (result.success) {
        toast.success(`Successfully deposited Ksh ${amount}`, {
          icon: <CheckCircle2 className="h-4 w-4 text-neon-green" />,
        });
        await refreshUser();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error('Deposit failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      throw error;
    }
  }, [user, refreshUser]);

  const handlePlaceBet = useCallback(async (marketId: string, option: 'A' | 'B', amount: number) => {
    if (!user) {
      // THE BOUNCER: If guest tries to place a bet, show the sign-in screen!
      setShowSignIn(true);
      return;
    }
    
    try {
      await placeBet(user.email, marketId, option, amount);
      setMarkets(prev => prev.map(market => {
        if (market.id === marketId) {
          return {
            ...market,
            poolA: option === 'A' ? market.poolA + amount : market.poolA,
            poolB: option === 'B' ? market.poolB + amount : market.poolB,
            totalVolume: market.totalVolume + amount,
          };
        }
        return market;
      }));
      
      toast.success('Bet placed successfully!', {
        icon: <CheckCircle2 className="h-4 w-4 text-neon-green" />,
      });
      await refreshUser();
    } catch (error) {
      toast.error('Failed to place bet', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      throw error;
    }
  }, [user, refreshUser, setMarkets]);

  const renderPage = () => {
    switch (currentPage) {
      case 'markets':
        // PUBLIC: Anyone can see this!
        return <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      case 'leaderboard':
        // PUBLIC: Anyone can see this!
        return <LeaderboardPage />;
      case 'admin':
        // PROTECTED
        return user?.isAdmin ? <AdminPage /> : <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      case 'profile':
        // PROTECTED
        return user ? <ProfilePage /> : <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      default:
        return <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
    }
  };

  // ON-DEMAND SIGN IN: Only shows if they explicitly trigger it
  if (showSignIn && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <SignInPage onSignIn={handleSignIn} />
        {/* Optional: Add a "Back to Markets" cancel button inside your SignInPage! */}
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <OnboardingPage onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          style: { background: '#18181B', border: '1px solid #27272A', color: '#fff' },
        }}
      />
      
      <Navbar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onDepositClick={() => setIsDepositOpen(true)} 
        onSignInClick={() => setShowSignIn(true)} // <-- NEW: Passed down to Navbar
      />

      {renderPage()}

      <DepositDrawer
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;