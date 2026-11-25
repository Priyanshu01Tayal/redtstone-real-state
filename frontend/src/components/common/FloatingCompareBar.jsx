import React from 'react';
import { Layers, ArrowRight, X } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useLanguage } from '../../context/LanguageContext';

const FloatingCompareBar = () => {
  const { comparedProperties, setIsCompareModalOpen, clearCompare } = useCompare();
  const { lang } = useLanguage();

  if (comparedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#222222] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#C62828] text-white font-black text-xs flex items-center justify-center">
          {comparedProperties.length}
        </span>
        <span className="text-xs font-bold">
          {lang === 'hi' ? 'प्रॉपर्टी चुनी गई (अधिकतम 3)' : 'Properties in Comparison (Max 3)'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsCompareModalOpen(true)}
          className="px-4 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-md transition-colors"
        >
          {lang === 'hi' ? 'तुलना करें' : 'Compare Now'} <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={clearCompare}
          className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FloatingCompareBar;
