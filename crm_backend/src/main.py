import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS # Import CORS
from src.models import db

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT' # Change this in production!
CORS(app, supports_credentials=True)  # TEMP: Allow all origins for testing
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql+psycopg2://crm_user:Bumper77!@localhost:5432/crm_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    from src.models import Client, User, Deal, PaymentSchedule, StageHistory, ActionItem
    db.create_all()

# Import blueprints after db is initialized and tables are created
from src.routes.client import client_bp
from src.routes.user import user_bp
from src.routes.deal import deal_bp
from src.routes.payment_schedule import payment_schedule_bp
from src.routes.stage_history import stage_history_bp
from src.routes.action_item import action_item_bp

app.register_blueprint(client_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(deal_bp, url_prefix='/api')
app.register_blueprint(payment_schedule_bp, url_prefix='/api')
app.register_blueprint(stage_history_bp, url_prefix='/api')
app.register_blueprint(action_item_bp, url_prefix='/api')

# Serve static files (for potential basic frontend or testing)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            # If no index.html, maybe return API status or docs?
            return jsonify({"message": "Backend API is running. No frontend index.html found."}), 200

# Add a global error handler for debugging
@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    print("Exception occurred:", e)
    traceback.print_exc()
    return {"error": str(e)}, 500

if __name__ == '__main__':
    # Ensure the app runs on 0.0.0.0 to be accessible externally if needed
    app.run(host='0.0.0.0', port=5000, debug=True) # debug=False for production

