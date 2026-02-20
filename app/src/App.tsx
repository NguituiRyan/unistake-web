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

// IMPORTANT: Imported getMarkets to fetch real database data
import { deposit, placeBet, getMarkets } from '@/lib/api';

type PageType = 'markets' | 'admin' | 'profile' | 'leaderboard';

function AppContent() {
  const { user, isAuthenticated, updateBalance, refreshUser } = useUser();
  
  // State
  const [currentPage, setCurrentPage] = useState<PageType>('markets');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // START WITH AN EMPTY ARRAY, NO MORE MOCK DATA
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

// FETCH REAL MARKETS FROM THE DATABASE (With Auto-Refresh!)
  useEffect(() => {
    if (isAuthenticated && !showOnboarding) {
      const loadMarkets = async () => {
        try {
          const realMarkets = await getMarkets();
          setMarkets(realMarkets);
        } catch (error) {
          console.error("Failed to load markets:", error);
        }
      };
      
      loadMarkets(); // Fetch immediately on load
      
      // THE FIX: Silently fetch fresh market data every 5 seconds
      const pollInterval = setInterval(loadMarkets, 5000); 
      
      // Cleanup the timer if the user leaves the app
      return () => clearInterval(pollInterval); 
    }
  }, [isAuthenticated, showOnboarding, currentPage]);

  // Handle sign in
  const handleSignIn = (isNewUser: boolean) => {
    if (isNewUser) {
      setShowOnboarding(true);
    }
  };

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success('Welcome to UniStake!', {
      description: 'Start exploring markets and place your first bet.',
    });
  };

// --- UPDATED: HANDLE DEPOSIT (No Local Math) ---
  const handleDeposit = useCallback(async (phoneNumber: string, amount: number) => {
    if (!user) return;
    
    try {
      const result = await deposit(user.email, amount, phoneNumber);
      
      if (result.success) {
        toast.success(`Successfully deposited Ksh ${amount}`, {
          icon: <CheckCircle2 className="h-4 w-4 text-neon-green" />,
        });
        
        // NO LOCAL MATH! We force the app to quietly grab the new true balance from the database.
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


  // --- UPDATED: HANDLE PLACE BET (No Local Math) ---
  const handlePlaceBet = useCallback(async (marketId: string, option: 'A' | 'B', amount: number) => {
    if (!user) return;
    
    try {
      await placeBet(user.email, marketId, option, amount);
      
      // Update market pools locally for immediate UI bar movement
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
      
      // NO LOCAL MATH! We force the app to quietly grab the new true balance from the database.
      await refreshUser();
    } catch (error) {
      toast.error('Failed to place bet', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      throw error;
    }
  }, [user, refreshUser, setMarkets]);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'markets':
        return user ? <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} /> : null;
      case 'admin':
        return <AdminPage />;
      case 'profile':
        return <ProfilePage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      default:
        return user ? <MarketsPage markets={markets} user={user} onPlaceBet={handlePlaceBet} /> : null;
    }
  };

  // Show sign in if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#18181B',
              border: '1px solid #27272A',
              color: '#fff',
            },
          }}
        />
        <SignInPage onSignIn={handleSignIn} />
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#18181B',
              border: '1px solid #27272A',
              color: '#fff',
            },
          }}
        />
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
          style: {
            background: '#18181B',
            border: '1px solid #27272A',
            color: '#fff',
          },
        }}
      />
      
      <Navbar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onDepositClick={() => setIsDepositOpen(true)} 
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