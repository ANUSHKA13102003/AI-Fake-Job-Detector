import React from 'react';

export default function Loader({ message = "Scanning job posting..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Animated radar */}
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#1e1e2e" strokeWidth="2" />
          <circle cx="40" cy="40" r="24" fill="none" stroke="#1e1e2e" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="#1e1e2e" strokeWidth="1" />
          <circle cx="40" cy="40" r="2" fill="#e84040" />
          {/* Rotating sweep */}
          <g style={{ transformOrigin: '40px 40px', animation: 'spin 1.5s linear infinite' }}>
            <line x1="40" y1="40" x2="40" y2="4" stroke="#e84040" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            <path d="M40 40 L40 4 A36 36 0 0 1 76 40 Z" fill="#e84040" opacity="0.08" />
          </g>
        </svg>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      <div className="text-center">
        <p className="font-display text-base font-semibold text-brand-text">{message}</p>
        <div className="flex gap-1.5 justify-center mt-3">
          {['Keyword scan', 'NLP analysis', 'Risk scoring'].map((step, i) => (
            <span
              key={step}
              className="text-xs font-mono px-2 py-0.5 rounded border border-brand-border text-brand-muted"
              style={{ animation: `fadeIn 0.4s ease-out ${i * 0.15}s forwards`, opacity: 0 }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
