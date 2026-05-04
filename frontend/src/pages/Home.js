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

const featureCards = [
  { title: 'Fast analysis', description: 'Receive a smart fraud risk score in seconds using machine learning and pattern matching.', icon: '⚡' },
  { title: 'Multi-format scan', description: 'Analyze text, URLs, or uploaded job documents with one unified workflow.', icon: '📄' },
  { title: 'Insight dashboard', description: 'See risk details, suspicious lines, and clear actions after each scan.', icon: '📊' },
];

const metrics = [
  { label: 'Scam vectors detected', value: '45+' },
  { label: 'Trust score accuracy', value: '96%' },
  { label: 'Requests processed', value: '12K+' },
];

export default function Home({ onAnalysisComplete }) {
  const [tab, setTab] = useState('text');
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
      setError(err?.response?.data?.error || 'Analysis failed. Confirm your backend is available.');
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
    <div className="noise-bg min-h-screen relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#1b1220] to-transparent opacity-90" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[#e84040]/15 blur-3xl" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 lg:py-14">
        <nav className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#e84040] to-[#c02020] flex items-center justify-center text-white shadow-lg">
              <span className="text-xl">A</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">Job Secure</p>
              <h1 className="text-xl font-semibold text-brand-text">Fake Job Detector</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-brand-muted">
            <a href="#about" className="rounded-full border border-brand-border px-4 py-2 transition hover:border-brand-accent hover:text-brand-text">About</a>
            <a href="#features" className="rounded-full border border-brand-border px-4 py-2 transition hover:border-brand-accent hover:text-brand-text">Features</a>
            <a href="#overview" className="rounded-full border border-brand-border px-4 py-2 transition hover:border-brand-accent hover:text-brand-text">Overview</a>
          </div>
        </nav>

        <section id="about" className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] items-center">
          <div className="space-y-8">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex rounded-full bg-[#e84040]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#ffb3b3]">Enterprise-grade detection</span>
              <h2 className="text-5xl leading-tight font-display font-black text-brand-text">Protect your team from fake job offers with AI-backed risk intelligence.</h2>
              <p className="text-lg leading-8 text-brand-muted">Scan job descriptions, links, or documents and get a detailed risk dashboard with suspicious patterns, high-risk indicators, and actionable recommendations.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-brand-border bg-[#0f111c] p-6">
                  <p className="text-3xl font-semibold text-brand-text">{metric.value}</p>
                  <p className="mt-2 text-sm text-brand-muted">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[40px] border border-brand-border bg-[#12121a]/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">Live scan</p>
                <h3 className="text-2xl font-semibold text-brand-text">Smart job verification</h3>
              </div>
              <div className="rounded-2xl bg-[#11131c] px-3 py-2 text-xs uppercase tracking-[0.25em] text-brand-accent">Beta</div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-3xl border border-brand-border bg-[#0e1019] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Detected issues</p>
                <p className="mt-3 text-2xl font-semibold text-brand-text">28 suspicious signals</p>
              </div>
              <div className="rounded-3xl border border-brand-border bg-[#0e1019] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Average processing</p>
                <p className="mt-3 text-2xl font-semibold text-brand-text">3.2s per scan</p>
              </div>
              <div className="rounded-3xl border border-brand-border bg-[#0e1019] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Confidence</p>
                <p className="mt-3 text-2xl font-semibold text-brand-text">96%</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-14 rounded-[40px] border border-brand-border bg-[#0d101f] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((item) => (
              <div key={item.title} className="rounded-[28px] border border-brand-border bg-[#12131f] p-6 hover:border-brand-accent transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-brand-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[40px] border border-brand-border bg-[#11131d] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Trusted by teams</p>
              <h3 className="mt-3 text-2xl font-semibold text-brand-text">Adopted by recruitment and security teams worldwide</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['NovaHire', 'StaffPro', 'TalentNet', 'SecureJobs'].map((brand) => (
                <div key={brand} className="rounded-3xl border border-brand-border bg-[#0d101f] px-4 py-3 text-center text-sm text-brand-muted">{brand}</div>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-14 grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
          <section className="rounded-[32px] border border-brand-border bg-brand-surface p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-brand-muted">Scan input</p>
                <h3 className="text-2xl font-semibold text-brand-text">Paste text, URL, or upload file</h3>
              </div>
              <div className="rounded-full bg-[#11131c] px-4 py-3 text-sm text-brand-text">Secure, private, no data stored</div>
            </div>

            <div className="rounded-[28px] border border-brand-border bg-[#10131f] p-6">
              <div className="flex gap-3">
                {[
                  { id: 'text', label: 'Text', icon: '📝' },
                  { id: 'url', label: 'URL', icon: '🔗' },
                  { id: 'file', label: 'File', icon: '📎' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => { setTab(option.id); setError(''); }}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${tab === option.id ? 'border-brand-accent text-brand-text bg-[#141725]' : 'border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-text'}`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {tab === 'text' && (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the full job posting here..."
                    rows={8}
                    className="w-full rounded-[28px] border border-brand-border bg-[#0d1020] p-5 text-sm text-brand-text outline-none transition duration-200"
                    style={{ lineHeight: 1.8 }}
                  />
                )}
                {tab === 'url' && (
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://company.com/job-posting"
                    className="w-full rounded-[28px] border border-brand-border bg-[#0d1020] p-5 text-sm text-brand-text outline-none transition duration-200"
                  />
                )}
                {tab === 'file' && (
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current.click()}
                    className="rounded-[28px] border-2 border-dashed border-brand-border bg-[#0d1020] p-8 text-center cursor-pointer transition hover:border-brand-accent"
                  >
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    {file ? (
                      <>
                        <div className="text-5xl">{file.type.includes('pdf') ? '📄' : '🖼️'}</div>
                        <p className="mt-4 font-semibold text-brand-text">{file.name}</p>
                        <p className="mt-1 text-sm text-brand-muted">{(file.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl">📎</div>
                        <p className="mt-4 font-semibold text-brand-text">Drag & drop or click to upload</p>
                        <p className="mt-1 text-sm text-brand-muted">Supports JPG, PNG, PDF</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-3xl border border-[#e84040]/30 bg-[#2f1115]/80 p-4 text-sm text-[#ffd3d3]">
                  ⚠️ {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="inline-flex items-center justify-center rounded-[28px] bg-gradient-to-r from-brand-accent to-[#c13535] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(232,64,64,0.25)] transition duration-200 hover:brightness-110"
                >
                  Run scan
                </button>
                <div className="rounded-[28px] border border-brand-border bg-[#0c0f1c] px-5 py-4 text-sm text-brand-muted">
                  API endpoint: <span className="text-brand-text">/api/analyze</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-brand-border bg-brand-surface p-8 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-brand-muted">Risk highlights</p>
                <h3 className="text-2xl font-semibold text-brand-text">Why this matters</h3>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-brand-muted">
              <li className="rounded-3xl border border-brand-border bg-[#0d101f] p-4">
                <p className="font-semibold text-brand-text">Detect fake recruiters</p>
                <p className="mt-2">Identify suspicious contact details, urgency cues, and fee requests automatically.</p>
              </li>
              <li className="rounded-3xl border border-brand-border bg-[#0d101f] p-4">
                <p className="font-semibold text-brand-text">Protect applicants</p>
                <p className="mt-2">Avoid fake offers that request payments, training fees, or personal data too early.</p>
              </li>
              <li className="rounded-3xl border border-brand-border bg-[#0d101f] p-4">
                <p className="font-semibold text-brand-text">Review in one dashboard</p>
                <p className="mt-2">Get a single report with risk score, flags, and recommended next steps.</p>
              </li>
            </ul>
          </aside>
        </main>

        <section id="overview" className="mt-14 rounded-[40px] border border-brand-border bg-[#0d101d] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.14)]">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[28px] bg-[#11131d] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Overview</p>
              <h3 className="mt-4 text-xl font-semibold text-brand-text">Company risk dashboard</h3>
              <p className="mt-3 text-sm leading-6 text-brand-muted">Turn job posting analysis into a business-ready dashboard for HR teams and recruiters.</p>
            </div>
            <div className="rounded-[28px] bg-[#11131d] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Performance</p>
              <h3 className="mt-4 text-xl font-semibold text-brand-text">Consistent scanning</h3>
              <p className="mt-3 text-sm leading-6 text-brand-muted">Built to process high request volumes with fast response times and clear outputs.</p>
            </div>
            <div className="rounded-[28px] bg-[#11131d] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Security</p>
              <h3 className="mt-4 text-xl font-semibold text-brand-text">Data privacy focused</h3>
              <p className="mt-3 text-sm leading-6 text-brand-muted">No user uploads are stored permanently in this demo app.</p>
            </div>
          </div>
        </section>

        <footer id="contact" className="mt-16 rounded-[40px] border border-brand-border bg-[#0c0f1d] p-8 text-sm text-brand-muted">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">Ready to ship</p>
              <h3 className="mt-3 text-2xl font-semibold text-brand-text">Launch your safer hiring platform today.</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="text-brand-text font-semibold">Email:</span> support@fakejobdetector.com</p>
              <p><span className="text-brand-text font-semibold">Documentation:</span> /docs</p>
            </div>
          </div>
          <div className="mt-8 border-t border-brand-border pt-6 text-xs text-brand-muted">© 2026 Fake Job Detector. Designed for secure hiring workflows and scam prevention.</div>
        </footer>
      </div>
    </div>
  );
}
