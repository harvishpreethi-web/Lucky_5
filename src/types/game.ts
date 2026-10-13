export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatarSeed: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface WalletState {
  depositBalance: number; // For playing entries
  winningsBalance: number; // Real winnings eligible for withdrawal
  totalBalance: number;
}

export type PaymentMethod = 'phonepe' | 'gpay' | 'paytm' | 'upi_custom';

export type TransactionType = 'deposit' | 'withdrawal' | 'entry_fee' | 'prize_won';

export type TransferNature = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string;
  type: TransactionType;
  transferType: TransferNature; // Explicit DEBIT or CREDIT
  amount: number;
  timestamp: string;
  method?: PaymentMethod;
  upiId?: string;
  accountNote: string; // e.g. "Debited from Bank/UPI → Credited to Game Wallet" or "Debited from Game Wallet → Credited to Bank Account"
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  utrNumber: string;
  roomName?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'payment' | 'withdrawal' | 'win' | 'security' | 'game';
  transferNature?: TransferNature;
  read: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  isReady: boolean;
  score: number;
  accuracy: number;
  rank?: number;
  prize?: number;
  pingMs?: number;
}

export interface GameRoom {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean; // all spots are common
  hostName: string;
  maxSlots: 5;
  currentPlayers: GamePlayer[];
  entryFee: 100; // All spots are 100 rs
  prizes: {
    first: 200;
    second: 150;
    third: 100;
  };
  status: 'WAITING' | 'MATCHMAKING' | 'IN_PROGRESS' | 'COMPLETED';
  category: 'Speed Blitz' | 'Pro Clash' | 'Reflex Duel' | 'Common Arena';
}

export type AppView = 'lobby' | 'matchmaking' | 'game' | 'podium';

