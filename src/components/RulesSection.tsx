import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  Trophy, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  Bot, 
  Lock, 
  Smartphone, 
  CreditCard 
} from 'lucide-react';

const UPI_SHIELD_IMG = '/src/assets/images/upi_payment_shield_1791903593539.jpg';

export const RulesSection: React.FC<{ onBackToLobby: () => void }> = ({ onBackToLobby }) => {
  const { openWalletModal, openWithdrawModal } = useGame();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-display text-white">
            Official Rules & Payment System Guide
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete tournament guidelines, 5-player mechanics, and 2FA withdrawal security
          </p>
        </div>
        <button
          onClick={onBackToLobby}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
        >
          Back to Lobby
        </button>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. 5-Player Tournament Structure */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            5 Slots & Performance Prize Tiers
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every match is strictly 5 players. The top 3 performers win cash prizes disbursed directly into their Winnings Balance:
          </p>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="font-semibold text-amber-400">🥇 1st Prize Winner:</span>
              <strong className="text-white font-mono">₹200 INR</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="font-semibold text-slate-300">🥈 2nd Prize Runner-Up:</span>
              <strong className="text-white font-mono">₹150 INR</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="font-semibold text-amber-600">🥉 3rd Prize Performer:</span>
              <strong className="text-white font-mono">₹100 INR</strong>
            </div>
          </div>
        </div>

        {/* 2. Intelligent Computer Bot Matchmaking */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Instant Matchmaking & Bot Fill
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If 1 or 2 players ready up for a tournament, the matchmaking system automatically deploys realistic computer bots to fill the remaining seats. Matches never stall waiting for absent players, ensuring zero queue fatigue.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
            <span className="font-semibold block mb-1 text-cyan-400">Adaptive Bot Skill Engine:</span>
            Bots perform with human reaction latencies (85%–96% accuracy), ensuring an authentic, competitive experience.
          </div>
        </div>

        {/* 3. UPI / PhonePe / GPay Deposits */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Instant INR Payments & Top-up Limits
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deposit funds seamlessly via PhonePe, Google Pay (GPay), Paytm, or custom UPI ID.
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Minimum Deposit:</span>
              <strong className="text-emerald-400 font-mono">₹100 INR</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Maximum Deposit per Txn:</span>
              <strong className="text-emerald-400 font-mono">₹1,000 INR</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Push Notification:</span>
              <strong className="text-white">Instant confirmation</strong>
            </div>
          </div>
        </div>

        {/* 4. Secure 2FA Withdrawal Security */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Two-Factor Authentication (2FA) Payouts
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All tournament winnings are stored in your secure Winnings Balance. Withdrawing funds requires two-factor authentication (6-digit OTP sent to your registered phone number).
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Security Gate:</span>
              <strong className="text-purple-400">SMS / Push 6-Digit OTP</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Minimum Withdrawal:</span>
              <strong className="text-white font-mono">₹100 INR</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Disbursement Time:</span>
              <strong className="text-emerald-400">Instant (Real-time UPI)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Security Emblem Showcase */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={UPI_SHIELD_IMG}
          alt="UPI Secure Shield"
          referrerPolicy="no-referrer"
          className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-white">
            100% Encrypted & RBI Guideline Compliant Architecture
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            All transaction history records (deposits, entries, prize winnings, withdrawals) are audited with individual UPI UTR reference codes accessible directly in the Settings menu.
          </p>
        </div>
      </div>
    </div>
  );
};
