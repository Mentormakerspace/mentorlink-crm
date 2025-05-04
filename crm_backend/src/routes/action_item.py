from flask import Blueprint, request, jsonify
from src.models import db, ActionItem, Deal, User # Import necessary models
import datetime

action_item_bp = Blueprint("action_item_bp", __name__)

# Helper function to serialize action item data
def serialize_action_item(ai):
    return {
        "id": ai.id,
        "deal_id": ai.deal_id,
        "description": ai.description,
        "owner_id": ai.owner_id,
        "due_date": ai.due_date.isoformat() if ai.due_date else None,
        "completed_at": ai.completed_at.isoformat() if ai.completed_at else None,
        "created_at": ai.created_at.isoformat(),
        "updated_at": ai.updated_at.isoformat(),
        "owner_name": ai.owner.name if ai.owner else None # Optional: include owner name
    }

# Get all action items for a specific deal
@action_item_bp.route("/deals/<int:deal_id>/action_items", methods=["GET"])
def get_action_items_for_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id) # Ensure deal exists
    # Optionally filter by completion status, owner, etc.
    items = ActionItem.query.filter_by(deal_id=deal_id).order_by(ActionItem.due_date.asc()).all()
    return jsonify({"action_items": [serialize_action_item(item) for item in items]})

# Create a new action item for a deal
@action_item_bp.route("/deals/<int:deal_id>/action_items", methods=["POST"])
def create_action_item(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    data = request.get_json()
    required_fields = ["description", "owner_id", "due_date"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    # Validate owner exists
    if not User.query.get(data["owner_id"]):
        return jsonify({"message": "Owner (User) not found"}), 404

    try:
        new_item = ActionItem(
            deal_id=deal_id,
            description=data["description"],
            owner_id=data["owner_id"],
            due_date=datetime.date.fromisoformat(data["due_date"])
            # completed_at is typically set later
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Action item created successfully", "action_item": serialize_action_item(new_item)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create action item", "error": str(e)}), 500

# Get a specific action item
@action_item_bp.route("/action_items/<int:item_id>", methods=["GET"])
def get_action_item(item_id):
    item = ActionItem.query.get_or_404(item_id)
    return jsonify({"action_item": serialize_action_item(item)})

# Update an action item
@action_item_bp.route("/action_items/<int:item_id>", methods=["PUT"])
def update_action_item(item_id):
    item = ActionItem.query.get_or_404(item_id)
    data = request.get_json()

    try:
        item.description = data.get("description", item.description)
        item.owner_id = data.get("owner_id", item.owner_id)
        if "due_date" in data:
            item.due_date = datetime.date.fromisoformat(data["due_date"]) if data["due_date"] else None
        if "completed_at" in data:
            item.completed_at = datetime.datetime.fromisoformat(data["completed_at"]) if data["completed_at"] else None

        # Validate owner if changed
        if data.get("owner_id") and not User.query.get(data["owner_id"]):
            return jsonify({"message": "Owner (User) not found"}), 404

        item.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Action item updated successfully", "action_item": serialize_action_item(item)})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update action item", "error": str(e)}), 500

# Delete an action item
@action_item_bp.route("/action_items/<int:item_id>", methods=["DELETE"])
def delete_action_item(item_id):
    item = ActionItem.query.get_or_404(item_id)
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Action item deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete action item", "error": str(e)}), 500

