import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Trophy, 
  Flame, 
  Timer, 
  Zap, 
  Target, 
  Bomb, 
  Sparkles, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ArenaTarget {
  id: string;
  x: number; // percentage 10-85
  y: number; // percentage 10-80
  type: 'standard' | 'golden' | 'numeric' | 'hazard';
  value: number;
  label?: string;
  number?: number;
  expiresAt: number;
}

export const GameArena: React.FC = () => {
  const { 
    matchPlayers, 
    activeRoom, 
    finishMatch, 
    soundEnabled 
  } = useGame();

  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [userScore, setUserScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [accuracyHits, setAccuracyHits] = useState<{ hits: number; misses: number }>({ hits: 0, misses: 0 });
  const [activeTargets, setActiveTargets] = useState<ArenaTarget[]>([]);
  const [nextExpectedNumber, setNextExpectedNumber] = useState<number>(1);
  const [lastHitFeedback, setLastHitFeedback] = useState<{ text: string; x: number; y: number; id: number } | null>(null);

  // Bot scores tracked in real-time
  const [botScores, setBotScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    matchPlayers.filter(p => p.isBot).forEach(b => {
      initial[b.id] = 0;
    });
    return initial;
  });

  const arenaRef = useRef<HTMLDivElement>(null);

  // Game countdown timer (25 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When timer hits 0, finish match
  useEffect(() => {
    if (timeLeft === 0) {
      const finalScores = matchPlayers.map(p => {
        if (!p.isBot) {
          return { id: p.id, score: userScore };
        }
        return { id: p.id, score: botScores[p.id] || 0 };
      });
      finishMatch(finalScores);
    }
  }, [timeLeft, userScore, botScores, matchPlayers, finishMatch]);

  // Bot score simulation loop: bots hit simulated targets with realistic human reaction latencies
  useEffect(() => {
    if (timeLeft <= 0) return;

    const botInterval = setInterval(() => {
      setBotScores(prev => {
        const next = { ...prev };
        matchPlayers.filter(p => p.isBot).forEach(bot => {
          // Bot accuracy check
          const chance = Math.random();
          if (chance < 0.72) {
            // successful hit
            const pts = Math.random() < 0.25 ? 45 : 25;
            next[bot.id] = (next[bot.id] || 0) + pts;
          }
        });
        return next;
      });
    }, 650);

    return () => clearInterval(botInterval);
  }, [timeLeft, matchPlayers]);

  // Spawn targets periodically
  useEffect(() => {
    if (timeLeft <= 0) return;

    const spawnTarget = () => {
      setActiveTargets(prev => {
        // Keep max 5 targets active at a time
        if (prev.length >= 5) return prev;

        const types: ('standard' | 'golden' | 'numeric' | 'hazard')[] = [
          'standard',
          'standard',
          'golden',
          'numeric',
          'hazard'
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const x = Math.floor(10 + Math.random() * 75);
        const y = Math.floor(10 + Math.random() * 70);

        let value = 25;
        let label = '+25';
        let num: number | undefined;

        if (randomType === 'golden') {
          value = 50;
          label = '★ +50';
        } else if (randomType === 'hazard') {
          value = -25;
          label = 'BOMB -25';
        } else if (randomType === 'numeric') {
          value = 35;
          num = Math.floor(1 + Math.random() * 9);
          label = `#${num}`;
        }

        const newTarget: ArenaTarget = {
          id: `target-${Date.now()}-${Math.random()}`,
          x,
          y,
          type: randomType,
          value,
          label,
          number: num,
          expiresAt: Date.now() + 2800
        };

        return [...prev, newTarget];
      });
    };

    const interval = setInterval(spawnTarget, 550);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Clear expired targets
  useEffect(() => {
    const cleaner = setInterval(() => {
      const now = Date.now();
      setActiveTargets(prev => prev.filter(t => t.expiresAt > now));
    }, 300);
    return () => clearInterval(cleaner);
  }, []);

  // Handle target click
  const handleTargetClick = (target: ArenaTarget, e: React.MouseEvent) => {
    e.stopPropagation();

    // Remove target immediately
    setActiveTargets(prev => prev.filter(t => t.id !== target.id));

    if (target.type === 'hazard') {
      // Hit a bomb!
      if (soundEnabled) soundManager.targetMiss();
      setUserScore(s => Math.max(0, s - 25));
      setCombo(0);
      setAccuracyHits(a => ({ ...a, misses: a.misses + 1 }));
      showHitEffect('-25 Hazard!', target.x, target.y);
      return;
    }

    // Success hit
    const currentCombo = combo + 1;
    setCombo(currentCombo);
    if (currentCombo > maxCombo) setMaxCombo(currentCombo);

    // Multiplier for combos
    const multiplier = currentCombo >= 5 ? 2 : currentCombo >= 3 ? 1.5 : 1;
    const pointsWon = Math.round(target.value * multiplier);

    if (soundEnabled) soundManager.targetHit(currentCombo);
    setUserScore(s => s + pointsWon);
    setAccuracyHits(a => ({ ...a, hits: a.hits + 1 }));

    showHitEffect(`+${pointsWon} ${currentCombo > 2 ? `(${multiplier}x)` : ''}`, target.x, target.y);
  };

  const showHitEffect = (text: string, x: number, y: number) => {
    setLastHitFeedback({ text, x, y, id: Date.now() });
    setTimeout(() => setLastHitFeedback(null), 600);
  };

  const handleArenaMiss = (e: React.MouseEvent) => {
    if (e.target !== arenaRef.current) return;
    setCombo(0);
    setAccuracyHits(a => ({ ...a, misses: a.misses + 1 }));
    if (soundEnabled) soundManager.targetMiss();
  };

  // Live 5-player leaderboard ranking
  const liveLeaderboard = matchPlayers.map(p => {
    const score = p.isBot ? botScores[p.id] || 0 : userScore;
    return {
      ...p,
      currentScore: score
    };
  }).sort((a, b) => b.currentScore - a.currentScore);

  const userRank = liveLeaderboard.findIndex(p => !p.isBot) + 1;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8">
      {/* HUD Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Left: Tournament info & user live score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Your Score
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono tabular-nums leading-none">
                {userScore}
              </span>
            </div>
          </div>

          <div className="border-l border-slate-800 pl-4 hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Combo Multiplier
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-1">
              <Flame className={`w-4 h-4 ${combo >= 3 ? 'text-amber-500 animate-bounce' : 'text-slate-500'}`} />
              {combo}x Streak
            </span>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Live Position
            </span>
            <span className={`text-base font-black tabular-nums ${
              userRank === 1 ? 'text-yellow-400' : userRank === 2 ? 'text-slate-300' : userRank === 3 ? 'text-amber-600' : 'text-slate-400'
            }`}>
              #{userRank} / 5
            </span>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
          <Timer className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Time:</span>
          <span className={`text-xl font-black font-mono tabular-nums ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Right: Prize reminder */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Prizes Active</span>
          <span className="font-bold text-emerald-400">1st: ₹200 · 2nd: ₹150 · 3rd: ₹100</span>
        </div>
      </div>

      {/* Main Grid: Game Stage + Live 5-Player Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Game Stage (Arena Surface) */}
        <div
          ref={arenaRef}
          onClick={handleArenaMiss}
          className="lg:col-span-3 min-h-[460px] sm:min-h-[520px] bg-slate-950/95 border-2 border-slate-800 rounded-2xl relative overflow-hidden select-none cursor-crosshair shadow-2xl"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        >
          {/* Subtle Stage Ambient Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Instruction overlay for quick start */}
          <div className="absolute top-3 left-4 pointer-events-none text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            🎯 Tap glowing targets fast! Avoid red hazard bombs!
          </div>

          {/* Active Interactive Targets */}
          {activeTargets.map(target => {
            const isGolden = target.type === 'golden';
            const isHazard = target.type === 'hazard';

            return (
              <button
                key={target.id}
                onClick={e => handleTargetClick(target, e)}
                style={{
                  top: `${target.y}%`,
                  left: `${target.x}%`
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform active:scale-95 flex items-center justify-center font-bold font-display shadow-lg ${
                  isGolden
                    ? 'w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-2 border-yellow-200 shadow-yellow-500/40 animate-pulse'
                    : isHazard
                    ? 'w-14 h-14 bg-gradient-to-tr from-red-600 to-rose-400 text-white border-2 border-red-300 shadow-red-500/40'
                    : 'w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-400 text-white border-2 border-cyan-300 shadow-cyan-500/30'
                }`}
              >
                {isGolden ? (
                  <div className="text-center">
                    <Sparkles className="w-4 h-4 mx-auto" />
                    <span className="text-[10px] font-black">+50</span>
                  </div>
                ) : isHazard ? (
                  <div className="text-center">
                    <Bomb className="w-4 h-4 mx-auto text-yellow-200" />
                    <span className="text-[9px] font-black uppercase">Bomb</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Target className="w-4 h-4 mx-auto" />
                    <span className="text-[10px] font-black">{target.label}</span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Floating score hit feedback animation */}
          {lastHitFeedback && (
            <div
              style={{
                top: `${lastHitFeedback.y}%`,
                left: `${lastHitFeedback.x}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-12 font-black text-sm sm:text-base text-yellow-300 pointer-events-none animate-out fade-out slide-out-to-top duration-500 drop-shadow-md"
            >
              {lastHitFeedback.text}
            </div>
          )}
        </div>

        {/* Live 5-Player Tournament Scoreboard */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Live 5-Player Rank
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Updating Live</span>
            </div>

            <div className="space-y-2">
              {liveLeaderboard.map((player, index) => {
                const rank = index + 1;
                const isUser = !player.isBot;
                const prize = rank === 1 ? '₹200' : rank === 2 ? '₹150' : rank === 3 ? '₹100' : '—';

                return (
                  <div
                    key={player.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isUser
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rank}
                      </span>

                      <div className="min-w-0">
                        <span className={`text-xs font-bold truncate block ${isUser ? 'text-amber-400' : 'text-slate-200'}`}>
                          {player.name} {isUser && '(You)'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Prize: <strong className="text-emerald-400">{prize}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black font-mono text-white tabular-nums">
                        {player.currentScore}
                      </span>
                      <span className="text-[9px] text-slate-400 block uppercase">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex justify-between py-0.5">
              <span>Your Hits:</span>
              <span className="font-bold text-white">{accuracyHits.hits}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Best Combo:</span>
              <span className="font-bold text-amber-400">{maxCombo}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
