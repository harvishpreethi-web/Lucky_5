import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Users, 
  Bot, 
  User, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  X, 
  Zap, 
  Radio 
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const MatchmakingScreen: React.FC = () => {
  const { 
    activeRoom, 
    matchPlayers, 
    cancelMatchmaking, 
    setCurrentView, 
    soundEnabled 
  } = useGame();

  const [countdown, setCountdown] = useState<number | null>(null);

  // When all 5 slots are ready, begin 3-second countdown
  useEffect(() => {
    if (matchPlayers.length === 5 && matchPlayers.every(p => p.isReady) && countdown === null) {
      setCountdown(3);
    }
  }, [matchPlayers, countdown]);

  // Audio countdown beep on change
  useEffect(() => {
    if (countdown !== null && countdown > 0 && soundEnabled) {
      soundManager.countdown();
    }
  }, [countdown, soundEnabled]);

  // Interval timer for countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      if (soundEnabled) soundManager.startBeep();
      setCurrentView('game');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, setCurrentView, soundEnabled]);

  if (!activeRoom) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Live Matchmaking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {activeRoom.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 Slots · 5 Players Tournament · Top 3 Prizes: ₹200 / ₹150 / ₹100
            </p>
          </div>

          <button
            onClick={cancelMatchmaking}
            disabled={countdown !== null}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>

        {/* 5 Slots Interactive Visualizer */}
        <div className="my-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Tournament Seats ({matchPlayers.length} / 5 Ready)</span>
            </span>
            <span className="text-slate-400 text-[11px] font-normal normal-case">
              {matchPlayers.length < 5
                ? 'Filling empty seats with computer bots...'
                : 'All 5 players assembled!'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map(idx => {
              const player = matchPlayers[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center min-h-[140px] relative ${
                    player
                      ? player.isBot
                        ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                        : 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 border-dashed text-slate-500'
                  }`}
                >
                  <span className="absolute top-2 right-2 text-[10px] font-mono text-slate-400">
                    Slot {idx + 1}
                  </span>

                  {player ? (
                    <>
                      <div className="relative mb-2">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-emerald-500 text-slate-950">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>

                      <span className="text-xs font-bold text-white truncate max-w-[100px] block">
                        {player.name}
                      </span>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        {player.isBot ? (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Bot className="w-3 h-3" /> Bot Opponent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <User className="w-3 h-3" /> You (Host)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {player.pingMs}ms
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-2 animate-pulse">
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Assigning Bot...
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Empty Slot</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Countdown / Ready Banner */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
          {countdown !== null ? (
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block animate-pulse">
                Match Starting In
              </span>
              <span className="text-4xl font-black text-white font-mono tabular-nums">
                {countdown}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>
                Matching seats... Ready players: {matchPlayers.length}/5 (Computer bots auto-filling remaining slots)
              </span>
            </div>
          )}
        </div>

        {/* Tournament Stakes reminder */}
        <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800 gap-2">
          <span>Match Entry Stake: <strong className="text-white">₹{activeRoom.entryFee} INR</strong></span>
          <span className="text-emerald-400 font-semibold">
            Prize Pool: ₹200 (1st) · ₹150 (2nd) · ₹100 (3rd)
          </span>
        </div>
      </div>
    </div>
  );
};
