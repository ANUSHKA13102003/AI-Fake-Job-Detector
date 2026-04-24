# 🔍 AI Fake Job Detection System

A full-stack application that uses NLP to detect fraudulent job postings. Paste any job description and get an instant scam risk score with detailed explanations.

---

## 📁 Folder Structure

```
AI-Fake-Job-Detector/
├── frontend/           # React + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js       ← Input page
│   │   │   └── Result.js     ← Analysis results
│   │   ├── components/
│   │   │   └── Loader.js     ← Animated loading state
│   │   ├── services/
│   │   │   └── api.js        ← Axios API calls
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/            # Node.js + Express
│   ├── server.js
│   ├── routes/
│   │   └── analyze.js        ← REST API routes
│   ├── controllers/
│   │   └── analyzeController.js ← Business logic
│   └── package.json
│
├── ai-model/           # Python Flask + NLTK
│   ├── app.py               ← Flask API server
│   ├── model.py             ← NLP analysis logic
│   └── requirements.txt
│
└── README.md
```

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-job` | Analyze job text or URL |
| POST | `/api/upload-image` | Analyze uploaded image/PDF |
| GET | `/health` | Backend health check |
| GET | `http://localhost:5001/health` | AI model health check |

### POST `/api/analyze-job`
**Request:**
```json
{ "text": "Job description here...", "url": "https://optional-url.com" }
```

**Response:**
```json
{
  "score": 78,
  "risk": "High",
  "explanation": ["Requests payment from applicant: detected 2 indicator(s)"],
  "keywords": ["registration fee", "whatsapp only"],
  "suspicious_sentences": ["Registration fee: ₹500 only."],
  "categories_hit": ["payment_required", "urgency"]
}
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- Python 3.9+
- npm or yarn

---

### 1. Start the Python AI Model

```bash
cd ai-model

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data (first time only)
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('punkt_tab')"

# Start Flask server
python app.py
# ✅ Runs on http://localhost:5001
```

---

### 2. Start the Node.js Backend

```bash
cd backend
npm install
npm run dev
# ✅ Runs on http://localhost:5000
```

---

### 3. Start the React Frontend

```bash
cd frontend
npm install
npm start
# ✅ Opens http://localhost:3000
```

---

## 🎛️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
AI_API_URL=http://localhost:5001
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

> **Note:** The frontend `package.json` includes `"proxy": "http://localhost:5000"` so the `.env` file is only needed for production builds.

---

## ☁️ Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → Import in Vercel → Set REACT_APP_API_URL env var
```

### Backend → Render
- Create a new Web Service on render.com
- Connect your GitHub repo, set root to `/backend`
- Build command: `npm install`
- Start command: `node server.js`
- Add env var: `AI_API_URL=<your-flask-url>`

### AI Model → Railway / Render
```bash
# Procfile (add to ai-model/)
web: gunicorn app:app --bind 0.0.0.0:$PORT
```
- Deploy `ai-model/` folder
- Set start command: `gunicorn app:app`

---

## 🧠 How Detection Works

1. **50+ scam keyword patterns** across 5 categories:
   - ⏱️ **Urgency** — "urgent", "limited seats", "act now"
   - 💸 **Payment requests** — "registration fee", "western union"
   - 💰 **Unrealistic salary** — "earn 2 lakh per month", "daily payment"
   - 🌫️ **Vague offers** — "data entry", "typing job", "no experience needed"
   - 🔓 **No credentials** — "WhatsApp only", "no interview"

2. **Salary anomaly detection** — regex-based extraction of salary figures

3. **Email domain check** — flags personal domains (gmail, yahoo) used as company contact

4. **Suspicious URL patterns** — shortened links, free-job domains

5. **Risk scoring** — weighted sum → 0–100 fake score → Low / Medium / High

---

## 🔌 Browser Extension Ready

The backend API is CORS-enabled and accepts plain JSON, making it trivial to integrate into a Chrome extension:

```javascript
// extension/content.js
const jobText = document.body.innerText.slice(0, 3000);
fetch('https://your-backend.render.com/api/analyze-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: jobText })
}).then(r => r.json()).then(result => {
  if (result.risk === 'High') {
    // Show warning badge
  }
});
```

---

## 📄 License

MIT — free to use and modify.
