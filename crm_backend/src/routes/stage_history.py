from flask import Blueprint, request, jsonify
from src.models import db, StageHistory, Deal
from sqlalchemy import Integer, String, Column, DateTime, Enum, ForeignKey, Text, Date, DECIMAL, Float
from sqlalchemy.orm import relationship
import datetime

stage_history_bp = Blueprint("stage_history_bp", __name__)

# Helper function to serialize stage history data
def serialize_stage_history(sh):
    return {
        "id": sh.id,
        "deal_id": sh.deal_id,
        "stage": sh.stage,
        "entered_at": sh.entered_at.isoformat(),
        "exited_at": sh.exited_at.isoformat() if sh.exited_at else None
    }

# Get all stage history entries for a specific deal
@stage_history_bp.route("/deals/<int:deal_id>/stage_history", methods=["GET"])
def get_stage_history_for_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id) # Ensure deal exists
    history = StageHistory.query.filter_by(deal_id=deal_id).order_by(StageHistory.entered_at.asc()).all()
    return jsonify({"stage_history": [serialize_stage_history(sh) for sh in history]})

# Note: Stage history is typically created/updated automatically when a deal's stage changes.
# Direct creation, update, or deletion via API might not be standard practice for audit trails.
# If needed, specific endpoints could be added, but are omitted here for simplicity and standard practice.

