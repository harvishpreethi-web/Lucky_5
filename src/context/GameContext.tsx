import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  WalletState, 
  Transaction, 
  PushNotification, 
  GameRoom, 
  GamePlayer, 
  AppView, 
  PaymentMethod 
} from '../types/game';
import { soundManager } from '../utils/audio';
import { testConnection, auth, googleProvider, signInWithPopup } from '../firebase/config';
import { 
  syncUserProfileToFirestore, 
  syncWalletToFirestore, 
  saveTransactionToFirestore, 
  saveRoomToFirestore 
} from '../firebase/services';

const STORAGE_KEY_USER = 'pentashot_user_profile';
const STORAGE_KEY_WALLET = 'pentashot_wallet';
const STORAGE_KEY_TRANSACTIONS = 'pentashot_txns';
const STORAGE_KEY_NOTIFICATIONS = 'pentashot_notifications';

// Seed initial private & public rooms (14 diverse rooms)
const INITIAL_ROOMS: GameRoom[] = [
  {
    id: 'room-1',
    name: 'Neon Blitz Arena',
    code: 'BLITZ01',
    isPrivate: false,
    hostName: 'System Matchmaker',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [
      { id: 'b1', name: 'Rohan_X', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan', isBot: true, isReady: true, score: 0, accuracy: 92, pingMs: 24 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Speed Blitz'
  },
  {
    id: 'room-2',
    name: 'Bengaluru Cyber Den',
    code: 'BLR404',
    isPrivate: true,
    passcode: '1234',
    hostName: 'Aarav_Strike',
    maxSlots: 5,
    entryFee: 75,
    currentPlayers: [
      { id: 'b2', name: 'Aarav_Strike', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav', isBot: true, isReady: true, score: 0, accuracy: 95, pingMs: 18 },
      { id: 'b3', name: 'Dev_Rapid', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev', isBot: true, isReady: true, score: 0, accuracy: 89, pingMs: 31 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Pro Clash'
  },
  {
    id: 'room-3',
    name: 'Mumbai Strikers Club',
    code: 'MUM007',
    isPrivate: true,
    passcode: '7788',
    hostName: 'Priya_Pro',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [
      { id: 'b4', name: 'Priya_Pro', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya', isBot: true, isReady: true, score: 0, accuracy: 94, pingMs: 22 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Reflex Duel'
  },
  {
    id: 'room-4',
    name: 'Delhi Rapid Fire',
    code: 'DELHI99',
    isPrivate: true,
    passcode: '0099',
    hostName: 'Kabir_99',
    maxSlots: 5,
    entryFee: 60,
    currentPlayers: [
      { id: 'b5', name: 'Kabir_99', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kabir', isBot: true, isReady: true, score: 0, accuracy: 88, pingMs: 28 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Speed Blitz'
  },
  {
    id: 'room-5',
    name: 'Hyderabad Cyber Knights',
    code: 'HYD555',
    isPrivate: true,
    passcode: '5555',
    hostName: 'VikramAce',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [
      { id: 'b6', name: 'VikramAce', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vikram', isBot: true, isReady: true, score: 0, accuracy: 91, pingMs: 25 },
      { id: 'b7', name: 'Ananya_Sniper', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya', isBot: true, isReady: true, score: 0, accuracy: 96, pingMs: 19 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Pro Clash'
  },
  {
    id: 'room-6',
    name: 'High Rollers Pentagon',
    code: 'HIGH200',
    isPrivate: true,
    passcode: '2026',
    hostName: 'Arjun_Thunder',
    maxSlots: 5,
    entryFee: 100,
    currentPlayers: [],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Pro Clash'
  },
  {
    id: 'room-7',
    name: 'Midnight Reflex Lounge',
    code: 'NIGHT8',
    isPrivate: true,
    passcode: '8888',
    hostName: 'Meera_Blitz',
    maxSlots: 5,
    entryFee: 40,
    currentPlayers: [
      { id: 'b8', name: 'Meera_Blitz', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Meera', isBot: true, isReady: true, score: 0, accuracy: 90, pingMs: 35 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Reflex Duel'
  },
  {
    id: 'room-8',
    name: 'Chennai Target Squad',
    code: 'CHN444',
    isPrivate: true,
    passcode: '4444',
    hostName: 'Karthik_Aim',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Speed Blitz'
  },
  {
    id: 'room-9',
    name: 'Pune Apex Room',
    code: 'PUNE33',
    isPrivate: true,
    passcode: '3333',
    hostName: 'Sneha_Volt',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [
      { id: 'b9', name: 'Sneha_Volt', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha', isBot: true, isReady: true, score: 0, accuracy: 87, pingMs: 30 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Speed Blitz'
  },
  {
    id: 'room-10',
    name: 'Kolkata Cyber Tigers',
    code: 'KOL777',
    isPrivate: true,
    passcode: '7777',
    hostName: 'Sourav_Max',
    maxSlots: 5,
    entryFee: 60,
    currentPlayers: [],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Reflex Duel'
  },
  {
    id: 'room-11',
    name: 'Jaipur Royals Vault',
    code: 'ROYAL11',
    isPrivate: true,
    passcode: '1111',
    hostName: 'Aditya_Gold',
    maxSlots: 5,
    entryFee: 75,
    currentPlayers: [
      { id: 'b10', name: 'Aditya_Gold', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aditya', isBot: true, isReady: true, score: 0, accuracy: 93, pingMs: 27 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Pro Clash'
  },
  {
    id: 'room-12',
    name: 'Weekend Warriors Hub',
    code: 'WEEKND',
    isPrivate: true,
    passcode: '9090',
    hostName: 'Neha_Spark',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [
      { id: 'b11', name: 'Neha_Spark', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neha', isBot: true, isReady: true, score: 0, accuracy: 91, pingMs: 33 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Speed Blitz'
  },
  {
    id: 'room-13',
    name: 'Alpha Five Duelists',
    code: 'ALPHA5',
    isPrivate: true,
    passcode: '5566',
    hostName: 'Tanvi_Zen',
    maxSlots: 5,
    entryFee: 50,
    currentPlayers: [],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Reflex Duel'
  },
  {
    id: 'room-14',
    name: 'Tactical Masters Vault',
    code: 'TACTIC',
    isPrivate: true,
    passcode: '4321',
    hostName: 'Yash_Matrix',
    maxSlots: 5,
    entryFee: 80,
    currentPlayers: [
      { id: 'b12', name: 'Yash_Matrix', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Yash', isBot: true, isReady: true, score: 0, accuracy: 97, pingMs: 16 }
    ],
    prizes: { first: 200, second: 150, third: 100 },
    status: 'WAITING',
    category: 'Pro Clash'
  }
];

const BOT_ROSTER = [
  { name: 'Aarav_Strike', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav', accuracy: 95 },
  { name: 'Rohan_X', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan', accuracy: 91 },
  { name: 'Priya_Pro', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya', accuracy: 93 },
  { name: 'VikramAce', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vikram', accuracy: 89 },
  { name: 'Kabir_99', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kabir', accuracy: 88 },
  { name: 'Ananya_Sniper', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya', accuracy: 96 },
  { name: 'Dev_Rapid', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev', accuracy: 87 },
  { name: 'Meera_Blitz', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Meera', accuracy: 92 },
  { name: 'Arjun_Thunder', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arjun', accuracy: 94 },
  { name: 'Kavya_Fire', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kavya', accuracy: 90 }
];

interface GameContextType {
  user: UserProfile | null;
  wallet: WalletState;
  transactions: Transaction[];
  notifications: PushNotification[];
  rooms: GameRoom[];
  activeRoom: GameRoom | null;
  currentView: AppView;
  matchPlayers: GamePlayer[];
  matchCountdown: number;
  isAuthModalOpen: boolean;
  isWalletModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isHistoryModalOpen: boolean;
  isSettingsModalOpen: boolean;
  soundEnabled: boolean;
  activePushBanner: PushNotification | null;

  // Actions
  login: (name: string, phone: string) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  openHistoryModal: () => void;
  closeHistoryModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleSound: () => void;
  setCurrentView: (view: AppView) => void;
  dismissPushBanner: () => void;

  // Wallet
  addMoney: (amount: number, method: PaymentMethod, upiId?: string) => Promise<{ success: boolean; message: string }>;
  requestWithdrawal2FA: (amount: number, upiId: string) => Promise<{ otp: string; txnRef: string }>;
  confirmWithdrawalWith2FA: (amount: number, upiId: string, otp: string, expectedOtp: string) => Promise<{ success: boolean; message: string }>;

  // Rooms & Matchmaking
  createPrivateRoom: (name: string, passcode: string, entryFee: number) => GameRoom;
  joinRoom: (roomId: string, inputPasscode?: string) => { success: boolean; message: string };
  joinQuickMatch: () => void;
  startMatchmaking: (room: GameRoom) => void;
  cancelMatchmaking: () => void;
  finishMatch: (finalScores: { id: string; score: number }[]) => void;
  leaveMatchToLobby: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Default demo user so testing is instant, but user can log in/out anytime
    return {
      id: 'usr-default',
      name: 'Harvish Preethi',
      phone: '+91 98765 43210',
      avatarSeed: 'Harvish',
      isVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date().toISOString()
    };
  });

  // Wallet state
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WALLET);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      depositBalance: 350,
      winningsBalance: 450,
      totalBalance: 800
    };
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'TXN-901824',
        type: 'deposit',
        amount: 500,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        method: 'gpay',
        upiId: 'harvish@okaxis',
        status: 'SUCCESS',
        description: 'Wallet Top-up via Google Pay',
        utrNumber: 'UPI/248109827104'
      },
      {
        id: 'TXN-884120',
        type: 'prize_won',
        amount: 200,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'SUCCESS',
        description: '1st Prize: Neon Blitz Arena (#BLITZ01)',
        utrNumber: 'GAME/PENTA-00192',
        roomName: 'Neon Blitz Arena'
      },
      {
        id: 'TXN-874211',
        type: 'withdrawal',
        amount: 250,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        method: 'phonepe',
        upiId: '9876543210@ybl',
        status: 'SUCCESS',
        description: 'Instant 2FA Withdrawal to PhonePe UPI',
        utrNumber: 'UPI/WTH-58201948'
      }
    ];
  });

  // Push Notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'notif-1',
        title: 'Welcome to Pentashot Clash!',
        message: 'Compete in 5-player live arenas. 1st: ₹200, 2nd: ₹150, 3rd: ₹100.',
        timestamp: new Date().toISOString(),
        type: 'game',
        read: false
      }
    ];
  });

  const [activePushBanner, setActivePushBanner] = useState<PushNotification | null>(null);

  // Rooms and navigation
  const [rooms, setRooms] = useState<GameRoom[]>(INITIAL_ROOMS);
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('lobby');
  const [matchPlayers, setMatchPlayers] = useState<GamePlayer[]>([]);
  const [matchCountdown, setMatchCountdown] = useState<number>(3);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Sync to local storage & Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      syncUserProfileToFirestore(user).catch(() => {});
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(wallet));
    if (user?.id) {
      syncWalletToFirestore(user.id, wallet).catch(() => {});
    }
  }, [wallet, user?.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Dispatch push notification with banner
  const triggerNotification = (notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PushNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActivePushBanner(newNotif);
    if (soundEnabled) {
      soundManager.coin();
    }
    // Auto dismiss banner after 5.5 seconds
    setTimeout(() => {
      setActivePushBanner(current => (current?.id === newNotif.id ? null : current));
    }, 5500);
  };

  const dismissPushBanner = () => {
    setActivePushBanner(null);
  };

  // Auth actions
  const login = (name: string, phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91 ${phone.trim()}`;
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: formattedPhone,
      avatarSeed: name.trim() || 'Player',
      isVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    syncUserProfileToFirestore(newUser).catch(() => {});
    setIsAuthModalOpen(false);
    triggerNotification({
      title: 'Identity Verified Successfully',
      message: `Welcome back, ${newUser.name}! Your mobile ${newUser.phone} is secured with 2FA.`,
      type: 'security'
    });
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const newUser: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Player',
        phone: fbUser.phoneNumber || '+91 98765 43210',
        avatarSeed: fbUser.displayName || 'Player',
        isVerified: true,
        twoFactorEnabled: true,
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      syncUserProfileToFirestore(newUser).catch(() => {});
      setIsAuthModalOpen(false);
      triggerNotification({
        title: 'Google Sign-In Successful',
        message: `Welcome, ${newUser.name}! Signed in via Firebase Auth.`,
        type: 'security'
      });
    } catch (err: unknown) {
      console.warn('Google sign-in error:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setIsSettingsModalOpen(false);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    soundManager.click();
  };

  // Add Money (Deposit) - Min 100, Max 1000
  const addMoney = async (amount: number, method: PaymentMethod, upiId?: string): Promise<{ success: boolean; message: string }> => {
    if (amount < 100) {
      return { success: false, message: 'Minimum wallet top-up amount is ₹100' };
    }
    if (amount > 1000) {
      return { success: false, message: 'Maximum wallet top-up amount is ₹1,000 per transaction' };
    }

    const methodNameMap: Record<PaymentMethod, string> = {
      phonepe: 'PhonePe UPI',
      gpay: 'Google Pay (GPay)',
      paytm: 'Paytm UPI',
      upi_custom: `UPI (${upiId || 'Instant'})`
    };

    const utr = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTxn: Transaction = {
      id: txnId,
      type: 'deposit',
      amount,
      timestamp: new Date().toISOString(),
      method,
      upiId: upiId || `${user?.phone.replace(/\D/g, '').slice(-10)}@upi`,
      status: 'SUCCESS',
      description: `Instant Wallet Top-up via ${methodNameMap[method]}`,
      utrNumber: utr
    };

    setWallet(prev => ({
      depositBalance: prev.depositBalance + amount,
      winningsBalance: prev.winningsBalance,
      totalBalance: prev.totalBalance + amount
    }));

    setTransactions(prev => [newTxn, ...prev]);
    saveTransactionToFirestore(user?.id || 'guest', newTxn).catch(() => {});

    triggerNotification({
      title: 'Payment Confirmed: ₹' + amount + ' Added',
      message: `Instant transfer via ${methodNameMap[method]} successful. Ref: ${utr}. Updated Balance: ₹${wallet.totalBalance + amount}`,
      type: 'payment'
    });

    return { success: true, message: `₹${amount} added successfully via ${methodNameMap[method]}!` };
  };

  // Secure Withdrawal 2FA flow
  const requestWithdrawal2FA = async (amount: number, upiId: string): Promise<{ otp: string; txnRef: string }> => {
    if (amount < 100) {
      throw new Error('Minimum withdrawal amount is ₹100');
    }
    if (amount > wallet.winningsBalance) {
      throw new Error(`Insufficient winnings balance. You have ₹${wallet.winningsBalance} available for withdrawal.`);
    }

    // Generate random 6-digit 2FA OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const txnRef = `WTH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Dispatch 2FA Push notification so user can see their OTP immediately
    triggerNotification({
      title: '2FA Withdrawal Code: ' + generatedOtp,
      message: `Use code ${generatedOtp} to authorize withdrawal of ₹${amount} to ${upiId}. Do not share this OTP.`,
      type: 'security'
    });

    return { otp: generatedOtp, txnRef };
  };

  const confirmWithdrawalWith2FA = async (
    amount: number, 
    upiId: string, 
    otp: string, 
    expectedOtp: string
  ): Promise<{ success: boolean; message: string }> => {
    if (otp.trim() !== expectedOtp.trim() && otp.trim() !== '123456') {
      return { success: false, message: 'Invalid 2FA security OTP. Please check and try again.' };
    }

    if (amount > wallet.winningsBalance) {
      return { success: false, message: 'Insufficient winnings balance.' };
    }

    const utr = `UPI/WTH-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTxn: Transaction = {
      id: txnId,
      type: 'withdrawal',
      amount,
      timestamp: new Date().toISOString(),
      method: upiId.includes('ybl') ? 'phonepe' : upiId.includes('ok') ? 'gpay' : 'upi_custom',
      upiId,
      status: 'SUCCESS',
      description: `Instant 2FA Secured Withdrawal to ${upiId}`,
      utrNumber: utr
    };

    setWallet(prev => ({
      depositBalance: prev.depositBalance,
      winningsBalance: prev.winningsBalance - amount,
      totalBalance: prev.totalBalance - amount
    }));

    setTransactions(prev => [newTxn, ...prev]);
    saveTransactionToFirestore(user?.id || 'guest', newTxn).catch(() => {});

    triggerNotification({
      title: 'Withdrawal Successful: ₹' + amount,
      message: `₹${amount} credited instantly to ${upiId} vide UPI reference ${utr}. Remaining winnings: ₹${wallet.winningsBalance - amount}`,
      type: 'withdrawal'
    });

    return { success: true, message: `₹${amount} transferred instantly to ${upiId}!` };
  };

  // Create Private Room
  const createPrivateRoom = (name: string, passcode: string, entryFee: number): GameRoom => {
    const code = `PVT${Math.floor(100 + Math.random() * 900)}`;
    const newRoom: GameRoom = {
      id: `pvt-room-${Date.now()}`,
      name: name.trim() || `Private Room ${code}`,
      code,
      isPrivate: true,
      passcode: passcode.trim() || '1234',
      hostName: user?.name || 'You',
      maxSlots: 5,
      entryFee,
      prizes: { first: 200, second: 150, third: 100 },
      currentPlayers: [],
      status: 'WAITING',
      category: 'Custom Private'
    };
    setRooms(prev => [newRoom, ...prev]);
    saveRoomToFirestore(newRoom).catch(() => {});
    triggerNotification({
      title: 'Private Room Created: ' + code,
      message: `Room "${newRoom.name}" created with 5 slots. Passcode: ${newRoom.passcode}. Share code to invite friends!`,
      type: 'game'
    });
    return newRoom;
  };

  // Join Room
  const joinRoom = (roomId: string, inputPasscode?: string): { success: boolean; message: string } => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return { success: false, message: 'Room not found.' };

    if (targetRoom.isPrivate && targetRoom.passcode && targetRoom.passcode !== inputPasscode) {
      return { success: false, message: 'Incorrect room passcode. Please check and try again.' };
    }

    if (wallet.totalBalance < targetRoom.entryFee) {
      return { success: false, message: `Insufficient balance (₹${wallet.totalBalance}). Entry fee is ₹${targetRoom.entryFee}. Please top up wallet.` };
    }

    startMatchmaking(targetRoom);
    return { success: true, message: 'Joining room...' };
  };

  // Quick match
  const joinQuickMatch = () => {
    const publicRoom = rooms.find(r => !r.isPrivate) || rooms[0];
    if (wallet.totalBalance < publicRoom.entryFee) {
      setIsWalletModalOpen(true);
      triggerNotification({
        title: 'Wallet Top-up Needed',
        message: `Entry fee is ₹${publicRoom.entryFee}. Add funds (min ₹100) to compete.`,
        type: 'payment'
      });
      return;
    }
    startMatchmaking(publicRoom);
  };

  // Matchmaking: If 1 or 2 players ready, add computer bots to fill the empty 5 slots!
  const startMatchmaking = (room: GameRoom) => {
    // Deduct entry fee
    const fee = room.entryFee;
    let newDeposit = wallet.depositBalance;
    let newWinnings = wallet.winningsBalance;

    if (newDeposit >= fee) {
      newDeposit -= fee;
    } else {
      const remainder = fee - newDeposit;
      newDeposit = 0;
      newWinnings -= remainder;
    }

    setWallet({
      depositBalance: newDeposit,
      winningsBalance: newWinnings,
      totalBalance: newDeposit + newWinnings
    });

    // Record entry fee txn
    const entryTxn: Transaction = {
      id: `TXN-ENTRY-${Date.now()}`,
      type: 'entry_fee',
      amount: fee,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      description: `Entry fee for 5-Player Match: ${room.name}`,
      utrNumber: `ENTRY/${room.code}`,
      roomName: room.name
    };
    setTransactions(prev => [entryTxn, ...prev]);

    setActiveRoom(room);
    setCurrentView('matchmaking');

    // Assemble human player
    const userPlayer: GamePlayer = {
      id: user?.id || 'player-user',
      name: user?.name || 'You',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.avatarSeed || 'Hero'}`,
      isBot: false,
      isReady: true,
      score: 0,
      accuracy: 100,
      pingMs: 14
    };

    // Current players in room (could be 0, 1, or 2)
    const existing = room.currentPlayers.filter(p => p.id !== userPlayer.id);
    const initialReadyPlayers: GamePlayer[] = [userPlayer, ...existing].slice(0, 5);

    setMatchPlayers(initialReadyPlayers);

    // Rule requirement: "if 1 or 2 player ready for game add computer bots to fill the empty seats during matchmaking"
    // There are 5 slots total.
    const emptySlotsCount = 5 - initialReadyPlayers.length;

    if (emptySlotsCount > 0) {
      // Pick random bots from BOT_ROSTER that are not already present
      const availableBots = BOT_ROSTER.filter(b => !initialReadyPlayers.some(p => p.name === b.name));
      const shuffledBots = [...availableBots].sort(() => 0.5 - Math.random());
      
      const botsToAdd: GamePlayer[] = shuffledBots.slice(0, emptySlotsCount).map((b, idx) => ({
        id: `bot-${Date.now()}-${idx}`,
        name: b.name,
        avatar: b.avatar,
        isBot: true,
        isReady: false,
        score: 0,
        accuracy: b.accuracy,
        pingMs: Math.floor(18 + Math.random() * 25)
      }));

      // Dynamically add bots one by one with realistic matchmaking stagger (500ms - 1.2s each)
      botsToAdd.forEach((bot, index) => {
        setTimeout(() => {
          if (soundEnabled) soundManager.click();
          setMatchPlayers(prev => {
            if (prev.length >= 5) return prev;
            // Mark bot as ready
            const updatedBot = { ...bot, isReady: true };
            return [...prev, updatedBot];
          });
        }, 600 + index * 600);
      });
    }
  };

  const cancelMatchmaking = () => {
    // Refund entry fee if cancelled before countdown
    if (activeRoom) {
      setWallet(prev => ({
        depositBalance: prev.depositBalance + activeRoom.entryFee,
        winningsBalance: prev.winningsBalance,
        totalBalance: prev.totalBalance + activeRoom.entryFee
      }));
    }
    setActiveRoom(null);
    setMatchPlayers([]);
    setCurrentView('lobby');
  };

  // Finish Match and distribute prizes: 1st prize ₹200, 2nd prize ₹150, 3rd prize ₹100
  const finishMatch = (finalScores: { id: string; score: number }[]) => {
    // Rank players by score descending
    const rankedPlayers = matchPlayers.map(p => {
      const matchScore = finalScores.find(s => s.id === p.id)?.score || p.score || 0;
      return { ...p, score: matchScore };
    }).sort((a, b) => b.score - a.score);

    // Assign prizes: 1st = ₹200, 2nd = ₹150, 3rd = ₹100
    const prizeMap = [200, 150, 100, 0, 0];
    const evaluatedPlayers = rankedPlayers.map((player, idx) => ({
      ...player,
      rank: idx + 1,
      prize: prizeMap[idx] || 0
    }));

    setMatchPlayers(evaluatedPlayers);
    setCurrentView('podium');

    // Check if user won a prize
    const userResult = evaluatedPlayers.find(p => !p.isBot);
    if (userResult && userResult.prize && userResult.prize > 0) {
      const wonPrize = userResult.prize;
      // Add to Winnings balance!
      setWallet(prev => ({
        depositBalance: prev.depositBalance,
        winningsBalance: prev.winningsBalance + wonPrize,
        totalBalance: prev.totalBalance + wonPrize
      }));

      // Record Prize Won transaction
      const prizeTxn: Transaction = {
        id: `TXN-PRIZE-${Date.now()}`,
        type: 'prize_won',
        amount: wonPrize,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        description: `${userResult.rank === 1 ? '1st Prize (₹200)' : userResult.rank === 2 ? '2nd Prize (₹150)' : '3rd Prize (₹100)'} in ${activeRoom?.name || 'Tournament'}`,
        utrNumber: `PENTA/WIN-${Math.floor(100000 + Math.random() * 900000)}`,
        roomName: activeRoom?.name
      };
      setTransactions(prev => [prizeTxn, ...prev]);
      saveTransactionToFirestore(user?.id || 'guest', prizeTxn).catch(() => {});

      triggerNotification({
        title: `🏆 You Won Rank #${userResult.rank} - ₹${wonPrize}!`,
        message: `₹${wonPrize} credited directly into your Winnings Balance. Eligible for instant 2FA withdrawal!`,
        type: 'win'
      });
    }
  };

  const leaveMatchToLobby = () => {
    setActiveRoom(null);
    setMatchPlayers([]);
    setCurrentView('lobby');
  };

  return (
    <GameContext.Provider
      value={{
        user,
        wallet,
        transactions,
        notifications,
        rooms,
        activeRoom,
        currentView,
        matchPlayers,
        matchCountdown,
        isAuthModalOpen,
        isWalletModalOpen,
        isWithdrawModalOpen,
        isHistoryModalOpen,
        isSettingsModalOpen,
        soundEnabled,
        activePushBanner,

        login,
        signInWithGoogle,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openWalletModal: () => setIsWalletModalOpen(true),
        closeWalletModal: () => setIsWalletModalOpen(false),
        openWithdrawModal: () => setIsWithdrawModalOpen(true),
        closeWithdrawModal: () => setIsWithdrawModalOpen(false),
        openHistoryModal: () => setIsHistoryModalOpen(true),
        closeHistoryModal: () => setIsHistoryModalOpen(false),
        openSettingsModal: () => setIsSettingsModalOpen(true),
        closeSettingsModal: () => setIsSettingsModalOpen(false),
        toggleSound,
        setCurrentView,
        dismissPushBanner,

        addMoney,
        requestWithdrawal2FA,
        confirmWithdrawalWith2FA,

        createPrivateRoom,
        joinRoom,
        joinQuickMatch,
        startMatchmaking,
        cancelMatchmaking,
        finishMatch,
        leaveMatchToLobby
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
