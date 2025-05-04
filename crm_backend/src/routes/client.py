from flask import Blueprint, request, jsonify
from src.models import db, Client

client_bp = Blueprint('client_bp', __name__)

@client_bp.route('/clients', methods=['POST'])
def create_client():
    data = request.get_json()
    if not data or not data.get('company') or not data.get('contact_name') or not data.get('email'):
        return jsonify({'message': 'Missing required fields'}), 400

    if Client.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Client with this email already exists'}), 409

    new_client = Client(
        company=data['company'],
        contact_name=data['contact_name'],
        email=data['email'],
        phone=data.get('phone'),
        monday_board_id=data.get('monday_board_id')
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify({'message': 'Client created successfully', 'client_id': new_client.id}), 201

@client_bp.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    output = []
    for client in clients:
        client_data = {
            'id': client.id,
            'company': client.company,
            'contact_name': client.contact_name,
            'email': client.email,
            'phone': client.phone,
            'monday_board_id': client.monday_board_id,
            'created_at': client.created_at,
            'updated_at': client.updated_at
        }
        output.append(client_data)
    return jsonify({'clients': output})

@client_bp.route('/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    client = Client.query.get_or_404(client_id)
    client_data = {
        'id': client.id,
        'company': client.company,
        'contact_name': client.contact_name,
        'email': client.email,
        'phone': client.phone,
        'monday_board_id': client.monday_board_id,
        'created_at': client.created_at,
        'updated_at': client.updated_at
    }
    return jsonify({'client': client_data})

@client_bp.route('/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    client = Client.query.get_or_404(client_id)
    data = request.get_json()

    if 'email' in data and data['email'] != client.email:
        if Client.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Client with this email already exists'}), 409
        client.email = data['email']

    client.company = data.get('company', client.company)
    client.contact_name = data.get('contact_name', client.contact_name)
    client.phone = data.get('phone', client.phone)
    client.monday_board_id = data.get('monday_board_id', client.monday_board_id)

    db.session.commit()
    return jsonify({'message': 'Client updated successfully'})

@client_bp.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    client = Client.query.get_or_404(client_id)
    # Add logic here to handle related deals if necessary before deleting
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client deleted successfully'})
