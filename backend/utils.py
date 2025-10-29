import base64
import copy
import json
import re
import uuid
import mimetypes
import markdown2
from math import ceil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from werkzeug.utils import secure_filename
import requests
from flask import current_app, request, flash, redirect, url_for

def set_security_headers(response):
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.google.com *.gstatic.com; "
        "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com; "
        "font-src 'self' data: *.gstatic.com; "
        "connect-src 'self' data: https://raw.githubusercontent.com *.googleapis.com *.google.com *.gstatic.com maps.gstatic.com; "
        "img-src 'self' data: *.googleapis.com *.gstatic.com; "
        "frame-src *.google.com; "
        "worker-src blob:;"
    )
    response.headers['Content-Security-Policy'] = csp
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

def wants_json_response() -> bool:
    accept_header = request.headers.get("Accept", "")
    return "application/json" in accept_header or request.is_json

def respond_error(message: str, status_code: int = 400):
    if wants_json_response():
        return {"error": message}, status_code
    flash(message, "error")
    return redirect(url_for("main.home"))

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]

def clean_json_response(text: str) -> Dict[str, Any]:
    if not isinstance(text, str):
        raise ValueError("Gemini returned a non-string response.")
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("Gemini returned an empty response.")
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 1)[1]
    cleaned = cleaned.strip().strip("`")
    if cleaned[:4].lower() == "json" and (len(cleaned) == 4 or cleaned[4] in {"\n", "\r", " "}):
        cleaned = cleaned[4:].lstrip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        snippet = cleaned[:200]
        raise ValueError(f"Gemini returned invalid JSON: {snippet}") from exc

def sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    if not metadata:
        return {}
    sanitized = copy.deepcopy(metadata)
    sanitized.pop("ward_geojson", None)
    sanitized.pop("coordinates", None)
    sanitized.pop("map_view", None)
    return sanitized

def build_ai_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    trimmed = sanitize_metadata(metadata)
    coordinates = metadata.get("coordinates", {})
    center = coordinates.get("center")
    if center:
        trimmed["center_point"] = {
            "lat": round(center.get("lat", 0), 6),
            "lng": round(center.get("lng", 0), 6),
        }
    bbox = coordinates.get("bounding_box") or {}
    if bbox:
        sw = bbox.get("southwest", {})
        ne = bbox.get("northeast", {})
        trimmed["bounding_box"] = {
            "southwest": {
                "lat": round(sw.get("lat", 0), 6),
                "lng": round(sw.get("lng", 0), 6),
            },
            "northeast": {
                "lat": round(ne.get("lat", 0), 6),
                "lng": round(ne.get("lng", 0), 6),
            },
        }
    if metadata.get("map_view"):
        trimmed["map_zoom"] = metadata["map_view"].get("zoom")
    return trimmed

def save_analysis_image(image_bytes: bytes, mime_type: str) -> str:
    storage_dir = Path(current_app.instance_path) / "analysis_images"
    extension = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}.get(mime_type, "png")
    token = f"{uuid.uuid4().hex}.{extension}"
    path = storage_dir / token
    path.write_bytes(image_bytes)
    return token

def delete_analysis_image(token: Optional[str]) -> None:
    if not token:
        return
    storage_dir = Path(current_app.instance_path) / "analysis_images"
    path = storage_dir / token
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass

def prepare_image_for_analysis(file_storage) -> Tuple[Dict[str, str], str, str]:
    filename = secure_filename(file_storage.filename or "image")
    extension = filename.rsplit(".", 1)[-1].lower()
    mime_type = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "webp": "image/webp",
    }.get(extension, "image/png")
    file_bytes = file_storage.read()
    file_storage.seek(0)
    return (
        {"mime_type": mime_type, "data": base64.b64encode(file_bytes).decode("utf-8")},
        save_analysis_image(file_bytes, mime_type),
        mime_type,
    )

def encode_image_bytes(image_bytes: bytes, mime_type: str = "image/png") -> Tuple[Dict[str, str], str, str]:
    return (
        {"mime_type": mime_type, "data": base64.b64encode(image_bytes).decode("utf-8")},
        save_analysis_image(image_bytes, mime_type),
        mime_type,
    )

def _simplify_path(points: List[List[float]], max_points: int = 100) -> List[List[float]]:
    if len(points) <= max_points:
        return points
    step = max(1, ceil(len(points) / max_points))
    return points[::step]

def build_static_map_path(geojson: Dict[str, Any]) -> Optional[str]:
    if not geojson:
        return None
    geometry = geojson.get("geometry", geojson)
    if not geometry:
        return None
    coordinates = geometry.get("coordinates")
    gtype = geometry.get("type")
    if not coordinates or not gtype:
        return None
    def format_ring(points: List[List[float]]) -> str:
        simplified = _simplify_path(points)
        if simplified[0] != simplified[-1]:
            simplified = simplified + [simplified[0]]
        return "|".join(f"{lat},{lng}" for lng, lat in simplified)
    path_body: Optional[str] = None
    if gtype == "Polygon":
        path_body = format_ring(coordinates[0])
    elif gtype == "MultiPolygon":
        first_polygon = coordinates[0]
        if first_polygon:
            path_body = format_ring(first_polygon[0])
    if not path_body:
        return None
    return "fillcolor:0x3300FF66|color:0x0044FF|weight:3|" + path_body

