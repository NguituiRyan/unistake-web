import type { 
  Market, 
  Bet, 
  LeaderboardUser, 
  Thesis
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== MARKET APIs ====================
export async function getMarkets(): Promise<Market[]> {
  const rawMarkets = await fetcher<any[]>('/api/markets', { method: 'GET' });
  
  return rawMarkets.map(m => ({
    id: m.id.toString(),
    title: m.title,
    optionA: m.option_a,
    optionB: m.option_b,
    poolA: parseFloat(m.option_a_pool) || 0,
    poolB: parseFloat(m.option_b_pool) || 0,
    totalVolume: (parseFloat(m.option_a_pool) || 0) + (parseFloat(m.option_b_pool) || 0),
    endDate: m.end_date || new Date().toISOString(),
    status: m.is_resolved ? 'resolved' : 'active',
    category: m.category || 'General',
    traders: parseInt(m.traders_count) || 0,
  }));
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  return fetcher<LeaderboardUser[]>('/api/leaderboard', { method: 'GET' });
}

export async function createMarket(email: string, data: any): Promise<any> {
  // 🚨 SAFETY NET: If the frontend forgets the email, force the Admin email!
  const finalEmail = email || "nguitui.kamau@gmail.com"; 

  const response = await fetch('https://unistake-backend.onrender.com/api/markets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: finalEmail, 
      title: data.title,
      option_a: data.optionA || data.option_a, // Catches it regardless of how it's formatted
      option_b: data.optionB || data.option_b,
      category: data.category,
      end_date: data.endDate || data.end_date
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create market');
  }

  return response.json();
}

export async function resolveMarket(data: any): Promise<any> {
  return fetcher<any>('/api/resolve', {
    method: 'POST',
    body: JSON.stringify({
      market_id: data.marketId,
      winning_option: data.winner
    }),
  });
}

export async function getTheses(marketId: string): Promise<Thesis[]> {
  const raw = await fetcher<any[]>(`/api/theses/${marketId}`, { method: 'GET' });
  return raw.map(t => ({
    id: t.id.toString(),
    nickname: t.nickname,
    content: t.content,
    chosenOption: t.chosen_option,
    amount: parseFloat(t.amount_kes),
    createdAt: t.created_at
  }));
}

// ==================== TRADE APIs (UPDATED FOR THESIS) ====================
export async function placeBet(email: string, marketId: string, option: 'A' | 'B', amount: number, thesis?: string): Promise<Bet> {
  return fetcher<Bet>('/api/bet', {
    method: 'POST',
    body: JSON.stringify({ 
      email: email, 
      market_id: marketId, 
      chosen_option: option, 
      amount_kes: amount,
      thesis: thesis // NEW: Transmit the reasoning!
    }),
  });
}

// ==================== UTILITY FUNCTIONS ====================
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const prefix = phone.slice(0, 6);
  const suffix = phone.slice(-3);
  const maskedLength = phone.length - 9;
  const masked = '*'.repeat(Math.max(3, maskedLength));
  return `${prefix}${masked}${suffix}`;
}

export function calculateOdds(poolA: number, poolB: number, option: 'A' | 'B'): number {
  const totalPool = poolA + poolB;
  if (totalPool === 0) return 50;
  const pool = option === 'A' ? poolA : poolB;
  return (pool / totalPool) * 100;
}

export async function deposit(email: string, amount: number, phone: string): Promise<any> {
  return fetcher<any>('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ email, amount_kes: amount, phone_number: phone }),
  });
}

export function calculatePotentialReturn(
  betAmount: number, 
  poolA: number, 
  poolB: number, 
  option: 'A' | 'B'
): number {
  const totalPool = poolA + poolB;
  const targetPool = option === 'A' ? poolA : poolB;
  
  if (targetPool + betAmount === 0) return 0;
  
  const newTotalPool = totalPool + betAmount;
  return (betAmount * newTotalPool) / (targetPool + betAmount);
}

export const mockMarkets: any[] = [];
export const mockBets: any[] = [];
export const mockLeaderboard: any[] = [];