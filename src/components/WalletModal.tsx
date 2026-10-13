import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PaymentMethod } from '../types/game';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  ArrowUpRight, 
  Zap, 
  Smartphone, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const WalletModal: React.FC = () => {
  const { 
    wallet, 
    isWalletModalOpen, 
    closeWalletModal, 
    openWithdrawModal, 
    addMoney, 
    user,
    soundEnabled 
  } = useGame();

  const [amount, setAmount] = useState<number>(200);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('phonepe');
  const [customUpi, setCustomUpi] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isWalletModalOpen) return null;

  const quickAmounts = [100, 200, 500, 1000];

  const handleAmountChange = (val: number) => {
    setAmount(val);
    setErrorMessage('');
    if (soundEnabled) soundManager.click();
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    setAmount(isNaN(parsed) ? 0 : parsed);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (amount < 100) {
      setErrorMessage('Minimum amount adding is ₹100');
      return;
    }
    if (amount > 1000) {
      setErrorMessage('Maximum amount adding is ₹1,000 per wallet top-up');
      return;
    }

    if (selectedMethod === 'upi_custom' && !customUpi.trim()) {
      setErrorMessage('Please enter your UPI ID (e.g., yourname@okhdfcbank)');
      return;
    }

    setIsProcessing(true);
    if (soundEnabled) soundManager.click();

    try {
      const result = await addMoney(
        amount, 
        selectedMethod, 
        selectedMethod === 'upi_custom' ? customUpi : undefined
      );

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          setIsProcessing(false);
          closeWalletModal();
        }, 1200);
      } else {
        setErrorMessage(result.message);
        setIsProcessing(false);
      }
    } catch {
      setErrorMessage('Payment failed. Please retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeWalletModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Wallet Top-Up
            </h3>
            <p className="text-xs text-slate-400">
              Instant credit via PhonePe, Google Pay & UPI (₹100 – ₹1,000)
            </p>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Deposit Balance
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              ₹{wallet.depositBalance.toLocaleString('en-IN')}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Used for game entries</span>
          </div>
          <div className="p-3.5 bg-slate-800/80 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
                Winnings Balance
              </span>
              <button
                type="button"
                onClick={() => {
                  closeWalletModal();
                  openWithdrawModal();
                }}
                className="text-[10px] text-amber-400 hover:underline flex items-center"
              >
                Withdraw <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              ₹{wallet.winningsBalance.toLocaleString('en-IN')}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Withdrawable via 2FA</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount input & quick buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Amount (INR ₹)
              </label>
              <span className="text-[11px] text-slate-400">
                Min: ₹100 · Max: ₹1,000
              </span>
            </div>

            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-400">
                ₹
              </span>
              <input
                type="number"
                min={100}
                max={1000}
                value={amount || ''}
                onChange={handleCustomInput}
                placeholder="Enter amount between 100 and 1000"
                className="w-full pl-9 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 tabular-nums"
              />
            </div>

            {/* Quick chips */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleAmountChange(preset)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    amount === preset
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Instant Payment Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* PhonePe */}
              <div
                onClick={() => {
                  setSelectedMethod('phonepe');
                  if (soundEnabled) soundManager.click();
                }}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'phonepe'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5f259f] text-white font-bold flex items-center justify-center text-xs">
                    पे
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">PhonePe UPI</span>
                    <span className="text-[10px] text-slate-400">Zero fee instant</span>
                  </div>
                </div>
                {selectedMethod === 'phonepe' && <Check className="w-4 h-4 text-purple-400" />}
              </div>

              {/* Google Pay */}
              <div
                onClick={() => {
                  setSelectedMethod('gpay');
                  if (soundEnabled) soundManager.click();
                }}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'gpay'
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-slate-900 font-bold flex items-center justify-center text-xs shadow-sm">
                    G<span className="text-blue-500">Pay</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Google Pay</span>
                    <span className="text-[10px] text-slate-400">GPay Direct UPI</span>
                  </div>
                </div>
                {selectedMethod === 'gpay' && <Check className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Paytm */}
              <div
                onClick={() => {
                  setSelectedMethod('paytm');
                  if (soundEnabled) soundManager.click();
                }}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'paytm'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#002e6e] text-white font-bold flex items-center justify-center text-[10px]">
                    Paytm
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Paytm UPI</span>
                    <span className="text-[10px] text-slate-400">Fast checkout</span>
                  </div>
                </div>
                {selectedMethod === 'paytm' && <Check className="w-4 h-4 text-cyan-400" />}
              </div>

              {/* Any Custom UPI */}
              <div
                onClick={() => {
                  setSelectedMethod('upi_custom');
                  if (soundEnabled) soundManager.click();
                }}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'upi_custom'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    UPI
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Other UPI ID</span>
                    <span className="text-[10px] text-slate-400">BHIM, Cred, Bank</span>
                  </div>
                </div>
                {selectedMethod === 'upi_custom' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            {selectedMethod === 'upi_custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customUpi}
                  onChange={e => setCustomUpi(e.target.value)}
                  placeholder="Enter UPI VPA (e.g. mobile@upi or name@okhdfcbank)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Instant UPI Gateway...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Pay & Add ₹{amount} Instantly</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              RBI UPI Sandbox Compliant
            </span>
            <span>Push confirmation dispatched immediately</span>
          </div>
        </form>
      </div>
    </div>
  );
};
