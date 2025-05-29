from fastapi import FastAPI, HTTPException
import asyncpg
import os
from pydantic import BaseModel

app = FastAPI()

class CreateUserPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UpdateUserPayload(BaseModel):
    role: str

async def get_db_connection():
    return await asyncpg.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('DB_HOST')
    )

@app.get('/users')
async def get_users():
    conn = await get_db_connection()
    try:
        users = await conn.fetch(
            'SELECT id, full_name as name, email_address as email, role FROM users'
        )
        return [dict(user) for user in users]
    finally:
        await conn.close()

@app.post('/users')
async def create_user(payload: CreateUserPayload):
    conn = await get_db_connection()
    try:
        # Note: In a production app, you'd hash the password (e.g., using passlib as in auth.py)
        await conn.execute(
            'INSERT INTO users (full_name, email_address, password, role) VALUES ($1, $2, $3, $4)',
            payload.name, payload.email, payload.password, payload.role
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await conn.close()

@app.patch('/users/{user_id}')
async def update_user(user_id: int, payload: UpdateUserPayload):
    conn = await get_db_connection()
    try:
        await conn.execute(
            'UPDATE users SET role = $1 WHERE id = $2',
            payload.role, user_id
        )
    finally:
        await conn.close()

@app.get('/deals')
async def get_deals():
    return [{'id': '1', 'title': 'Deal 1', 'status': 'Lead', 'amount': 5000, 'user_id': 'test-uuid'}]