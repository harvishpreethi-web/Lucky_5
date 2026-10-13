import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  X, 
  Settings, 
  Receipt, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    closeSettingsModal, 
    openHistoryModal, 
    openWithdrawModal, 
    user, 
    logout, 
    soundEnabled, 
    toggleSound 
  } = useGame();

  if (!isSettingsModalOpen) return null;

  const handleOpenHistory = () => {
    closeSettingsModal();
    openHistoryModal();
  };

  const handleOpenWithdraw = () => {
    closeSettingsModal();
    openWithdrawModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100">
        <button
          onClick={closeSettingsModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Account & Settings
            </h3>
            <p className="text-xs text-slate-400">
              Manage your profile, 2FA security, and transactions
            </p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-5 flex items-center gap-3.5">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatarSeed}`}
              alt={user.name}
              className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-white block truncate">
                {user.name}
              </span>
              <span className="text-xs text-slate-400 font-mono block">
                {user.phone}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified · 2FA Active</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {/* Prominent Payment History Link (Mandatory Requirement) */}
          <button
            onClick={handleOpenHistory}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 hover:from-amber-500/20 hover:to-yellow-500/15 border border-amber-500/30 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">
                  Payment History & Receipts
                </span>
                <span className="text-[11px] text-slate-400">
                  Audit all deposits, UPI withdrawals & prizes
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </button>

          {/* Secure 2FA Withdrawal Shortcut */}
          <button
            onClick={handleOpenWithdraw}
            className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block group-hover:text-white">
                  2FA Secure Withdrawal
                </span>
                <span className="text-[11px] text-slate-400">
                  Instant disbursement to PhonePe / GPay / UPI
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Audio toggle */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Game Sound & Effects
                </span>
                <span className="text-[11px] text-slate-400">
                  Target hits, countdown beeps, win fanfare
                </span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-1 ${
                  soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Prize Pool Summary */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>Official Tournament Prizes</span>
            <span className="text-amber-400">5-Player Standard</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>🥇 1st Prize Winner:</span>
            <span className="text-emerald-400 font-bold">₹200 INR</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>🥈 2nd Prize Runner-up:</span>
            <span className="text-emerald-400 font-bold">₹150 INR</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>🥉 3rd Prize Performer:</span>
            <span className="text-emerald-400 font-bold">₹100 INR</span>
          </div>
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Current Account</span>
          </button>
        )}
      </div>
    </div>
  );
};
