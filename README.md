# SentimentScope — Python Backend
FastAPI service that powers the /api/analyze and /api/batch endpoints used by the SentimentScope React frontend.

Stack
FastAPI — REST API
VADER — lexicon-based sentiment for social media text
TextBlob — polarity & subjectivity
scikit-learn — TF-IDF keyword extraction
pandas — CSV parsing
Setup
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m textblob.download_corpora
Run
uvicorn main:app --reload --port 8000
The service is now available at http://localhost:8000.

Then in the frontend project root, create a .env file:

VITE_API_URL=http://localhost:8000
When VITE_API_URL is not set, the frontend falls back to a built-in JS analyzer and shows a "Demo Mode" banner.

Endpoints
POST /api/analyze
{ "text": "I love this product!", "platform": "twitter" }
Response:

{
  "sentiment": "positive",
  "confidence": 0.92,
  "scores": { "positive": 0.74, "negative": 0.0, "neutral": 0.26 },
  "keywords": ["love", "product"],
  "explanation": "Classified as positive (compound=+0.62)…"
}
POST /api/batch
Multipart upload — file field (CSV with a text column or TXT one post per line).

Returns { job_id, results: [{ text, sentiment, confidence }] }.

NLP pipeline
Preprocess: lowercase, strip URLs/mentions/hashtags, expand contractions
VADER compound + per-class scores
TextBlob polarity & subjectivity
Weighted ensemble: 0.6 * VADER + 0.4 * TextBlob
Classify: positive (> 0.05), negative (< -0.05), else neutral
Top-5 keywords via TF-IDF
Human-readable explanation string
Project context
Academic project — NIET Greater Noida, Department of CSE, 2025-26.
