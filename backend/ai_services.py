import json
from typing import Any, Dict, List, Optional
import google.generativeai as genai
import requests
from utils import clean_json_response, _extract_text_from_gemini, parse_numbered_list

def call_gemini_for_greenery(image_part: Optional[Dict[str, str]], metadata: Dict[str, Any], api_key: str) -> Dict[str, Any]:
    genai.configure(api_key=api_key)
    prompt = (
        """You are an urban analysis assistant focused on Delhi, India. 
        Using the provided ward metadata and satellite imagery, estimate a greenery score 
        between 0 and 10 (higher means more visible vegetation), summarize what you see, 
        and relate it to the population density. Respond ONLY with valid JSON in this structure:
        {
          \"greenery_score\": <integer 0-100>,
          \"greenery_summary\": <string>,
          \"population_context\": <string>,
          \"observations\": [<string>, ...]
        }
        Ground every observation in the image cues and the metadata."""
    ) if image_part else (
        """You are an urban analysis assistant focused on Delhi, India. 
        There is no current satellite imagery available, so rely solely on the ward metadata 
        to infer greenery conditions. Estimate a greenery score between 0 and 10, summarize 
        likely vegetation, and relate it to the population density. Respond ONLY with valid JSON in this structure:
        {
          \"greenery_score\": <integer 0-100>,
          \"greenery_summary\": <string>,
          \"population_context\": <string>,
          \"observations\": [<string>, ...]
        }
        Ground every observation explicitly in the metadata or reasonable inference rules when image data is missing."""
    )

    parts = [{"role": "user", "parts": [{"text": prompt}]}]
    if image_part:
        parts.append({"role": "user", "parts": [image_part]})
    parts.append({"role": "user", "parts": [{"text": "Ward metadata (JSON):\n" + json.dumps(metadata, indent=2)}]})

    model = genai.GenerativeModel(model_name="gemini-2.5-pro")
    response = model.generate_content(parts)
    text = _extract_text_from_gemini(response)
    return clean_json_response(text)

def suggest_trees_via_perplexity(metadata: Dict[str, Any], api_key: str) -> List[str]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    prompt = (
        "You are a Delhi-based urban forestry expert. Based on this ward metadata: "
        f"{json.dumps(metadata)}, list 5 native Delhi tree species with a short rationale for each. "
        "Output requirements (follow exactly):\n"
        "- Return EXACTLY 5 items as a numbered list from 1 to 5.\n"
    "- Each item MUST be a single line in the form: 1. **Tree Name** (Latin name) — rationale (12–20 words).\n"
    "- Bold ONLY the common tree name; the Latin name MUST NOT be bold; do not bold the rationale.\n"
        "- Do NOT include any citations or reference markers like [1], [2], [a], etc.\n"
        "- No headings, no extra paragraphs, no code fences, no trailing commentary."
    )
    payload = {
        "model": "sonar-pro",
        "temperature": 0.2,
        "max_tokens": 400,
        "messages": [
            {"role": "system", "content": "You recommend trees indigenous to Delhi."},
            {"role": "user", "content": prompt},
        ],
    }
    try:
        r = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=payload, timeout=60)
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        err = getattr(e, "response", None)
        raise RuntimeError(f"Perplexity request failed: {e}\n{getattr(err, 'text', '')}")
    data = r.json()
    content = data["choices"][0]["message"]["content"]
    return parse_numbered_list(content)

def generate_construction_recommendations(metadata: Dict[str, Any], greenery: Dict[str, Any], trees: List[str], construction_type: str, api_key: str) -> str:
    genai.configure(api_key=api_key)
    prompt = (
        "You are an urban planner for Delhi adhering to SDG 11 and Delhi Development Authority rules.\n"
        f"Construction type requested: {construction_type}.\n"
        f"Ward metadata: {json.dumps(metadata)}\n"
        f"Greenery findings: {json.dumps(greenery)}\n"
        f"Suggested trees: {json.dumps(trees)}\n"
        "Identify one or two optimal micro-locations within the ward for the construction."
        "For each location provide:\n"
        "1. A short description tied to features visible in the imagery metadata.\n"
        "2. Why it satisfies SDG 11 principles (e.g., sustainable transport, inclusive access).\n"
        "3. How it complies with relevant DDA guidance (setbacks, green buffers, density).\n"
        "Close with one actionable next step for city planners. Limit the answer to 200 words."
        "The points must each be in separate paragraph format not being bundled together for better understanding and readability."
        "Give heading for each point like *SDG11 requirements:* and *DDA Rules Compliance* that should be in bold like Actionable Next Steps."
    )

    model = genai.GenerativeModel(model_name="gemini-2.5-pro")
    response = model.generate_content(prompt)
    return response.text.strip()
