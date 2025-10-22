Delhi Urban Analysis Backend
=================================

This folder hosts a lightweight Flask backend that powers the urban greenery and planning workflow. It accepts a satellite image + ward metadata, calls Gemini 2.5 Pro for greenery analysis, queries the Perplexity API for native tree suggestions, and renders the results with an option to request SDG 11/DDA-aligned construction recommendations.

Prerequisites
-------------
1. **Python 3.9+** (tested on macOS).
2. A Google Gemini API key with access to the `gemini-2.5-pro` model.
3. A Perplexity API key that can call the `sonar-medium-online` model.

Environment Setup
-----------------
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file alongside `app.py` with the following values:
```
GEMINI_API_KEY=your_google_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
FLASK_SECRET_KEY=any-long-random-string
FRONTEND_ORIGIN=http://127.0.0.1:5500  # replace with the origin that serves index.html
PORT=5001  # optional override
```

Running the Server
------------------
```bash
python app.py
```

The app will be available at `http://127.0.0.1:5001/`. Use the upload form to:

1. Upload a satellite image (`png/jpg/jpeg/webp`).
2. Paste ward metadata JSON (include keys such as `ward_id`, `area_sq_km`, `population`, `density`, `bounds`, etc.).
3. Submit to trigger Gemini + Perplexity analysis.
4. Review greenery results, tree suggestions, and supply a construction type for SDG 11/DDA planning guidance.

Health Check
------------
```bash
curl http://127.0.0.1:5001/health
```

Expected Response:
```json
{"status": "ok"}
```

Troubleshooting
---------------
- If Gemini returns parsing errors, confirm your metadata JSON is valid and the image is under 10 MB.
- Perplexity errors usually indicate a missing/invalid API key or request quota limits.
- If the static map UI is hosted on a different port/domain, set `FRONTEND_ORIGIN` so the backend allows cross-origin requests with cookies.
- For verbose debugging, temporarily add `print()` statements around the API calls inside `app.py`.