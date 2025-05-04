from flask import Blueprint, request, jsonify
from src.models import db, PaymentSchedule, Deal # Import necessary models
import datetime

payment_schedule_bp = Blueprint("payment_schedule_bp", __name__)

# Helper function to serialize payment schedule data
def serialize_payment_schedule(ps):
    return {
        "id": ps.id,
        "deal_id": ps.deal_id,
        "milestone_name": ps.milestone_name,
        "amount_due": str(ps.amount_due), # Convert Decimal to string
        "due_date": ps.due_date.isoformat() if ps.due_date else None,
        "status": ps.status,
        "paid_on": ps.paid_on.isoformat() if ps.paid_on else None,
        "created_at": ps.created_at.isoformat(),
        "updated_at": ps.updated_at.isoformat()
    }

# Get all payment schedules for a specific deal
@payment_schedule_bp.route("/deals/<int:deal_id>/payment_schedules", methods=["GET"])
def get_payment_schedules_for_deal(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    schedules = PaymentSchedule.query.filter_by(deal_id=deal_id).order_by(PaymentSchedule.due_date).all()
    return jsonify({"payment_schedules": [serialize_payment_schedule(ps) for ps in schedules]})

# Create a new payment schedule for a deal
@payment_schedule_bp.route("/deals/<int:deal_id>/payment_schedules", methods=["POST"])
def create_payment_schedule(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    data = request.get_json()
    required_fields = ["milestone_name", "amount_due", "due_date", "status"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    if data["status"] not in ["pending", "paid"]:
        return jsonify({"message": "Invalid status specified"}), 400

    try:
        new_schedule = PaymentSchedule(
            deal_id=deal_id,
            milestone_name=data["milestone_name"],
            amount_due=data["amount_due"],
            due_date=datetime.date.fromisoformat(data["due_date"]),
            status=data["status"],
            paid_on=datetime.date.fromisoformat(data["paid_on"]) if data.get("paid_on") and data["status"] == "paid" else None
        )
        db.session.add(new_schedule)
        db.session.commit()
        return jsonify({"message": "Payment schedule created successfully", "payment_schedule": serialize_payment_schedule(new_schedule)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create payment schedule", "error": str(e)}), 500

# Get a specific payment schedule
@payment_schedule_bp.route("/payment_schedules/<int:schedule_id>", methods=["GET"])
def get_payment_schedule(schedule_id):
    schedule = PaymentSchedule.query.get_or_404(schedule_id)
    return jsonify({"payment_schedule": serialize_payment_schedule(schedule)})

# Update a payment schedule
@payment_schedule_bp.route("/payment_schedules/<int:schedule_id>", methods=["PUT"])
def update_payment_schedule(schedule_id):
    schedule = PaymentSchedule.query.get_or_404(schedule_id)
    data = request.get_json()

    if "status" in data and data["status"] not in ["pending", "paid"]:
        return jsonify({"message": "Invalid status specified"}), 400

    try:
        schedule.milestone_name = data.get("milestone_name", schedule.milestone_name)
        schedule.amount_due = data.get("amount_due", schedule.amount_due)
        if "due_date" in data:
            schedule.due_date = datetime.date.fromisoformat(data["due_date"]) if data["due_date"] else None
        schedule.status = data.get("status", schedule.status)
        if "paid_on" in data:
             schedule.paid_on = datetime.date.fromisoformat(data["paid_on"]) if data["paid_on"] else None
        # Ensure paid_on is set if status is paid, and cleared if status is pending
        if schedule.status == "paid" and not schedule.paid_on:
            schedule.paid_on = datetime.date.today() # Default to today if paid_on not provided
        elif schedule.status == "pending":
            schedule.paid_on = None

        schedule.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Payment schedule updated successfully", "payment_schedule": serialize_payment_schedule(schedule)})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update payment schedule", "error": str(e)}), 500

# Delete a payment schedule
@payment_schedule_bp.route("/payment_schedules/<int:schedule_id>", methods=["DELETE"])
def delete_payment_schedule(schedule_id):
    schedule = PaymentSchedule.query.get_or_404(schedule_id)
    try:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({"message": "Payment schedule deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete payment schedule", "error": str(e)}), 500

