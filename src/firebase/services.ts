import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { UserProfile, WalletState, Transaction, GameRoom } from '../types/game';

export const syncUserProfileToFirestore = async (user: UserProfile): Promise<void> => {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatarSeed: user.avatarSeed,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const syncWalletToFirestore = async (userId: string, wallet: WalletState): Promise<void> => {
  const path = `wallets/${userId}`;
  try {
    await setDoc(doc(db, 'wallets', userId), {
      userId,
      depositBalance: wallet.depositBalance,
      winningsBalance: wallet.winningsBalance,
      totalBalance: wallet.totalBalance,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const saveTransactionToFirestore = async (userId: string, txn: Transaction): Promise<void> => {
  const path = `transactions/${txn.id}`;
  try {
    await setDoc(doc(db, 'transactions', txn.id), {
      id: txn.id,
      userId,
      type: txn.type,
      amount: txn.amount,
      timestamp: txn.timestamp,
      method: txn.method || 'upi',
      upiId: txn.upiId || '',
      status: txn.status,
      description: txn.description,
      utrNumber: txn.utrNumber,
      roomName: txn.roomName || ''
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const saveRoomToFirestore = async (room: GameRoom): Promise<void> => {
  const path = `rooms/${room.id}`;
  try {
    await setDoc(doc(db, 'rooms', room.id), {
      id: room.id,
      name: room.name,
      code: room.code,
      isPrivate: room.isPrivate,
      passcode: room.passcode || '',
      hostName: room.hostName,
      maxSlots: room.maxSlots,
      entryFee: room.entryFee,
      status: room.status,
      category: room.category
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};
