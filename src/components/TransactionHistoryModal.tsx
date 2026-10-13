import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TransactionType } from '../types/game';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trophy, 
  Gamepad2, 
  Search, 
  Receipt, 
  CheckCircle2, 
  Copy, 
  Check
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const TransactionHistoryModal: React.FC = () => {
  const { 
    isHistoryModalOpen, 
    closeHistoryModal, 
    transactions, 
    soundEnabled 
  } = useGame();

  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isHistoryModalOpen) return null;

  const filteredTxns = transactions.filter(t => {
    const matchesFilter = filter === 'ALL' || t.type === filter;
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.utrNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (soundEnabled) soundManager.click();
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getTxnIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case 'prize_won':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'entry_fee':
        return <Gamepad2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        <button
          onClick={closeHistoryModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Payment & Wallet History
            </h3>
            <p className="text-xs text-slate-400">
              Audit trail of all deposits, 2FA withdrawals, and match prize distributions
            </p>
          </div>
        </div>

        {/* Controls: Search and Filter Tabs */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Txn ID, UTR ref, or description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Interactive filter segmented control */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter === 'deposit'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter === 'withdrawal'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => setFilter('prize_won')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter === 'prize_won'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Winnings
            </button>
            <button
              onClick={() => setFilter('entry_fee')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filter === 'entry_fee'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entries
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredTxns.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transactions match your filter criteria.</p>
            </div>
          ) : (
            filteredTxns.map(txn => {
              const isCredit = txn.type === 'deposit' || txn.type === 'prize_won';
              return (
                <div
                  key={txn.id}
                  className="p-3.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-xl transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                      {getTxnIcon(txn.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {txn.description}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{new Date(txn.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => handleCopy(txn.id, txn.utrNumber)}
                          className="hover:text-amber-400 flex items-center gap-1 font-mono text-[10px]"
                          title="Copy UTR Reference"
                        >
                          <span>{txn.utrNumber}</span>
                          {copiedId === txn.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold tabular-nums block ${
                        isCredit ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {txn.id}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
