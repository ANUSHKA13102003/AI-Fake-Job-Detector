import re
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.download('punkt_tab', quiet=True)
except:
    pass

# ── Scam keyword categories ──────────────────────────────────────────────────
URGENCY_KEYWORDS = [
    "urgent", "immediately", "asap", "right away", "limited seats",
    "limited slots", "act now", "today only", "last chance", "hurry",
    "don't miss", "do not miss", "closing soon", "deadline today",
    "apply now before", "spots filling fast"
]

PAYMENT_KEYWORDS = [
    "pay now", "upfront payment", "registration fee", "training fee",
    "security deposit", "processing fee", "send money", "wire transfer",
    "western union", "moneygram", "bitcoin payment", "cryptocurrency",
    "advance payment", "pay to apply", "investment required",
    "buy your kit", "purchase kit", "starter kit fee"
]

UNREALISTIC_SALARY = [
    "earn lakhs", "earn crores", "make lakhs", "unlimited earnings",
    "unlimited income", "no experience required.*salary", "earn from home.*lakh",
    "monthly income.*lakh", "weekly payout", "daily payment", "earn 1 lakh",
    "earn 2 lakh", "earn 50000 daily", "earn 10000 daily",
    "high salary no experience", "no skills required.*high pay"
]

VAGUE_KEYWORDS = [
    "work from home", "be your own boss", "flexible hours", "easy money",
    "passive income", "no experience needed", "anyone can do it",
    "simple task", "data entry", "copy paste", "typing job",
    "online part time", "genuine opportunity", "100% genuine",
    "guaranteed income", "guaranteed job", "no target", "no pressure"
]

CREDENTIAL_KEYWORDS = [
    "whatsapp only", "contact on whatsapp", "no interview",
    "no resume required", "direct joining", "same day joining",
    "no verification", "no background check", "gmail account",
    "yahoo email", "personal email", "no company website"
]

ALL_SCAM_KEYWORDS = {
    "urgency": URGENCY_KEYWORDS,
    "payment_required": PAYMENT_KEYWORDS,
    "unrealistic_salary": UNREALISTIC_SALARY,
    "vague_offer": VAGUE_KEYWORDS,
    "no_credentials": CREDENTIAL_KEYWORDS,
}

CATEGORY_WEIGHTS = {
    "urgency": 12,
    "payment_required": 25,
    "unrealistic_salary": 20,
    "vague_offer": 8,
    "no_credentials": 15,
}

CATEGORY_LABELS = {
    "urgency": "High-pressure urgency tactics",
    "payment_required": "Requests payment from applicant",
    "unrealistic_salary": "Unrealistic salary claims",
    "vague_offer": "Vague or suspicious job offer",
    "no_credentials": "Lacks professional credibility",
}

# ── Salary anomaly detector ──────────────────────────────────────────────────
def detect_salary_anomaly(text: str):
    """Return True if text contains suspiciously high salary figures."""
    text_lower = text.lower()
    patterns = [
        r'\b(\d{1,2})\s*lakh\s*per\s*(month|week|day)\b',
        r'earn\s+(?:up\s+to\s+)?(\d{2,})[,\s]*000\s*(?:per\s+(?:month|day|week))?',
        r'salary\s*:\s*[\u20b9$]?\s*(\d{2,})[,\s]*000\+?\s*(?:per\s+month)?',
    ]
    for pat in patterns:
        m = re.search(pat, text_lower)
        if m:
            try:
                val = int(m.group(1).replace(',', ''))
                # Monthly salary > 5 lakh for "no experience" jobs is anomalous
                if val >= 5:
                    return True
            except (IndexError, ValueError):
                pass
    return False

# ── Core analysis ────────────────────────────────────────────────────────────
def analyze_job_text(text: str) -> dict:
    text_lower = text.lower()
    found_keywords = {}
    explanation = []
    total_score = 0

    for category, keywords in ALL_SCAM_KEYWORDS.items():
        hits = [kw for kw in keywords if kw in text_lower]
        if hits:
            found_keywords[category] = hits
            weight = CATEGORY_WEIGHTS[category]
            contribution = min(weight * len(hits), weight * 2)  # cap per category
            total_score += contribution
            explanation.append(f"{CATEGORY_LABELS[category]}: detected {len(hits)} indicator(s) — \"{', '.join(hits[:3])}\"")

    # Salary anomaly bonus
    if detect_salary_anomaly(text):
        total_score += 15
        explanation.append("Salary anomaly: unusually high pay promised for low-skill role")

    # Sentence-level suspicious highlights
    try:
        sentences = sent_tokenize(text)
    except Exception:
        sentences = text.split('.')

    suspicious_sentences = []
    all_flat_keywords = [kw for kws in ALL_SCAM_KEYWORDS.values() for kw in kws]
    for sent in sentences:
        sent_lower = sent.lower()
        if any(kw in sent_lower for kw in all_flat_keywords):
            suspicious_sentences.append(sent.strip())

    # Clamp score 0–100
    score = min(int(total_score), 100)

    # Risk level
    if score >= 60:
        risk = "High"
    elif score >= 30:
        risk = "Medium"
    else:
        risk = "Low"

    # Flat unique keyword list for frontend highlighting
    flat_keywords = list({kw for hits in found_keywords.values() for kw in hits})

    return {
        "score": score,
        "risk": risk,
        "explanation": explanation if explanation else ["No major scam indicators detected."],
        "keywords": flat_keywords,
        "suspicious_sentences": suspicious_sentences[:5],
        "categories_hit": list(found_keywords.keys()),
    }
