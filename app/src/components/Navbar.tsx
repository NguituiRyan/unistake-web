import { Wallet, TrendingUp, Shield, User, Trophy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

type PageType = 'markets' | 'admin' | 'profile' | 'leaderboard';

interface NavbarProps {
  currentPage?: PageType;
  onPageChange?: (page: PageType) => void;
  onDepositClick: () => void;
}

const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Navbar({ currentPage = 'markets', onPageChange, onDepositClick }: NavbarProps) {
  const { user, isAuthenticated, logout, isAdmin } = useUser();

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Add admin nav item if user is admin
  const allNavItems = isAdmin 
    ? [...navItems, { id: 'admin' as PageType, label: 'Admin', icon: Shield }]
    : navItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-6xl">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onPageChange?.('markets')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-blue to-blue-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Uni<span className="text-neon-blue">Stake</span>
          </span>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange?.(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-neon-blue' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right side - Balance, User & Deposit */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user && (
            <>
              {/* Balance */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 border border-zinc-800">
                <Wallet className="h-4 w-4 text-neon-green" />
                <span className="text-sm font-medium text-zinc-400">Balance</span>
                <span className="text-sm font-semibold text-white">
                  {formatBalance(user.balance)}
                </span>
              </div>
              
              {/* Mobile balance - compact */}
              <div className="flex sm:hidden items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 border border-zinc-800">
                <Wallet className="h-4 w-4 text-neon-green" />
                <span className="text-sm font-semibold text-white">
                  {formatBalance(user.balance)}
                </span>
              </div>

              {/* User nickname */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-zinc-500">{user.nickname}</span>
              </div>

              <Button
                onClick={onDepositClick}
                className="bg-neon-green hover:bg-green-500 text-black font-semibold px-3 sm:px-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <span className="hidden sm:inline">Deposit</span>
                <span className="sm:hidden">+</span>
              </Button>

              {/* Logout - Desktop */}
              <button
                onClick={logout}
                className="hidden md:flex p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-around py-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange?.(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-500'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-neon-blue' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
            {/* Mobile Logout */}
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-zinc-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
