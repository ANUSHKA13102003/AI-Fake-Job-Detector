import React, { useEffect, useRef, useState } from 'react';

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
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'));
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
    <div className="relative w-44 h-44 mx-auto">
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
        <span className="font-display text-4xl font-800" style={{ fontFamily: "'Syne', sans-serif", color: cfg.color, fontWeight: 800 }}>{score}%</span>
        <span className="font-mono text-xs text-brand-muted mt-1">RISK INDEX</span>
      </div>
    </div>
  );
}

export default function Result({ result, inputText, onReset }) {
  const { score, risk, explanation, keywords, suspicious_sentences, categories_hit } = result;
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low;
  const [copyStatus, setCopyStatus] = useState('Copy summary');

  const recommendations = {
    High: [
      'Do not transfer money for processing, registration, or training.',
      'Verify the employer through official corporate channels.',
      'Do not share bank or identity details until verified.',
      'Report the posting if it appears in a job portal or social media listing.',
    ],
    Medium: [
      'Review company details and recruiter credibility before applying.',
      'Ask for a formal interview invitation and signed offer letter.',
      'Validate contact emails against official domains.',
      'Maintain caution if the recruiter requests immediate action.',
    ],
    Low: [
      'Proceed with normal application steps and maintain standard verification.',
      'Confirm interview details through the listed company website.',
      'Keep records of all job offer communication.',
    ],
  };

  const handleCopySummary = async () => {
    const summary = `Fake Job Detector Report\nScore: ${score}%\nRisk: ${cfg.label}\nTop findings: ${explanation?.slice(0, 3).join('; ')}`;
    await navigator.clipboard.writeText(summary);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy summary'), 1800);
  };

  return (
    <div className="noise-bg min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#21111f] to-transparent opacity-90" />
      <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-[#e84040]/15 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="rounded-[40px] border border-brand-border bg-brand-surface p-8 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">Analysis complete</p>
                  <h1 className="text-4xl font-display font-black text-brand-text mt-2">Risk dashboard</h1>
                </div>
                <button
                  onClick={onReset}
                  className="rounded-full border border-brand-border px-5 py-3 text-sm text-brand-text transition hover:border-brand-accent hover:text-brand-accent"
                >
                  Scan another job
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr] items-center">
                <div>
                  <div className="rounded-[32px] border border-brand-border bg-[#10131f] p-6 text-center">
                    <ScoreRing score={score} risk={risk} />
                    <p className="mt-4 text-sm uppercase tracking-[0.2em] text-brand-muted">Overall risk score</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-brand-border bg-[#11131f] p-6">
                    <span className="inline-flex rounded-full bg-[#ffffff]/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-brand-muted">{cfg.label}</span>
                    <h2 className="mt-4 text-3xl font-semibold text-brand-text">{risk === 'High' ? 'Likely scam detected' : risk === 'Medium' ? 'Potential risk found' : 'Looks authentic'}</h2>
                    <p className="mt-3 text-sm leading-7 text-brand-muted">{risk === 'High'
                      ? 'Strong indicators suggest this posting is fraudulent. Avoid further contact.'
                      : risk === 'Medium'
                      ? 'The posting contains concerning patterns. Proceed with caution.'
                      : 'No significant scam indicators were found in this analysis.'}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[28px] border border-brand-border bg-[#10131f] p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Source</p>
                      <p className="mt-3 text-lg text-brand-text">{inputText.startsWith('[File:') ? 'Uploaded file' : inputText.startsWith('http') ? 'Job URL' : 'Job text'}</p>
                    </div>
                    <div className="rounded-[28px] border border-brand-border bg-[#10131f] p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Confidence</p>
                      <p className="mt-3 text-lg text-brand-text">High</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[32px] border border-brand-border bg-brand-surface p-6">
                <h2 className="font-display text-xl font-semibold text-brand-text mb-4">Risk summary</h2>
                <ul className="space-y-3 text-sm text-brand-muted">
                  {(explanation || []).slice(0, 4).map((item, index) => (
                    <li key={index} className="rounded-3xl border border-[#ffffff]/10 bg-[#12131f] p-4">
                      <div className="text-sm text-brand-muted mb-2">Indicator {index + 1}</div>
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[32px] border border-brand-border bg-brand-surface p-6">
                <h2 className="font-display text-xl font-semibold text-brand-text mb-4">Recommendations</h2>
                <ul className="space-y-3 text-sm text-brand-muted">
                  {(recommendations[risk] || recommendations.Low).map((item, index) => (
                    <li key={index} className="rounded-3xl border border-[#ffffff]/10 bg-[#12131f] p-4">
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[40px] border border-brand-border bg-brand-surface p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Live insights</p>
                  <h2 className="text-2xl font-semibold text-brand-text">Dashboard view</h2>
                </div>
                <button onClick={handleCopySummary} className="rounded-full border border-brand-border px-3 py-2 text-xs text-brand-muted hover:text-brand-text transition">{copyStatus}</button>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-brand-border bg-[#10131f] p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Flagged categories</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(categories_hit || []).map((cat) => (
                      <span key={cat} className="rounded-full bg-[#11131f] px-3 py-1 text-xs text-brand-text">{CATEGORY_ICONS[cat] || '•'} {cat.replace(/_/g, ' ')}</span>
                    ))}
                    {!(categories_hit && categories_hit.length) && (
                      <span className="rounded-full bg-[#11131f] px-3 py-1 text-xs text-brand-muted">No categories flagged</span>
                    )}
                  </div>
                </div>
                <div className="rounded-[28px] border border-brand-border bg-[#10131f] p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Top keywords</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(keywords || []).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-[#11131f] px-3 py-1 text-xs text-brand-text">{keyword}</span>
                    ))}
                    {!(keywords && keywords.length) && <span className="rounded-full bg-[#11131f] px-3 py-1 text-xs text-brand-muted">No keywords found</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] border border-brand-border bg-[#0d101d] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">Report</p>
              <p className="mt-4 text-sm leading-7 text-brand-muted">Download the findings or share them with your team to ensure the posting is properly reviewed before any engagement.</p>
              <button className="mt-6 w-full rounded-[28px] bg-gradient-to-r from-brand-accent to-[#c13535] px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110">
                Export report
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
