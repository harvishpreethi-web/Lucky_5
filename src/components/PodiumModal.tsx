import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  ArrowUpRight, 
  RotateCcw, 
  Receipt, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { soundManager } from '../utils/audio';

const TROPHY_IMG = '/src/assets/images/game_trophy_podium_1791903594654.jpg';

export const PodiumModal: React.FC = () => {
  const { 
    matchPlayers, 
    leaveMatchToLobby, 
    openWithdrawModal, 
    openHistoryModal, 
    joinQuickMatch,
    soundEnabled 
  } = useGame();

  const userPlayer = matchPlayers.find(p => !p.isBot);
  const userRank = userPlayer?.rank || 5;
  const userPrize = userPlayer?.prize || 0;
  const isWinner = userRank <= 3 && userPrize > 0;

  useEffect(() => {
    if (soundEnabled) {
      soundManager.victory();
    }

    if (isWinner) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [isWinner, soundEnabled]);

  const sortedPlayers = [...matchPlayers].sort((a, b) => (a.rank || 99) - (b.rank || 99));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Banner with Trophy Podium Image */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-40 border border-slate-800">
          <img
            src={TROPHY_IMG}
            alt="Tournament Podium"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              Tournament Concluded
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              {isWinner ? `Congratulations! You Won ${userRank === 1 ? '1st' : userRank === 2 ? '2nd' : '3rd'} Place!` : 'Match Results'}
            </h2>
          </div>
        </div>

        {/* User's prize result banner */}
        <div className={`p-4 rounded-2xl mb-6 border ${
          userRank === 1
            ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/50'
            : userRank === 2
            ? 'bg-slate-800/80 border-slate-600'
            : userRank === 3
            ? 'bg-amber-900/20 border-amber-800/40'
            : 'bg-slate-900 border-slate-800'
        } flex items-center justify-between`}>
          <div>
            <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
              Your Performance Standing
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-white font-display">
                Rank #{userRank}
              </span>
              <span className="text-xs text-slate-400">
                ({userPlayer?.score || 0} Points)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
              Prize Awarded
            </span>
            <span className="text-2xl font-black text-emerald-400 font-display tabular-nums">
              {userPrize > 0 ? `+₹${userPrize} INR` : '₹0 INR'}
            </span>
            {userPrize > 0 && (
              <span className="text-[10px] text-emerald-400 block">
                Added to Winnings Balance
              </span>
            )}
          </div>
        </div>

        {/* 5-Player Official Tournament Leaderboard */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Final 5-Player Standings
          </span>

          {sortedPlayers.map((player, idx) => {
            const rank = idx + 1;
            const isUser = !player.isBot;
            const prizeAmount = rank === 1 ? 200 : rank === 2 ? 150 : rank === 3 ? 100 : 0;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isUser
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {rank}
                  </span>

                  <div>
                    <span className="text-xs font-bold block">
                      {player.name} {isUser && '(You)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Score: {player.score} pts · {player.isBot ? 'Bot' : 'Player'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold tabular-nums block ${
                    prizeAmount > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {prizeAmount > 0 ? `₹${prizeAmount}` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {rank === 1 ? '1st Prize' : rank === 2 ? '2nd Prize' : rank === 3 ? '3rd Prize' : 'Participant'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          {userPrize > 0 && (
            <button
              onClick={() => {
                leaveMatchToLobby();
                openWithdrawModal();
              }}
              className="w-full sm:w-auto flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw ₹{userPrize} (2FA)</span>
            </button>
          )}

          <button
            onClick={() => {
              leaveMatchToLobby();
              joinQuickMatch();
            }}
            className="w-full sm:w-auto flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next 5P Match</span>
          </button>

          <button
            onClick={leaveMatchToLobby}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
