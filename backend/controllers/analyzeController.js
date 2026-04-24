const axios = require('axios');

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:5001';

// ── Scam keyword quick-check (Node-side pre-filter) ─────────────────────────
const SCAM_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
const SCAM_KEYWORDS_QUICK = [
  'pay now', 'registration fee', 'training fee', 'upfront', 'western union',
  'no experience', 'earn lakhs', 'work from home', 'data entry', 'typing job',
  'whatsapp only', 'urgent hiring', 'limited seats', 'guaranteed job'
];

function validateEmail(email) {
  const match = email.match(/@([^>]+)/);
  if (!match) return { valid: true, warning: null };
  const domain = match[1].toLowerCase();
  if (SCAM_DOMAINS.includes(domain)) {
    return {
      valid: false,
      warning: `Contact email uses a personal domain (${domain}) — legitimate companies use corporate emails`
    };
  }
  return { valid: true, warning: null };
}

function quickScanText(text) {
  const lower = text.toLowerCase();
  return SCAM_KEYWORDS_QUICK.filter(kw => lower.includes(kw));
}

// ── Controllers ──────────────────────────────────────────────────────────────
async function analyzeJob(req, res) {
  try {
    const { text, url } = req.body;

    if (!text && !url) {
      return res.status(400).json({ error: 'Provide job description text or URL' });
    }

    let jobText = text || '';

    // If URL provided, add it to analysis text (basic domain check)
    if (url) {
      jobText += ` ${url}`;
      // Check for suspicious URL patterns
      if (/bit\.ly|tinyurl|t\.co|free\.?jobs/i.test(url)) {
        jobText += ' shortened url suspicious link';
      }
    }

    // Node-side pre-checks
    const quickHits = quickScanText(jobText);
    const emailMatch = jobText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    const emailCheck = emailMatch ? validateEmail(emailMatch[0]) : { valid: true, warning: null };

    // Forward to Python AI API
    const aiResponse = await axios.post(`${AI_API_URL}/predict`, { text: jobText }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });

    const aiResult = aiResponse.data;

    // Merge backend warnings into AI result
    const extraExplanations = [];
    if (emailCheck.warning) extraExplanations.push(emailCheck.warning);
    if (quickHits.length > 0 && aiResult.score < 20) {
      // Boost score slightly if quick scan found things AI might have missed
      aiResult.score = Math.min(aiResult.score + quickHits.length * 5, 100);
    }

    return res.json({
      ...aiResult,
      explanation: [...(extraExplanations), ...(aiResult.explanation || [])],
      meta: {
        emailWarning: emailCheck.warning,
        urlProvided: !!url,
        quickScanHits: quickHits
      }
    });

  } catch (err) {
    console.error('analyzeJob error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable. Make sure the Python API is running on port 5001.' });
    }
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For images/PDFs we extract text via OCR hint and send file metadata for analysis
    // In production, integrate Tesseract.js or Google Vision here
    // For now, return a placeholder analysis noting file was received
    const fileInfo = {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    };

    // Build a text description of the file for AI analysis
    const pseudoText = `Uploaded file: ${fileInfo.name}. File type: ${fileInfo.type}.
    Note: This appears to be a job posting image or PDF. 
    Common scam indicators in uploaded job ads include unofficial logos, 
    upfront payment requests, and vague job descriptions.`;

    const aiResponse = await axios.post(`${AI_API_URL}/predict`, { text: pseudoText }, {
      timeout: 15000
    });

    return res.json({
      ...aiResponse.data,
      meta: { fileUpload: true, fileName: fileInfo.name, note: 'Full OCR requires Tesseract integration' }
    });

  } catch (err) {
    console.error('uploadImage error:', err.message);
    return res.status(500).json({ error: 'File analysis failed.' });
  }
}

module.exports = { analyzeJob, uploadImage };