def fetch_static_map_image(metadata: Dict[str, Any]) -> bytes:
    google_maps_api_key = current_app.config["GOOGLE_MAPS_API_KEY"]
    if not google_maps_api_key:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is not configured.")
    center = metadata.get("coordinates", {}).get("center", {})
    bbox = metadata.get("coordinates", {}).get("bounding_box", {})
    lat = center.get("lat")
    lng = center.get("lng")
    if lat is None or lng is None:
        raise ValueError("Ward center coordinates are required for static map generation.")
    zoom = None
    if bbox:
        sw = bbox.get("southwest", {})
        ne = bbox.get("northeast", {})
        if sw.get("lat") and ne.get("lat") and sw.get("lng") and ne.get("lng"):
            lat_span = abs(ne["lat"] - sw["lat"])
            lng_span = abs(ne["lng"] - sw["lng"])
            max_span = max(lat_span, lng_span) * 1.5
            if max_span > 0.05:
                zoom = 13
            elif max_span > 0.02:
                zoom = 14
            elif max_span > 0.01:
                zoom = 15
            elif max_span > 0.005:
                zoom = 16
            else:
                zoom = 17
    if zoom is None:
        map_view = metadata.get("map_view", {})
        zoom = map_view.get("zoom")
        if zoom is None:
            zoom = 15
        zoom = max(12, int(zoom) - 1)
    zoom = max(12, min(int(round(zoom)), 19))
    params = {
        "key": google_maps_api_key,
        "center": f"{lat},{lng}",
        "zoom": str(zoom),
        "size": "640x640",
        "maptype": "satellite",
        "scale": "2",
        "format": "png",
    }
    path_param = build_static_map_path(metadata.get("ward_geojson"))
    if path_param:
        params["path"] = path_param
    static_map_url = "https://maps.googleapis.com/maps/api/staticmap?" + "&".join([f"{k}={v}" for k, v in params.items()])
    current_app.logger.info(
        "Fetching static satellite map",
        extra={
            "center": f"{lat},{lng}",
            "zoom": zoom,
            "has_boundary": bool(path_param),
            "bbox_span": f"{lat_span:.4f}°lat x {lng_span:.4f}°lng" if 'lat_span' in locals() else "N/A",
            "url_length": len(static_map_url),
            "url_preview": static_map_url[:200] + "..." if len(static_map_url) > 200 else static_map_url
        }
    )
    response = requests.get("https://maps.googleapis.com/maps/api/staticmap", params=params, timeout=30)
    response.raise_for_status()
    content_length = len(response.content)
    current_app.logger.info(f"Static map received: {content_length} bytes, content-type: {response.headers.get('content-type')}")
    if content_length < 5000:
        current_app.logger.warning(f"Static map image seems too small ({content_length} bytes) - may contain error message")
    return response.content

def _extract_text_from_gemini(response: Any) -> str:
    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        if not content:
            continue
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if isinstance(part_text, str) and part_text.strip():
                return part_text
    feedback = getattr(response, "prompt_feedback", None)
    raise ValueError(f"Gemini returned no usable text (feedback={feedback})")

def parse_numbered_list(content: str) -> List[str]:
    suggestions: List[str] = []
    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^(?:[-•]\s*)?(\d+)[\.\)]\s*(.+)$", line)
        if m:
            suggestions.append(m.group(2).strip())
            continue
        m2 = re.match(r"^(?:[-•]\s*)(.+)$", line)
        if m2:
            suggestions.append(m2.group(1).strip())
    return suggestions or [content.strip()]

def strip_reference_citations(text: Optional[str]) -> str:
    """Remove Perplexity-style reference markers like [1], [2][3] from a line.
    Keeps the rest of the text intact and collapses extra spaces.
    """
    if not isinstance(text, str):
        return ""
    # Remove one or more occurrences of [digits], optionally preceded by spaces
    cleaned = re.sub(r"(?:\s*\[\d+\])+", "", text)
    # Remove stray spaces before punctuation like .,;:)
    cleaned = re.sub(r"\s+([,.;:)])", r"\1", cleaned)
    # Collapse multiple spaces
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned

def normalize_tree_bold_markdown(text: Optional[str]) -> str:
    """Normalize Perplexity tree suggestion so only the common name is bold.
    Converts patterns like '**Jamun (Syzygium cumini)** — rationale' to
    '**Jamun** (Syzygium cumini) — rationale'. If already correct, returns as-is.
    """
    if not isinstance(text, str):
        return ""
    line = text.strip()
    # Regex: optional leading numbering, then **Name (Latin)**, then the rest
    m = re.match(r"^(?:\d+[\.)]\s*)?\*\*([^*()]+?)\s*\(([^)]+)\)\*\*(.*)$", line)
    if m:
        name = m.group(1).strip()
        latin = m.group(2).strip()
        tail = m.group(3)
        return f"**{name}** ({latin}){tail}"
    return line

def render_markdown_html(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    normalized = re.sub(r"(?<!\n)\s\*\s", "\n* ", text)
    normalized = re.sub(r"\n\*(?=\s)", "\n\n*", normalized)
    if not markdown2:
        sanitized = normalized.replace("**", "").replace("__", "")
        sanitized = sanitized.replace("* ", "• ")
        return sanitized.replace("\n", "<br>")
    try:
        return markdown2.markdown(normalized, extras=["fenced-code-blocks", "tables", "strike"])
    except Exception:
        return normalized.replace("\n", "<br>")
