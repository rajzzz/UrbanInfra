import mimetypes

import json
from flask import Blueprint, current_app, flash, redirect, render_template, request, session, url_for, send_file, abort, make_response, send_from_directory, jsonify
import ai_services, utils
import requests

main_bp = Blueprint('main', __name__)

@main_bp.route("/", methods=["GET"])
def home():
    response = send_file("../index.html")
    # Ensure no caching for the main page
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@main_bp.route("/analyze", methods=["POST"])
def analyze():

    current_app.logger.info(
        "Analyze request received",
        extra={
            "origin": request.headers.get("Origin"),
            "referer": request.headers.get("Referer"),
            "content_type": request.content_type,
            "content_length": request.content_length,
            "is_json": request.is_json,
            "form_keys": list(request.form.keys()),
            "file_keys": list(request.files.keys()),
        },
    )

    metadata = {}
    image_part = None
    image_token = None
    image_mime = None

    try:
        if request.is_json:
            payload = request.get_json(silent=True) or {}
            metadata = payload.get("metadata", {}) or {}
        else:
            metadata_raw = request.form.get("metadata_json", "")
            if metadata_raw:
                try:
                    metadata = json.loads(metadata_raw)
                except json.JSONDecodeError:
                    return utils.respond_error("Metadata must be valid JSON.")

            image_file = request.files.get("satellite_image")
            if image_file and image_file.filename:
                current_app.logger.info(
                    "Satellite image uploaded",
                    extra={
                        "uploaded_filename": image_file.filename,
                        "content_type": image_file.content_type,
                        "content_length": getattr(image_file, "content_length", None),
                    },
                )
                if not utils.allowed_file(image_file.filename):
                    return utils.respond_error("Unsupported file type. Upload PNG, JPG, JPEG, or WEBP.")
                image_part, image_token, image_mime = utils.prepare_image_for_analysis(image_file)

        image_error = None
        if metadata:
            current_app.logger.info(
                "Metadata parsed",
                extra={
                    "wardName": metadata.get("wardName"),
                    "wardNumber": metadata.get("wardNumber"),
                    "districtName": metadata.get("districtName"),
                    "has_coordinates": bool(metadata.get("coordinates")),
                    "has_geojson": bool(metadata.get("ward_geojson")),
                    "map_view": metadata.get("map_view"),
                },
            )
        else:
            current_app.logger.warning("Metadata missing from request")

        if image_part is None:
            if not metadata:
                return utils.respond_error("Ward metadata is required for analysis.")
            try:
                static_image = utils.fetch_static_map_image(metadata)
            except Exception as exc:
                current_app.logger.warning("Static map generation failed: %s", exc, exc_info=True)
                image_part = None
                image_token = None
                image_mime = None
                image_error = "Satellite preview unavailable; proceeding with metadata-only analysis."
            else:
                image_part, image_token, image_mime = utils.encode_image_bytes(static_image, "image/png")

        metadata_for_ai = utils.build_ai_metadata(metadata)

        try:
            greenery = ai_services.call_gemini_for_greenery(image_part, metadata_for_ai, current_app.config["GEMINI_API_KEY"])
        except Exception as exc:
            return utils.respond_error(f"Analysis failed: {exc}", 500)

        try:
            trees = ai_services.suggest_trees_via_perplexity(metadata_for_ai, current_app.config["PERPLEXITY_API_KEY"])
        except requests.HTTPError as http_err:
            trees = [f"Unable to fetch tree suggestions ({http_err})"]
        except Exception as exc:
            trees = [f"Tree suggestion service failed: {exc}"]

        previous_analysis = session.get("analysis") or {}
        if previous_analysis.get("image_token") and previous_analysis.get("image_token") != image_token:
            utils.delete_analysis_image(previous_analysis.get("image_token"))

        metadata_for_session = utils.sanitize_metadata(metadata)

        session["analysis"] = {
            "metadata": metadata_for_session,
            "greenery": greenery,
            "trees": trees,
            "recommendations": None,
            "recommendations_html": None,
            "image_token": image_token,
            "image_mime": image_mime,
            "image_error": image_error,
        }
        wants_json = utils.wants_json_response()

        if wants_json:
            return {"redirect_url": url_for("main.latest_analysis")}

        image_url = url_for("main.analysis_image", token=image_token) if image_token else None
        trees_sanitized = [utils.strip_reference_citations(t) for t in trees]
        trees_normalized = [utils.normalize_tree_bold_markdown(t) for t in trees_sanitized]
        trees_html = [utils.render_markdown_html(t) for t in trees_normalized]
        return render_template(
            "results.html",
            metadata=metadata_for_session,
            greenery=greenery,
            tree_suggestions=trees_normalized,
            tree_suggestions_html=trees_html,
            recommendations=None,
            recommendations_html=None,
            construction_type=None,
            image_url=image_url,
            image_error=image_error,
            back_to_map_url=current_app.config["FRONTEND_ORIGIN"] or url_for("main.home"),
        )

    except Exception as exc:
        current_app.logger.exception("Unexpected error in /analyze: %s", exc)
        error_response = make_response((json.dumps({"error": str(exc)}), 500, {"Content-Type": "application/json"}))
        return error_response

