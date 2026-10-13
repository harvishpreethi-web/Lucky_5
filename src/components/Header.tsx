import React from 'react';
import { useGame } from '../context/GameContext';
import { PlusCircle, ArrowUpRight, Settings, UserCheck, Shield } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  onNavClick: (view: 'lobby' | 'private_rooms' | 'rules') => void;
  activeNav: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick, activeNav }) => {
  const {
    user,
    wallet,
    openAuthModal,
    openWalletModal,
    openWithdrawModal,
    openHistoryModal,
    openSettingsModal,
    soundEnabled
  } = useGame();

  const handleActionClick = (action: () => void) => {
    if (soundEnabled) soundManager.click();
    action();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => handleActionClick(() => onNavClick('lobby'))}
          className="text-xl sm:text-2xl font-black tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-95 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/20">
            5P
          </span>
          <span>Pentashot Clash</span>
        </button>

        {/* Zone 2: Navigation Links (Clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => handleActionClick(() => onNavClick('lobby'))}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeNav === 'lobby' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Match Lobby
          </button>
          <button
            onClick={() => handleActionClick(() => onNavClick('private_rooms'))}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeNav === 'private_rooms' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Private Rooms (14)
          </button>
          <button
            onClick={() => handleActionClick(() => onNavClick('rules'))}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeNav === 'rules' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Prizes & Rules
          </button>
          <button
            onClick={() => handleActionClick(openHistoryModal)}
            className="whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors"
          >
            Payment History
          </button>
        </nav>

        {/* Zone 3: Balance Display & Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Prominent Balance Module */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="text-right mr-2.5">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Balance (INR)
              </span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                ₹{wallet.totalBalance.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-700/60 pl-2">
              <button
                onClick={() => handleActionClick(openWalletModal)}
                title="Add Money (Min ₹100 - Max ₹1,000)"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                onClick={() => handleActionClick(openWithdrawModal)}
                title="Secure 2FA Withdrawal"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Withdraw</span>
              </button>
            </div>
          </div>

          {/* User profile / Settings toggle */}
          {user ? (
            <button
              onClick={() => handleActionClick(openSettingsModal)}
              className="flex items-center gap-2 p-1.5 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              title="Settings & Profile"
            >
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatarSeed}`}
                alt={user.name}
                className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700"
              />
              <Settings className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
          ) : (
            <button
              onClick={() => handleActionClick(openAuthModal)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Login with Phone
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
