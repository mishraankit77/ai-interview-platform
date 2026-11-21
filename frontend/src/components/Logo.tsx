import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Precision Geometric SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="prepPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Rounded Hexagonal Base Plate */}
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="10"
          fill="url(#prepPulseGrad)"
          filter="url(#subtleGlow)"
        />

        {/* Code Terminal Bracket Left */}
        <path
          d="M15 14L10 20L15 26"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interview Waveform Bars in Center */}
        <path
          d="M19 16V24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M23 12V28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Code Terminal Bracket Right */}
        <path
          d="M27 14L32 20L27 26"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Wordmark */}
      <div className="flex items-center text-lg sm:text-xl font-bold">
        <span className="text-slate-900 dark:text-white tracking-tight">Prep</span>
        <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent font-extrabold tracking-tight">
          Pulse
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 ml-0.5 animate-pulse" />
      </div>
    </div>
  );
};