@main_bp.route("/analysis/latest", methods=["GET"])
def latest_analysis():
    analysis = session.get("analysis")
    if not analysis:
        flash("Please upload a ward before viewing results.", "error")
        return redirect(url_for("main.home"))

    return render_template(
        "results.html",
        metadata=analysis["metadata"],
        greenery=analysis["greenery"],
        tree_suggestions=analysis["trees"],
        tree_suggestions_html=[utils.render_markdown_html(utils.normalize_tree_bold_markdown(utils.strip_reference_citations(t))) for t in (analysis.get("trees") or [])],
        recommendations=analysis.get("recommendations"),
        recommendations_html=analysis.get("recommendations_html") or utils.render_markdown_html(analysis.get("recommendations")),
        construction_type=analysis.get("construction_type"),
        image_url=url_for("main.analysis_image", token=analysis.get("image_token")) if analysis.get("image_token") else None,
        image_error=analysis.get("image_error"),
        back_to_map_url=current_app.config["FRONTEND_ORIGIN"] or url_for("main.home"),
    )

from pathlib import Path

@main_bp.route("/analysis/image/<token>", methods=["GET"])
def analysis_image(token: str):
    analysis = session.get("analysis") or {}
    if analysis.get("image_token") != token:
        abort(404)

    path = Path(current_app.instance_path) / "analysis_images" / token
    if not path.exists():
        abort(404)

    mime_type = analysis.get("image_mime") or mimetypes.guess_type(str(path))[0] or "image/png"
    return send_file(path, mimetype=mime_type, download_name=token, max_age=0)

@main_bp.route("/recommend", methods=["POST"])
def recommend():
    construction_type = request.form.get("construction_type", "").strip()
    analysis = session.get("analysis")

    if not analysis:
        flash("Please analyze a ward before requesting recommendations.", "error")
        return redirect(url_for("main.home"))

    if not construction_type:
        flash("Tell us what type of construction you're planning.", "error")
        return redirect(url_for("main.home"))

    try:
        recommendations = ai_services.generate_construction_recommendations(
            analysis["metadata"],
            analysis["greenery"],
            analysis["trees"],
            construction_type,
            current_app.config["GEMINI_API_KEY"],
        )
    except Exception as exc:
        flash(f"Failed to generate recommendations: {exc}", "error")
        return redirect(url_for("main.home"))

    session["analysis"]["recommendations"] = recommendations
    session["analysis"]["recommendations_html"] = utils.render_markdown_html(recommendations)
    session["analysis"]["construction_type"] = construction_type
    session.modified = True

    return render_template(
        "results.html",
        metadata=analysis["metadata"],
        greenery=analysis["greenery"],
        tree_suggestions=analysis["trees"],
        recommendations=recommendations,
        recommendations_html=session["analysis"]["recommendations_html"],
        construction_type=construction_type,
        image_url=url_for("main.analysis_image", token=analysis.get("image_token")) if analysis.get("image_token") else None,
        image_error=analysis.get("image_error"),
        back_to_map_url=current_app.config["FRONTEND_ORIGIN"] or url_for("main.home"),
    )

@main_bp.route("/upload", methods=["GET"])
def upload_page():
    return render_template("upload.html")

@main_bp.route("/js/<path:path>")
def serve_js(path):
    response = send_from_directory("../js", path)
    # Prevent caching of JavaScript files
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@main_bp.route("/css/<path:path>")
def serve_css(path):
    response = send_from_directory("../css", path)
    # Prevent caching of CSS files
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@main_bp.route("/data/<path:path>")
def serve_data(path):
    return send_from_directory("../js", path)

@main_bp.route("/health", methods=["GET"])
def health_check():
    return {"status": "ok"}

@main_bp.route('/api/maps/sdk_url')
def get_maps_sdk_url():
    api_key = current_app.config.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return "API key not configured", 500
    
    # This is the modern Google Maps SDK URL with async loading for best performance
    sdk_url = f"https://maps.googleapis.com/maps/api/js?key={api_key}&loading=async"
    
    return jsonify({
        "sdk_url": sdk_url
    })