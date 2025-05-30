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
    conn = await get_db_connection()
    try:
        deals = await conn.fetch(
            'SELECT id, client_id, sales_rep_id, stage, estimated_value, created_at, client_company FROM deals'
        )
        return [dict(deal) for deal in deals]
    finally:
        await conn.close()

@app.get('/deals/{deal_id}/stage-history')
async def get_stage_history(deal_id: int):
    conn = await get_db_connection()
    try:
        history = await conn.fetch(
            'SELECT stage, entered_at, exited_at FROM stage_history WHERE deal_id = $1 ORDER BY entered_at',
            deal_id
        )
        return [dict(h) for h in history]
    finally:
        await conn.close()

@app.get('/deals/{deal_id}/payments')
async def get_payment_schedules(deal_id: int):
    conn = await get_db_connection()
    try:
        payments = await conn.fetch(
            'SELECT id, amount_due, due_date, status FROM payment_schedules WHERE deal_id = $1',
            deal_id
        )
        return [dict(p) for p in payments]
    finally:
        await conn.close()