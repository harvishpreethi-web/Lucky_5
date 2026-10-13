import React from 'react';
import { useGame } from '../context/GameContext';
import { Bell, CheckCircle2, ShieldCheck, Trophy, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';

export const PushNotificationBanner: React.FC = () => {
  const { activePushBanner, dismissPushBanner } = useGame();

  if (!activePushBanner) return null;

  const getIcon = () => {
    switch (activePushBanner.type) {
      case 'payment':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'win':
        return <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <aside aria-label="Notifications" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl shadow-black/80 flex items-start gap-3 text-slate-100">
        <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700/50 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-200 tracking-wide truncate">
              {activePushBanner.title}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Just now</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
            {activePushBanner.message}
          </p>
        </div>
        <button
          onClick={dismissPushBanner}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
