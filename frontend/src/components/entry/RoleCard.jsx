import React from 'react';
import { Check, ArrowRight, Key, Sparkles } from 'lucide-react';

const RoleCard = ({
  roleKey,
  title,
  subtitle,
  badge,
  icon: Icon,
  highlights = [],
  isSelected = false,
  onSelect,
  onLogin,
  onRegister,
}) => {
  return (
    <div
      onClick={() => {
        if (onSelect) onSelect(roleKey);
      }}
      className={`group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl ${
        isSelected
          ? 'border-[#C62828] ring-4 ring-red-50 -translate-y-1'
          : 'border-gray-200 hover:border-red-300 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header Badge & Selection Indicator */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              isSelected
                ? 'bg-[#C62828] text-white shadow-md'
                : 'bg-red-50 text-[#C62828] group-hover:bg-[#C62828] group-hover:text-white'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                isSelected ? 'bg-red-100 text-[#C62828]' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {badge}
            </span>
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-[#C62828] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-black text-[#222222] group-hover:text-[#C62828] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subtitle}</p>

        {/* Bullet Highlights */}
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828] mt-1.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
        {roleKey === 'admin' ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogin('admin');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#222222] hover:bg-[#C62828] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Admin Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-gray-400 font-semibold">
              Authorized personnel only. No public sign up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogin(roleKey);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#222222] hover:bg-[#C62828] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegister(roleKey);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs transition flex items-center justify-center"
            >
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleCard;
