import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { RoomLobby } from './components/RoomLobby';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { GameArena } from './components/GameArena';
import { PodiumModal } from './components/PodiumModal';
import { AuthModal } from './components/AuthModal';
import { WalletModal } from './components/WalletModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { RulesSection } from './components/RulesSection';

const MainAppContent: React.FC = () => {
  const { currentView } = useGame();
  const [activeNav, setActiveNav] = useState<'lobby' | 'private_rooms' | 'rules'>('lobby');

  const handleNavClick = (view: 'lobby' | 'private_rooms' | 'rules') => {
    setActiveNav(view);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Push Notification Banner Toast (Slides down from top for instant transfers & 2FA) */}
      <PushNotificationBanner />

      {/* 2. Top Bar Contract Header */}
      <Header onNavClick={handleNavClick} activeNav={activeNav} />

      {/* 3. Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'matchmaking' ? (
          <MatchmakingScreen />
        ) : currentView === 'game' ? (
          <GameArena />
        ) : activeNav === 'rules' ? (
          <RulesSection onBackToLobby={() => setActiveNav('lobby')} />
        ) : (
          <RoomLobby onSelectNav={handleNavClick} currentNav={activeNav} />
        )}

        {/* 4. Podium Results Modal (Shows when match ends) */}
        {currentView === 'podium' && <PodiumModal />}
      </main>

      {/* 5. Modals */}
      <AuthModal />
      <WalletModal />
      <WithdrawModal />
      <TransactionHistoryModal />
      <SettingsModal />

      {/* 6. Clean Footer (Anti-slop compliant: Quiet, no telemetry tickers) */}
      <footer className="border-t border-slate-800/80 bg-[#06080f] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-display">Pentashot Clash</span>
            <span aria-hidden="true">·</span>
            <span>5-Player Skill Gaming</span>
            <span aria-hidden="true">·</span>
            <span>Instant UPI / PhonePe / GPay Payouts</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <button
              onClick={() => setActiveNav('rules')}
              className="hover:text-slate-200 transition-colors"
            >
              Fair Play & Prizes
            </button>
            <span aria-hidden="true">·</span>
            <span>2FA OTP Protection Active</span>
            <span aria-hidden="true">·</span>
            <span>© 2026 Pentashot Clash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
