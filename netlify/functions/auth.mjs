import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { Client } = pg;

export default async (req, context) => {
  const { method: httpMethod, url } = req;
  const path = new URL(url).pathname;
  
  let body = '';
  if (req.body) {
    const reader = req.body.getReader();
    const decoder = new TextDecoder();
    let result = await reader.read();
    while (!result.done) {
      body += decoder.decode(result.value);
      result = await reader.read();
    }
  }
  
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();

    if (httpMethod === 'POST' && (path.endsWith('/login') || path.includes('/.netlify/functions/auth'))) {
      const credentials = JSON.parse(body || '{}');
      
      const result = await client.query(
        'SELECT uuid, email_address, full_name, password FROM users WHERE email_address = $1',
        [credentials.username]
      );
      
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      
      if (!isValidPassword) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const secretKey = process.env.JWT_SECRET_KEY || 'your-secure-key';
      const token = jwt.sign({ sub: user.uuid }, secretKey, { algorithm: 'HS256' });
      
      return new Response(JSON.stringify({ 
        access_token: token, 
        refresh_token: token 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      });
    }

    if (httpMethod === 'GET' && (path.endsWith('/validate') || path.includes('/.netlify/functions/auth'))) {
      return new Response(JSON.stringify({
        uuid: 'test-uuid',
        email_address: 'test@example.com',
        full_name: 'Test User'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      });
    }

    if (httpMethod === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } finally {
    await client.end();
  }
};
