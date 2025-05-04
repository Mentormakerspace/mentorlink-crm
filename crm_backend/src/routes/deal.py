from flask import Blueprint, request, jsonify, current_app
from src.models import db, Deal
from src.models import Client, User, StageHistory
import datetime
import jwt
from functools import wraps

deal_bp = Blueprint("deal_bp", __name__)

# Helper to decode JWT and get user info
def get_jwt_identity():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except Exception:
        return None

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_jwt_identity()
        if not user:
            return jsonify({'message': 'Missing or invalid token'}), 401
        return f(user, *args, **kwargs)
    return decorated

# Helper function to serialize deal data
def serialize_deal(deal):
    return {
        "id": deal.id,
        "client_id": deal.client_id,
        "sales_rep_id": deal.sales_rep_id,
        "stage": deal.stage,
        "estimated_value": str(deal.estimated_value), # Convert Decimal to string
        "probability": deal.probability,
        "created_at": deal.created_at.isoformat(),
        "updated_at": deal.updated_at.isoformat(),
        "expected_close": deal.expected_close.isoformat() if deal.expected_close else None,
        "won_on": deal.won_on.isoformat() if deal.won_on else None,
        "lost_on": deal.lost_on.isoformat() if deal.lost_on else None,
        # Optionally include related data previews
        "client_company": deal.client.company if deal.client else None,
        "sales_rep_name": deal.sales_rep.name if deal.sales_rep else None
    }

@deal_bp.route("/deals", methods=["POST"])
def create_deal():
    data = request.get_json()
    required_fields = ["client_id", "sales_rep_id", "stage", "estimated_value", "probability", "expected_close"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    # Validate foreign keys exist
    if not Client.query.get(data["client_id"]):
        return jsonify({"message": "Client not found"}), 404
    if not User.query.get(data["sales_rep_id"]):
        return jsonify({"message": "Sales Rep (User) not found"}), 404

    try:
        new_deal = Deal(
            client_id=data["client_id"],
            sales_rep_id=data["sales_rep_id"],
            stage=data["stage"],
            estimated_value=data["estimated_value"],
            probability=data["probability"],
            expected_close=datetime.date.fromisoformat(data["expected_close"])
            # won_on and lost_on are typically set later
        )
        db.session.add(new_deal)
        db.session.flush() # Flush to get the new_deal.id for StageHistory

        # Create initial stage history entry
        initial_stage_history = StageHistory(
            deal_id=new_deal.id,
            stage=new_deal.stage,
            entered_at=datetime.datetime.utcnow()
        )
        db.session.add(initial_stage_history)

        db.session.commit()
        return jsonify({"message": "Deal created successfully", "deal": serialize_deal(new_deal)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create deal", "error": str(e)}), 500

@deal_bp.route("/deals", methods=["GET"])
@jwt_required
def get_deals(user):
    # Only Admins and Owners see all deals; SalesReps see only their own
    if user['role'] in ['Admin', 'Owner']:
        deals = Deal.query.order_by(Deal.created_at.desc()).all()
    else:
        deals = Deal.query.filter_by(sales_rep_id=user['user_id']).order_by(Deal.created_at.desc()).all()
    return jsonify({"deals": [serialize_deal(deal) for deal in deals]})

@deal_bp.route("/deals/<int:deal_id>", methods=["GET"])
def get_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    return jsonify({"deal": serialize_deal(deal)})

@deal_bp.route("/deals/<int:deal_id>", methods=["PUT"])
def update_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    data = request.get_json()
    original_stage = deal.stage

    try:
        # Update fields
        deal.client_id = data.get("client_id", deal.client_id)
        deal.sales_rep_id = data.get("sales_rep_id", deal.sales_rep_id)
        deal.stage = data.get("stage", deal.stage)
        deal.estimated_value = data.get("estimated_value", deal.estimated_value)
        deal.probability = data.get("probability", deal.probability)
        if "expected_close" in data:
            deal.expected_close = datetime.date.fromisoformat(data["expected_close"]) if data["expected_close"] else None
        if "won_on" in data:
            deal.won_on = datetime.date.fromisoformat(data["won_on"]) if data["won_on"] else None
        if "lost_on" in data:
            deal.lost_on = datetime.date.fromisoformat(data["lost_on"]) if data["lost_on"] else None

        # Validate FKs if changed
        if data.get("client_id") and not Client.query.get(data["client_id"]):
             return jsonify({"message": "Client not found"}), 404
        if data.get("sales_rep_id") and not User.query.get(data["sales_rep_id"]):
             return jsonify({"message": "Sales Rep (User) not found"}), 404

        # Update stage history if stage changed
        if deal.stage != original_stage:
            now = datetime.datetime.utcnow()
            # Find the last history entry for the original stage and mark exit time
            last_history = StageHistory.query.filter_by(deal_id=deal.id, stage=original_stage, exited_at=None).order_by(StageHistory.entered_at.desc()).first()
            if last_history:
                last_history.exited_at = now

            # Create new history entry for the new stage
            new_history = StageHistory(
                deal_id=deal.id,
                stage=deal.stage,
                entered_at=now
            )
            db.session.add(new_history)

        deal.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Deal updated successfully", "deal": serialize_deal(deal)})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update deal", "error": str(e)}), 500

@deal_bp.route("/deals/<int:deal_id>", methods=["DELETE"])
def delete_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    try:
        # Deletion cascades should handle related PaymentSchedules, StageHistories, ActionItems
        db.session.delete(deal)
        db.session.commit()
        return jsonify({"message": "Deal deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete deal", "error": str(e)}), 500

