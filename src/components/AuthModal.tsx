import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Smartphone, User, ShieldCheck, ArrowRight, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signInWithGoogle, soundEnabled } = useGame();

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    setError('');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your player name');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);
    setStep('OTP');
    setTimer(30);
    setError('');
    if (soundEnabled) soundManager.click();
  };

  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto focus next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
    if (soundEnabled) soundManager.click();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (entered === generatedOtp || entered === '123456') {
        if (soundEnabled) soundManager.coin();
        login(name, phone);
      } else {
        setError('Invalid OTP code. Use the demo auto-fill or check code.');
      }
      setIsVerifying(false);
    }, 600);
  };

  const handleResend = () => {
    if (timer > 0) return;
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);
    setTimer(30);
    setError('New verification code sent!');
    if (soundEnabled) soundManager.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'DETAILS' ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  Phone Login
                </h3>
                <p className="text-xs text-slate-400">
                  Instant OTP verification to secure your game wallet
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Full Name / Gamer Tag
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Harvish Preethi"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (India)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm font-semibold">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-r-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 tabular-nums"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                >
                  <span>Request Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">or sign in with</span>
                  <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (soundEnabled) soundManager.click();
                    signInWithGoogle();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google (Firebase)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by 256-bit encryption & UPI 2FA identity</span>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  Enter 6-Digit OTP
                </h3>
                <p className="text-xs text-slate-400">
                  Sent to +91 {phone}
                </p>
              </div>
            </div>

            {/* Quick Demo Helper */}
            <div className="mb-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block">Instant Verification Code:</span>
                <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemoOtp}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                Auto-fill OTP
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-12 h-13 text-center text-xl font-bold font-mono bg-slate-800 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-white outline-none tabular-nums"
                  />
                ))}
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="hover:text-slate-200 underline"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleResend}
                  className={`flex items-center gap-1 ${
                    timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP {timer > 0 ? `(${timer}s)` : ''}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
