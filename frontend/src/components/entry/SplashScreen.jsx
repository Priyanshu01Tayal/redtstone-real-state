import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const SplashScreen = ({ onComplete, duration = 2000, standalone = false }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFading(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#181A1F] via-[#222222] to-[#121316] text-white transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Skip */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-[#E53935]" />
          <span>RERA-Licensed Brokerage Network</span>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 flex items-center space-x-1"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">
        {/* Animated Emblem */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[#C62828] rounded-3xl opacity-30 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#B71C1C] via-[#C62828] to-[#EF5350] flex items-center justify-center text-white shadow-2xl border-2 border-white/20 transform transition hover:scale-105 duration-300">
            <Building2 className="w-12 h-12" />
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            RED<span className="text-[#E53935]">STONE</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-300 tracking-wider uppercase mt-1">
            Real Estate Brokerage Platform
          </p>
        </div>

        {/* Tagline */}
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
          Managed property discovery connecting Owners, In-House Brokers, and Verified Buyers with 100% Owner Privacy.
        </p>

        {/* Shimmering Progress Bar */}
        <div className="w-64 space-y-2 pt-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C62828] to-[#EF5350] transition-all duration-75 ease-out rounded-full shadow-[0_0_12px_#E53935]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
            <span>Initializing Secure Brokerage Portal</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Trust Indicators */}
      <div className="w-full max-w-2xl border-t border-white/10 pt-4 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] text-gray-400">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero Owner Spam</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Physical Inspections</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>360° Virtual Tours</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>2% Fair Brokerage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
