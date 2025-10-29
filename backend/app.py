from flask import Flask
from flask_cors import CORS
from config import load_configuration
from routes import main_bp
from pathlib import Path
import utils

def create_app():
    app = Flask(__name__, static_folder='../../delhiInfra', static_url_path='')
    
    # Load configuration
    app.config.update(load_configuration())

    # Initialize CORS
    CORS(app, origins=list(app.config.get("FRONTEND_ALLOWED_ORIGINS", [])), supports_credentials=True)

    # Create image storage directory
    with app.app_context():
        image_storage_dir = Path(app.instance_path) / "analysis_images"
        image_storage_dir.mkdir(parents=True, exist_ok=True)

    # Register blueprint
    app.register_blueprint(main_bp)

    @app.after_request
    def after_request(response):
        return utils.set_security_headers(response)

    return app

# Create the application instance for WSGI servers
app = create_app()

if __name__ == "__main__":
    # Development server
    app.run(debug=True, host="0.0.0.0", port=int(app.config.get("PORT", 5001)))