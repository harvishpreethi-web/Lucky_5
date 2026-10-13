import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  X, 
  ShieldCheck, 
  ArrowUpRight, 
  Smartphone, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const WithdrawModal: React.FC = () => {
  const { 
    wallet, 
    isWithdrawModalOpen, 
    closeWithdrawModal, 
    user, 
    requestWithdrawal2FA, 
    confirmWithdrawalWith2FA, 
    soundEnabled 
  } = useGame();

  const [step, setStep] = useState<'DETAILS' | 'TWO_FACTOR'>('DETAILS');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [upiType, setUpiType] = useState<'phonepe' | 'gpay' | 'custom'>('phonepe');
  const [customVpa, setCustomVpa] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [expectedOtp, setExpectedOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(45);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'TWO_FACTOR' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isWithdrawModalOpen) return null;

  const phoneSuffix = user?.phone.replace(/\D/g, '').slice(-10) || '9876543210';
  const getDestinationUpi = (): string => {
    if (upiType === 'phonepe') return `${phoneSuffix}@ybl`;
    if (upiType === 'gpay') return `${phoneSuffix}@okaxis`;
    return customVpa.trim() || `${phoneSuffix}@upi`;
  };

  const handleStart2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (withdrawAmount < 100) {
      setErrorMessage('Minimum withdrawal amount is ₹100');
      return;
    }
    if (withdrawAmount > wallet.winningsBalance) {
      setErrorMessage(`Insufficient winnings balance. You can withdraw up to ₹${wallet.winningsBalance}.`);
      return;
    }

    const upiDest = getDestinationUpi();
    if (upiType === 'custom' && !customVpa.trim()) {
      setErrorMessage('Please enter your recipient UPI ID');
      return;
    }

    setIsLoading(true);
    if (soundEnabled) soundManager.click();

    try {
      const res = await requestWithdrawal2FA(withdrawAmount, upiDest);
      setExpectedOtp(res.otp);
      setStep('TWO_FACTOR');
      setTimer(45);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate 2FA';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = val.slice(-1);
    setOtpDigits(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`wth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`wth-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleFillDemo2FA = () => {
    const code = expectedOtp || '123456';
    setOtpDigits(code.split(''));
    if (soundEnabled) soundManager.click();
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setErrorMessage('Please enter all 6 digits of the 2FA authorization code');
      return;
    }

    setIsLoading(true);
    if (soundEnabled) soundManager.click();

    const upiDest = getDestinationUpi();
    const result = await confirmWithdrawalWith2FA(withdrawAmount, upiDest, entered, expectedOtp);

    if (result.success) {
      if (soundEnabled) soundManager.coin();
      setSuccessMessage(result.message);
      setTimeout(() => {
        setIsLoading(false);
        closeWithdrawModal();
      }, 1500);
    } else {
      setErrorMessage(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeWithdrawModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Secure 2FA Withdrawal
            </h3>
            <p className="text-xs text-slate-400">
              Transfer tournament winnings instantly to PhonePe, Google Pay or UPI
            </p>
          </div>
        </div>

        {/* Balance Status Banner */}
        <div className="p-3.5 bg-slate-800/80 border border-emerald-500/40 rounded-xl flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
              Withdrawable Winnings Balance
            </span>
            <span className="text-xl font-bold text-emerald-400 tabular-nums">
              ₹{wallet.winningsBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span className="block text-slate-300 font-medium">Instant UPI Transfer</span>
            <span>Zero payout fee</span>
          </div>
        </div>

        {step === 'DETAILS' ? (
          <form onSubmit={handleStart2FA} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Withdrawal Amount (INR ₹)
                </label>
                <span className="text-[11px] text-slate-400">Min ₹100</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={100}
                  max={wallet.winningsBalance}
                  value={withdrawAmount || ''}
                  onChange={e => {
                    const parsed = parseInt(e.target.value, 10);
                    setWithdrawAmount(isNaN(parsed) ? 0 : parsed);
                    setErrorMessage('');
                  }}
                  className="w-full pl-9 pr-24 py-3 bg-slate-800 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-emerald-400 tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(wallet.winningsBalance)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg"
                >
                  Max (₹{wallet.winningsBalance})
                </button>
              </div>
            </div>

            {/* UPI Destination Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Receiving UPI Address
              </label>

              <div className="space-y-2">
                <label
                  onClick={() => setUpiType('phonepe')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    upiType === 'phonepe'
                      ? 'bg-purple-950/30 border-purple-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white font-bold flex items-center justify-center text-xs">
                      पे
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">PhonePe UPI</span>
                      <span className="text-[11px] text-slate-400 font-mono">{phoneSuffix}@ybl</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="upi"
                    checked={upiType === 'phonepe'}
                    onChange={() => setUpiType('phonepe')}
                    className="accent-purple-500"
                  />
                </label>

                <label
                  onClick={() => setUpiType('gpay')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    upiType === 'gpay'
                      ? 'bg-blue-950/30 border-blue-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white text-slate-900 font-bold flex items-center justify-center text-xs">
                      G<span className="text-blue-500">P</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Google Pay (GPay)</span>
                      <span className="text-[11px] text-slate-400 font-mono">{phoneSuffix}@okaxis</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="upi"
                    checked={upiType === 'gpay'}
                    onChange={() => setUpiType('gpay')}
                    className="accent-blue-500"
                  />
                </label>

                <label
                  onClick={() => setUpiType('custom')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    upiType === 'custom'
                      ? 'bg-emerald-950/30 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      UPI
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">Other Custom UPI ID</span>
                      <span className="text-[11px] text-slate-400">Enter custom VPA address</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="upi"
                    checked={upiType === 'custom'}
                    onChange={() => setUpiType('custom')}
                    className="accent-emerald-500"
                  />
                </label>
              </div>

              {upiType === 'custom' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customVpa}
                    onChange={e => setCustomVpa(e.target.value)}
                    placeholder="e.g. mobile@paytm or name@icici"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || wallet.winningsBalance < 100}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating 2FA Security Challenge...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Proceed to 2FA Authentication</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Requires 2-Factor Authentication code delivered to {user?.phone || 'registered phone'}
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirm2FA} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Withdrawal Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">₹{withdrawAmount}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-slate-200">{getDestinationUpi()}</span>
              </div>
            </div>

            {/* Demo 2FA helper */}
            <div className="p-3 rounded-xl bg-slate-800/90 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Security 2FA Code:</span>
                <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                  {expectedOtp || '123456'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo2FA}
                className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              >
                Auto-fill Code
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit 2FA Authorization Code
              </label>

              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`wth-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-12 h-13 text-center text-xl font-bold font-mono bg-slate-800 border border-slate-700 focus:border-emerald-400 rounded-xl text-white outline-none tabular-nums"
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating & Disbursing Funds...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Authorize & Disburse ₹{withdrawAmount}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="hover:text-slate-200 underline"
              >
                Back to Details
              </button>
              <span className="text-[11px] text-slate-400">
                Resend in {timer}s
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
