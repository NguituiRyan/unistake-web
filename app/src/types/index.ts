export interface Market {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  totalVolume: number;
  endDate: string;
  status: 'active' | 'resolved' | 'cancelled';
  category: string;
  winner?: 'A' | 'B' | null;
  createdAt?: string;
  traders: number;
  winningOption?: string;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  nickname: string;
  balance: number;
  isAdmin: boolean;
  avatar?: string;
}

export interface Bet {
  id: string;
  marketId: string;
  userId: string;
  option: 'A' | 'B';
  amount: number;
  potentialReturn: number;
  placedAt: string;
  status: 'pending' | 'won' | 'lost';
  market?: Market;
  resolvedAt?: string;
  payout?: number;
  payout_kes?: number;
}

export interface DepositRequest {
  phoneNumber: string;
  amount: number;
}

export interface PlaceBetRequest {
  marketId: string;
  option: 'A' | 'B';
  amount: number;
}

export interface CreateMarketRequest {
  title: string;
  optionA: string;
  optionB: string;
  category: string;
  endDate: string;
}

export interface ResolveMarketRequest {
  marketId: string;
  winner: 'A' | 'B';
}

export interface LeaderboardUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  balance: number;
  totalBets: number;
  winRate: number;
  wonBets: number;
  rank?: number;
}

export interface UserStats {
  currentBalance: number;
  totalBetsPlaced: number;
  totalBetsWon: number;
  totalBetsLost: number;
  profitLoss: number;
  winRate: number;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  success: boolean;
  isNewUser: boolean;
  user?: User;
  message?: string;
}

export interface UpdateNicknameRequest {
  email: string;
  nickname: string;
}
