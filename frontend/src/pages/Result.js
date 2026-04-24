import React, { useEffect, useRef } from 'react';

const RISK_CONFIG = {
  Low: { color: '#1aff8c', bg: 'rgba(26,255,140,0.1)', border: 'rgba(26,255,140,0.3)', emoji: '✅', label: 'LOW RISK' },
  Medium: { color: '#ffb830', bg: 'rgba(255,184,48,0.1)', border: 'rgba(255,184,48,0.3)', emoji: '⚠️', label: 'MEDIUM RISK' },
  High: { color: '#ff3a3a', bg: 'rgba(255,58,58,0.1)', border: 'rgba(255,58,58,0.3)', emoji: '🚨', label: 'HIGH RISK' },
};

const CATEGORY_ICONS = {
  urgency: '⏱️',
  payment_required: '💸',
  unrealistic_salary: '💰',
  vague_offer: '🌫️',
  no_credentials: '🔓',
};

function highlightKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return text;
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="highlight-keyword">{part}</mark>
      : part
  );
}

function ScoreRing({ score, risk }) {
  const ringRef = useRef();
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low;
  const circumference = 251.2;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = offset;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="8" />
        <circle
          ref={ringRef}
          cx="50" cy="50" r="40"
          fill="none"
          stroke={cfg.color}
          strokeWidth="8"
          strokeLinecap="round"
          className="score-ring"
          style={{ filter: `drop-shadow(0 0 8px ${cfg.color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-800" style={{ fontFamily: "'Syne', sans-serif", color: cfg.color, fontWeight: 800 }}>{score}%</span>
        <span className="font-mono text-xs text-brand-muted mt-0.5">FAKE SCORE</span>
      </div>
    </div>
  );
}

export default function Result({ result, inputText, onReset }) {
  const { score, risk, explanation, keywords, suspicious_sentences, categories_hit, meta } = result;
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low;

  const suggestions = {
    High: [
      'Do NOT pay any registration or training fee — legitimate employers never ask this',
      'Verify the company on LinkedIn or official websites before responding',
      'Avoid sharing personal financial information',
      'Report this job to the job portal where you found it',
    ],
    Medium: [
      'Research the company thoroughly before applying',
      'Verify the contact email belongs to an official corporate domain',
      'Ask for a formal offer letter before accepting',
      'Be cautious if asked to share sensitive details early',
    ],
    Low: [
      'This posting appears legitimate — proceed with normal caution',
      'Always verify job details through official company channels',
      'Use LinkedIn to confirm the recruiter\'s identity',
    ],
  };

  return (
    <div className="noise-bg min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(ellipse at center, ${cfg.color}10 0%, transparent 70%)` }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Back button */}
        <button onClick={onReset} className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-8 text-sm transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Analyze another job
        </button>

        {/* Result header */}
        <div className="rounded-2xl border p-8 mb-5 animate-fade-in"
          style={{ background: '#12121a', borderColor: cfg.border }}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={score} risk={risk} />
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-600 mb-3 border"
                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                {cfg.emoji} {cfg.label}
              </div>
              <h2 className="font-display text-3xl font-800 mb-2" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
                {risk === 'High' ? '🚨 Likely a Scam' : risk === 'Medium' ? '⚠️ Suspicious Posting' : '✅ Appears Legitimate'}
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                {risk === 'High'
                  ? 'Multiple high-risk indicators detected. This job posting shows strong signs of being fraudulent.'
                  : risk === 'Medium'
                  ? 'Some suspicious patterns found. Proceed with caution and verify all details.'
                  : 'No major red flags detected. This appears to be a legitimate job posting.'}
              </p>
              {/* Categories hit */}
              {categories_hit && categories_hit.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories_hit.map(cat => (
                    <span key={cat} className="text-xs px-2 py-1 rounded-lg border border-brand-border text-brand-muted font-mono">
                      {CATEGORY_ICONS[cat] || '•'} {cat.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && explanation.length > 0 && (
          <div className="rounded-2xl border border-brand-border p-6 mb-5 animate-slide-up" style={{ background: '#12121a', animationDelay: '0.1s', opacity: 0 }}>
            <h3 className="font-display font-700 text-base mb-4 text-brand-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              🔍 Risk Indicators Found
            </h3>
            <ul className="space-y-2">
              {explanation.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-brand-muted leading-relaxed">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono"
                    style={{ background: 'rgba(232,64,64,0.15)', color: '#e84040' }}>{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suspicious sentences with keyword highlighting */}
        {suspicious_sentences && suspicious_sentences.length > 0 && (
          <div className="rounded-2xl border border-brand-border p-6 mb-5 animate-slide-up" style={{ background: '#12121a', animationDelay: '0.2s', opacity: 0 }}>
            <h3 className="font-display font-700 text-base mb-4 text-brand-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              🚩 Flagged Lines
            </h3>
            <div className="space-y-3">
              {suspicious_sentences.map((sent, i) => (
                <div key={i} className="p-3 rounded-xl text-sm leading-relaxed"
                  style={{ background: 'rgba(232,64,64,0.06)', border: '1px solid rgba(232,64,64,0.15)', color: '#f0f0ff', fontFamily: "'DM Sans', sans-serif" }}>
                  {highlightKeywords(sent, keywords)}
                </div>
              ))}
            </div>
            {keywords && keywords.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-brand-muted mb-2 font-mono">DETECTED KEYWORDS:</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map(kw => (
                    <span key={kw} className="highlight-keyword text-xs px-2 py-1 rounded">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email warning */}
        {meta?.emailWarning && (
          <div className="rounded-xl border p-4 mb-5 text-sm"
            style={{ background: 'rgba(255,184,48,0.08)', borderColor: 'rgba(255,184,48,0.3)', color: '#ffb830' }}>
            🔒 <strong>Domain warning:</strong> {meta.emailWarning}
          </div>
        )}

        {/* Suggestions */}
        <div className="rounded-2xl border border-brand-border p-6 mb-5 animate-slide-up" style={{ background: '#12121a', animationDelay: '0.3s', opacity: 0 }}>
          <h3 className="font-display font-700 text-base mb-4 text-brand-text" style={{ fontFamily: "'Syne', sans-serif" }}>
            💡 Recommendations
          </h3>
          <ul className="space-y-3">
            {(suggestions[risk] || suggestions.Low).map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-brand-muted leading-relaxed">
                <span className="mt-0.5 text-brand-safe flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Original text preview */}
        {inputText && !inputText.startsWith('[File:') && (
          <details className="rounded-2xl border border-brand-border animate-slide-up" style={{ background: '#12121a', animationDelay: '0.4s', opacity: 0 }}>
            <summary className="p-5 cursor-pointer text-sm text-brand-muted hover:text-brand-text transition-colors">
              View analyzed text
            </summary>
            <div className="px-5 pb-5">
              <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: '#0a0a0f', color: '#f0f0ff', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'pre-wrap' }}>
                {highlightKeywords(inputText, keywords)}
              </div>
            </div>
          </details>
        )}

        <button onClick={onReset} className="mt-6 w-full py-4 rounded-xl font-display font-700 text-base transition-all hover:scale-[1.01] border border-brand-border text-brand-muted hover:text-brand-text"
          style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
          ← Analyze Another Job
        </button>
      </div>
    </div>
  );
}
