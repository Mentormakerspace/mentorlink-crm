from flask import Blueprint, request, jsonify, current_app
from src.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import traceback

user_bp = Blueprint("user_bp", __name__)

# User signup (create user)
@user_bp.route("/users", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        print("[DEBUG] Incoming signup data:", data)
        if not data or not data.get("name") or not data.get("email") or not data.get("role") or not data.get("password"):
            print("[ERROR] Missing required fields.")
            return jsonify({"message": "Missing required fields"}), 400

        if data["role"] not in ["Owner", "Admin", "SalesRep"]:
            print(f"[ERROR] Invalid role specified: {data['role']}")
            return jsonify({"message": "Invalid role specified"}), 400

        if User.query.filter_by(email=data["email"]).first():
            print(f"[ERROR] User with email {data['email']} already exists.")
            return jsonify({"message": "User with this email already exists"}), 409

        # Hash the password
        password_hash = generate_password_hash(data["password"])

        new_user = User(
            name=data["name"],
            email=data["email"],
            role=data["role"],
            password_hash=password_hash
        )
        db.session.add(new_user)
        db.session.commit()
        user_data = {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "created_at": new_user.created_at
        }
        print(f"[INFO] User created successfully: {user_data}")
        return jsonify({"message": "User created successfully", "user": user_data}), 201
    except Exception as e:
        print("[EXCEPTION] Exception occurred during user signup:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal server error", "error": str(e)}), 500

# User login
@user_bp.route('/auth/login', methods=['POST'], strict_slashes=False)
def auth_login():
    try:
        print("[DEBUG] Auth Login request headers:", dict(request.headers))
        print("[DEBUG] Auth Login raw data:", request.data)
        data = request.get_json()
        print("[DEBUG] Auth Login parsed JSON:", data)
        if not data or not data.get('email') or not data.get('password'):
            print("[ERROR] Missing email or password in auth login.")
            return jsonify({'message': 'Missing email or password'}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password_hash, data['password']):
            print("[ERROR] Invalid email or password for:", data.get('email'))
            return jsonify({'message': 'Invalid email or password'}), 401

        # Generate JWT
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
        print(f"[INFO] User logged in (auth): {user_data}")
        return jsonify({'token': token, 'user': user_data}), 200
    except Exception as e:
        print("[EXCEPTION] Exception occurred during auth login:", e)
        traceback.print_exc()
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@user_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    output = []
    for user in users:
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        output.append(user_data)
    return jsonify({"users": output})

@user_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    return jsonify({"user": user_data})

@user_bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "email" in data and data["email"] != user.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "User with this email already exists"}), 409
        user.email = data["email"]

    if "role" in data and data["role"] not in ["Owner", "Admin", "SalesRep"]:
         return jsonify({"message": "Invalid role specified"}), 400

    user.name = data.get("name", user.name)
    user.role = data.get("role", user.role)
    # Add password update logic if needed
    if "password" in data and data["password"]:
        user.password_hash = generate_password_hash(data["password"])

    db.session.commit()
    return jsonify({"message": "User updated successfully"})

@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    # Add logic here to handle reassignment of deals/action items if necessary
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"})