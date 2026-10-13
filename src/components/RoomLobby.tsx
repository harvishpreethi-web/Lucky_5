import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameRoom } from '../types/game';
import { 
  Trophy, 
  Users, 
  Lock, 
  Plus, 
  Zap, 
  ArrowUpRight, 
  PlusCircle, 
  ShieldCheck, 
  Search, 
  Sparkles,
  KeyRound,
  X,
  CreditCard
} from 'lucide-react';
import { soundManager } from '../utils/audio';

const ARENA_BANNER_IMG = '/src/assets/images/game_arena_banner_1791903594525.jpg';
const TROPHY_PODIUM_IMG = '/src/assets/images/game_trophy_podium_1791903594654.jpg';

interface RoomLobbyProps {
  onSelectNav: (view: 'lobby' | 'private_rooms' | 'rules') => void;
  currentNav: string;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({ onSelectNav, currentNav }) => {
  const { 
    wallet, 
    rooms, 
    joinQuickMatch, 
    joinRoom, 
    createPrivateRoom, 
    openWalletModal, 
    openWithdrawModal, 
    soundEnabled 
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<'ALL' | 'PUBLIC' | 'PRIVATE' | 'FAST'>('ALL');
  
  // Create Room modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [newRoomFee, setNewRoomFee] = useState(50);

  // Passcode prompt modal state
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState<GameRoom | null>(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTag === 'PUBLIC') return matchesSearch && !r.isPrivate;
    if (filterTag === 'PRIVATE') return matchesSearch && r.isPrivate;
    if (filterTag === 'FAST') return matchesSearch && r.entryFee <= 50;
    return matchesSearch;
  });

