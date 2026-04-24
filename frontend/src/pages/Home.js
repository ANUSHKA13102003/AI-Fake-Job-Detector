import React, { useState, useRef } from 'react';
import Loader from '../components/Loader';
import { analyzeJobText, uploadJobFile } from '../services/api';

const SAMPLE_SCAM = `URGENT HIRING! Work From Home - Earn 2 Lakh Per Month!
No experience needed. Limited seats available - Apply NOW!
Simple data entry and copy-paste jobs. 100% Genuine opportunity.
Registration fee: ₹500 only. WhatsApp only: 9876543210
Guaranteed income every week. No interview, same day joining!`;

const SAMPLE_REAL = `Software Engineer - Full Stack (Remote)
We are looking for a skilled Software Engineer to join our product team. 
Requirements: 3+ years of React and Node.js experience, strong problem-solving skills.
Salary: ₹18-25 LPA based on experience. 
Interview process: Technical screen, coding round, and final interview.
Apply at careers@techcompany.com with your resume.`;

export default function Home({ onAnalysisComplete }) {
  const [tab, setTab] = useState('text'); // 'text' | 'url' | 'file'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleAnalyze = async () => {
    setError('');
    if (tab === 'text' && text.trim().length < 20) {
      setError('Please enter at least 20 characters of job description.');
      return;
    }
    if (tab === 'url' && !url.trim()) {
      setError('Please enter a job URL.');
      return;
    }
    if (tab === 'file' && !file) {
      setError('Please upload a file.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (tab === 'file') {
        result = await uploadJobFile(file);
        onAnalysisComplete(result, `[File: ${file.name}]`);
      } else {
        const jobText = tab === 'text' ? text : '';
        const jobUrl = tab === 'url' ? url : '';
        result = await analyzeJobText(jobText, jobUrl);
        onAnalysisComplete(result, jobText || jobUrl);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="noise-bg min-h-screen flex flex-col relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(232,64,64,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e84040, #7a1f1f)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                <path d="M11 8v3M11 14h.01" />
              </svg>
            </div>
            <span className="font-mono text-xs tracking-widest text-brand-muted uppercase">AI-Powered Detection</span>
          </div>
          <h1 className="font-display text-5xl font-800 leading-tight text-brand-text mb-3"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
            Fake Job<br />
            <span style={{ color: '#e84040' }}>Detector</span>
          </h1>
          <p className="text-brand-muted text-lg max-w-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Paste any job description and our NLP system will scan for scam indicators, suspicious patterns, and red flags in seconds.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-brand-border p-6 animate-slide-up"
          style={{ background: '#12121a', animationDelay: '0.1s', opacity: 0 }}>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#0a0a0f' }}>
            {[
              { id: 'text', label: 'Paste Text', icon: '📝' },
              { id: 'url', label: 'Job URL', icon: '🔗' },
              { id: 'file', label: 'Upload File', icon: '📎' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(''); }}
                className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: tab === t.id ? '#1e1e2e' : 'transparent',
                  color: tab === t.id ? '#f0f0ff' : '#6e6e8a',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* Text input */}
              {tab === 'text' && (
                <div className="space-y-3">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all duration-200"
                    style={{
                      background: '#0a0a0f',
                      border: '1px solid #1e1e2e',
                      color: '#f0f0ff',
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.7
                    }}
                    onFocus={e => e.target.style.borderColor = '#e84040'}
                    onBlur={e => e.target.style.borderColor = '#1e1e2e'}
                  />
                  {/* Sample buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setText(SAMPLE_SCAM)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-danger hover:border-brand-danger transition-colors"
                    >
                      Try scam sample
                    </button>
                    <button
                      onClick={() => setText(SAMPLE_REAL)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-safe hover:border-brand-safe transition-colors"
                      style={{ '--tw-text-opacity': 1 }}
                    >
                      Try legit sample
                    </button>
                    {text && <button onClick={() => setText('')} className="text-xs px-3 py-1.5 rounded-lg text-brand-muted hover:text-brand-text transition-colors ml-auto">Clear</button>}
                  </div>
                </div>
              )}

              {/* URL input */}
              {tab === 'url' && (
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm">🔗</span>
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://example.com/job-posting"
                      className="w-full rounded-xl p-4 pl-10 text-sm outline-none transition-all"
                      style={{
                        background: '#0a0a0f',
                        border: '1px solid #1e1e2e',
                        color: '#f0f0ff',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onFocus={e => e.target.style.borderColor = '#e84040'}
                      onBlur={e => e.target.style.borderColor = '#1e1e2e'}
                    />
                  </div>
                  <p className="text-xs text-brand-muted mt-2">The URL is analyzed for suspicious domain patterns and shortened links.</p>
                </div>
              )}

              {/* File upload */}
              {tab === 'file' && (
                <div
                  onDrop={handleFileDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all hover:border-brand-accent"
                  style={{ borderColor: '#1e1e2e' }}
                >
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <div>
                      <div className="text-3xl mb-2">{file.type.includes('pdf') ? '📄' : '🖼️'}</div>
                      <p className="text-brand-text font-medium">{file.name}</p>
                      <p className="text-brand-muted text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-brand-muted mt-3 hover:text-brand-text">Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3">📎</div>
                      <p className="text-brand-text font-medium mb-1">Drop file here or click to browse</p>
                      <p className="text-brand-muted text-sm">Supports JPG, PNG, PDF (max 5MB)</p>
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl border text-sm flex items-center gap-2"
                  style={{ background: 'rgba(232,64,64,0.08)', borderColor: 'rgba(232,64,64,0.3)', color: '#ff7a7a' }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="mt-4 w-full py-4 rounded-xl font-display font-700 text-base tracking-wide transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #e84040, #c02020)',
                  color: 'white',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 24px rgba(232,64,64,0.3)'
                }}
              >
                Analyze Job Posting →
              </button>
            </>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          {[
            { label: 'Scam patterns', value: '50+' },
            { label: 'NLP indicators', value: '15' },
            { label: 'Risk categories', value: '5' },
          ].map(stat => (
            <div key={stat.label} className="text-center py-4 rounded-xl border border-brand-border">
              <div className="font-display font-800 text-xl text-brand-accent" style={{ fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
              <div className="text-xs text-brand-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
