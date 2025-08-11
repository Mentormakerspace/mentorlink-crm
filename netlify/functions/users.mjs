import pg from 'pg';
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

    if (httpMethod === 'GET' && (path.endsWith('/users') || path.includes('/.netlify/functions/users'))) {
      const result = await client.query(
        'SELECT id, full_name as name, email_address as email, role FROM users'
      );
      
      return new Response(JSON.stringify(result.rows), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        }
      });
    }

    if (httpMethod === 'POST' && (path.endsWith('/users') || path.includes('/.netlify/functions/users'))) {
      const payload = JSON.parse(body || '{}');
      
      await client.query(
        'INSERT INTO users (full_name, email_address, password, role) VALUES ($1, $2, $3, $4)',
        [payload.name, payload.email, payload.password, payload.role]
      );
      
      return new Response(JSON.stringify({ message: 'User created successfully' }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        }
      });
    }

    if (httpMethod === 'PATCH' && path.includes('/users/')) {
      const userId = path.split('/users/')[1];
      const payload = JSON.parse(body || '{}');
      
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [payload.role, parseInt(userId)]
      );
      
      return new Response(JSON.stringify({ message: 'User updated successfully' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        }
      });
    }

    if (httpMethod === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
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
