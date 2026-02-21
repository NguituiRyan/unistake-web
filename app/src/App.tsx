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
import { Footer } from '@/components/Footer';
import type { Market } from '@/types';

import { deposit, placeBet, getMarkets } from '@/lib/api';

type PageType = 'markets' | 'admin' | 'profile' | 'leaderboard';

function AppContent() {
  const { user, isAuthenticated, refreshUser } = useUser();
  
  // State
  const [currentPage, setCurrentPage] = useState<PageType>('markets');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // FETCH REAL MARKETS FROM THE DATABASE (With Auto-Refresh!)
  useEffect(() => {
    if (!showOnboarding) {
      const loadMarkets = async () => {
        try {
          const realMarkets = await getMarkets();
          setMarkets(realMarkets);
          
          if (isAuthenticated) {
            await refreshUser();
          }
        } catch (error) {
          console.error("Failed to load markets:", error);
        }
      };
      
      loadMarkets(); // Fetch immediately on load
      const pollInterval = setInterval(loadMarkets, 5000); 
      return () => clearInterval(pollInterval); 
    }
  }, [showOnboarding, isAuthenticated, refreshUser]); 

  const handleSignIn = (isNewUser: boolean) => {
    setShowSignIn(false); 
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
        return <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'admin':
        return user?.isAdmin ? <AdminPage /> : <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      case 'profile':
        return user ? <ProfilePage /> : <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
      default:
        return <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} />;
    }
  };

  // ON-DEMAND SIGN IN
  if (showSignIn && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <SignInPage 
          onSignIn={handleSignIn} 
          onBack={() => setShowSignIn(false)} 
        />
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

  // --- THE FIX: Only ONE correct return block here! ---
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col"> 
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
        onSignInClick={() => setShowSignIn(true)} 
      />

      {/* Main content expands to push the footer down */}
      <div className="flex-1">
        {renderPage()}
      </div>

      {/* The Footer firmly planted at the bottom */}
      <Footer />

      {/* Modals/Drawers stay out of the visual flow */}
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