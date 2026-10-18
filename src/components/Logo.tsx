import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
          <linearGradient id="cmGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00FF88" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Circular Circuit Ring */}
        <circle cx="50" cy="50" r="42" stroke="url(#cmGradient)" strokeWidth="2.5" strokeDasharray="8 4" opacity="0.85" />
        
        {/* Radiating Circuit Traces & Nodes */}
        <line x1="50" y1="8" x2="50" y2="20" stroke="url(#cmGradient)" strokeWidth="2" />
        <circle cx="50" cy="8" r="3" fill="#00F5FF" />

        <line x1="88" y1="35" x2="76" y2="40" stroke="url(#cmGradient)" strokeWidth="1.8" />
        <circle cx="88" cy="35" r="2.5" fill="#00FF88" />

        <line x1="88" y1="65" x2="76" y2="60" stroke="url(#cmGradient)" strokeWidth="1.8" />
        <circle cx="88" cy="65" r="2.5" fill="#00F5FF" />

        <line x1="50" y1="92" x2="50" y2="80" stroke="url(#cmGradient)" strokeWidth="2" />
        <circle cx="50" cy="92" r="3" fill="#00FF88" />

        <line x1="12" y1="35" x2="24" y2="40" stroke="url(#cmGradient)" strokeWidth="1.8" />
        <circle cx="12" cy="35" r="2.5" fill="#00FF88" />

        <line x1="12" y1="65" x2="24" y2="60" stroke="url(#cmGradient)" strokeWidth="1.8" />
        <circle cx="12" cy="65" r="2.5" fill="#00F5FF" />

        {/* Central Stylized "C" Symbol */}
        <path
          d="M68 32 C60 22, 40 22, 32 32 C22 42, 22 58, 32 68 C40 78, 60 78, 68 68"
          stroke="url(#cmGradient)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner Circuit Grid Lines inside the C */}
        <line x1="36" y1="40" x2="54" y2="40" stroke="#00F5FF" strokeWidth="1.5" opacity="0.7" />
        <line x1="32" y1="50" x2="56" y2="50" stroke="#00FF88" strokeWidth="1.5" opacity="0.9" />
        <line x1="36" y1="60" x2="54" y2="60" stroke="#00F5FF" strokeWidth="1.5" opacity="0.7" />
        <line x1="44" y1="34" x2="44" y2="66" stroke="#00F5FF" strokeWidth="1.5" opacity="0.6" />
        <line x1="52" y1="36" x2="52" y2="64" stroke="#00FF88" strokeWidth="1.5" opacity="0.6" />

        {/* Micro Quantum Core */}
        <circle cx="48" cy="50" r="2" fill="#FFFFFF" />
      </svg>
      <span className="font-bold tracking-tight text-white font-sans text-base whitespace-nowrap">
        CASH<span className="text-[#00F5FF]">MATRIX</span>
      </span>
    </div>
  );
};
