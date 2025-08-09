const { Client } = require('pg');

const handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
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
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        },
        body: JSON.stringify(result.rows)
      };
    }

    if (httpMethod === 'POST' && (path.endsWith('/users') || path.includes('/.netlify/functions/users'))) {
      const payload = JSON.parse(body || '{}');
      
      await client.query(
        'INSERT INTO users (full_name, email_address, password, role) VALUES ($1, $2, $3, $4)',
        [payload.name, payload.email, payload.password, payload.role]
      );
      
      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        },
        body: JSON.stringify({ message: 'User created successfully' })
      };
    }

    if (httpMethod === 'PATCH' && path.includes('/users/')) {
      const userId = path.split('/users/')[1];
      const payload = JSON.parse(body || '{}');
      
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [payload.role, parseInt(userId)]
      );
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        },
        body: JSON.stringify({ message: 'User updated successfully' })
      };
    }

    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
        },
        body: ''
      };
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.end();
  }
};

exports.handler = handler;