  const handleJoinClick = (room: GameRoom) => {
    if (soundEnabled) soundManager.click();
    if (room.isPrivate && room.passcode) {
      setSelectedRoomToJoin(room);
      setInputPasscode('');
      setPasscodeError('');
    } else {
      const res = joinRoom(room.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleConfirmPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomToJoin) return;
    const res = joinRoom(selectedRoomToJoin.id, inputPasscode);
    if (res.success) {
      setSelectedRoomToJoin(null);
    } else {
      setPasscodeError(res.message);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEnabled) soundManager.coin();
    const created = createPrivateRoom(newRoomName, newRoomPass, newRoomFee);
    setIsCreateOpen(false);
    setNewRoomName('');
    setNewRoomPass('');
    joinRoom(created.id, created.passcode);
  };

  return (
    <div className="space-y-8">
      {/* 1. Prominent Current Balance Card at Top of Home Screen (Explicit User Requirement) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Your Current Gaming Balance</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-normal">INR Currency</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-display tabular-nums tracking-tight">
                ₹{wallet.totalBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400">
                (Deposit: ₹{wallet.depositBalance} · Winnings: ₹{wallet.winningsBalance})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Winnings are eligible for instant 2FA withdrawal to PhonePe, Google Pay & UPI
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (soundEnabled) soundManager.click();
                openWalletModal();
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money (₹100 - ₹1,000)</span>
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundManager.click();
                openWithdrawModal();
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>2FA Withdraw Winnings</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hero Tournament Banner & Prize Pool Breakdown */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px]">
          {/* Left Text / CTAs */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4" />
                <span>5 Slots · 5 Players Arena</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
                High-Speed 5-Player Tournament
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-xl leading-relaxed">
                Test your reaction speed, precision and focus against 4 opponents. When 1 or 2 players ready up, computer bots automatically fill empty slots so the match never waits!
              </p>

              {/* Prize Podiums Breakdown (Mandatory prompt requirements) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-5 max-w-lg">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="block text-[11px] font-semibold text-amber-400 uppercase">
                    🥇 1st Prize
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white tabular-nums">
                    ₹200
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Top Performer</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                  <span className="block text-[11px] font-semibold text-slate-300 uppercase">
                    🥈 2nd Prize
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white tabular-nums">
                    ₹150
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Runner Up</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-800/20 border border-amber-800/40 text-center">
                  <span className="block text-[11px] font-semibold text-amber-600 uppercase">
                    🥉 3rd Prize
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white tabular-nums">
                    ₹100
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">3rd Place</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (soundEnabled) soundManager.click();
                  joinQuickMatch();
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-amber-400/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Quick Match (Join Arena)</span>
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) soundManager.click();
                  setIsCreateOpen(true);
                }}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create Private Room</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={ARENA_BANNER_IMG}
              alt="5-Player Esports Tournament Stage"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent"></div>
            
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart Bot Matchmaking Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Diverse Private Rooms Directory (10 to 15 slots) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <span>Private & Custom Rooms</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-400 tabular-nums">
                {rooms.length} Slots Available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any 5-player room to join or enter passcode. 1 or 2 players ready will trigger instant bot matchmaking.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search room name or code..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Room</span>
            </button>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setFilterTag('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterTag === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Slots ({rooms.length})
          </button>
          <button
            onClick={() => setFilterTag('PRIVATE')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterTag === 'PRIVATE'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Private Lock (Passcode)
          </button>
          <button
            onClick={() => setFilterTag('FAST')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterTag === 'FAST'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fast Entry (≤ ₹50)
          </button>
        </div>

        {/* 5-Player Room Cards Grid (10-15 rooms) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRooms.map(room => {
            const occupied = room.currentPlayers.length;
            return (
              <div
                key={room.id}
                className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                      #{room.code} · {room.category}
                    </span>
                    {room.isPrivate ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Open Room
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {room.name}
                  </h3>

                  {/* 5 Slots representation */}
                  <div className="mt-3 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>Slots: {occupied} / 5</span>
                      <span>
                        {occupied === 0 ? 'Empty (Bots will fill)' : occupied <= 2 ? '1-2 Ready (Bots will fill)' : 'Filling up'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 1, 2, 3, 4].map(slotIdx => {
                        const player = room.currentPlayers[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`h-2 rounded-full transition-all ${
                              player
                                ? 'bg-amber-400'
                                : 'bg-slate-800 border border-slate-700/60'
                            }`}
                            title={player ? `${player.name} (${player.isBot ? 'Bot' : 'Human'})` : 'Empty Seat (Will fill with Bot)'}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Entry Fee</span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      ₹{room.entryFee} INR
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Top Prize</span>
                    <span className="text-xs font-bold text-emerald-400 tabular-nums">
                      ₹{room.prizes.first}
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinClick(room)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Join Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Passcode Modal for Private Room */}
      {selectedRoomToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setSelectedRoomToJoin(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Private Room Access</h4>
                <p className="text-xs text-slate-400">{selectedRoomToJoin.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              This private room is protected with a 4-digit code. Default code is <span className="font-mono text-amber-400 font-bold">{selectedRoomToJoin.passcode || '1234'}</span>.
            </p>

            <form onSubmit={handleConfirmPasscode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Enter Room Passcode
                </label>
                <input
                  type="text"
                  required
                  value={inputPasscode}
                  onChange={e => {
                    setInputPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  placeholder="e.g. 1234"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {passcodeError && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {passcodeError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputPasscode(selectedRoomToJoin.passcode || '1234')}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white"
                >
                  Auto-fill Code
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                >
                  Unlock & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Private Room Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Create 5-Slot Private Room
                </h3>
                <p className="text-xs text-slate-400">
                  Prizes: 1st ₹200 · 2nd ₹150 · 3rd ₹100
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Private Room Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  placeholder="e.g. Hyderabad Champions Club"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Room Passcode (4 Digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newRoomPass}
                  onChange={e => setNewRoomPass(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Match Entry Stake (INR ₹)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 75, 100].map(fee => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setNewRoomFee(fee)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        newRoomFee === fee
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      ₹{fee} Fee
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-400">
                <span className="text-slate-300 font-semibold block mb-0.5">Matchmaking rule:</span>
                If only 1 or 2 players ready up, intelligent computer bots will automatically fill the empty seats!
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-amber-400/20"
              >
                Create Room & Enter Matchmaking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
