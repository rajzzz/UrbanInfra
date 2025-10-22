
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

def load_configuration():
    load_dotenv()
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is required. Add it to your environment or .env file.")
    if not perplexity_api_key:
        raise RuntimeError("PERPLEXITY_API_KEY is required. Add it to your environment or .env file.")

    raw_frontend_origin = os.getenv("FRONTEND_ORIGIN")
    if raw_frontend_origin:
        frontend_allowed_origins = [origin.strip() for origin in raw_frontend_origin.split(',')]
    else:
        # Default origins for local development
        frontend_allowed_origins = [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
        ]
    
    # The "null" origin is for local file access (e.g., opening index.html directly)
    frontend_allowed_origins.append("null")

    # The first origin is used for generating URLs back to the frontend
    frontend_origin = frontend_allowed_origins[0] if frontend_allowed_origins else ""


    return {
        "GEMINI_API_KEY": gemini_api_key,
        "PERPLEXITY_API_KEY": perplexity_api_key,
        "GOOGLE_MAPS_API_KEY": google_maps_api_key,
        "FRONTEND_ORIGIN": frontend_origin,
        "FRONTEND_ALLOWED_ORIGINS": frontend_allowed_origins,
        "SECRET_KEY": os.getenv("SECRET_KEY", "dev_secret_key"),
        "MAX_CONTENT_LENGTH": 10 * 1024 * 1024,
        "ALLOWED_EXTENSIONS": {"png", "jpg", "jpeg", "webp"},
    }
