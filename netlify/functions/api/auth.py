from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncpg
import os
from mangum import Mangum

app = FastAPI()

class UserCredentials(BaseModel):
    username: str
    password: str

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secure-key')
ALGORITHM = 'HS256'

async def get_db_connection():
    return await asyncpg.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('DB_HOST')
    )

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@app.post('/login')
async def login(creds: UserCredentials):
    conn = await get_db_connection()
    try:
        user = await conn.fetchrow(
            'SELECT uuid, email_address, full_name, password FROM users WHERE email_address = $1',
            creds.username
        )
        if not user or not pwd_context.verify(creds.password, user['password']):
            raise HTTPException(status_code=401, detail='Invalid credentials')
        token = jwt.encode({'sub': str(user['uuid'])}, SECRET_KEY, algorithm=ALGORITHM)
        return {'access_token': token, 'refresh_token': token}
    finally:
        await conn.close()

@app.get('/validate')
async def validate_token():
    return {'uuid': 'test-uuid', 'email_address': 'test@example.com', 'full_name': 'Test User'}

handler = Mangum(app)
