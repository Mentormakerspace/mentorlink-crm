export default async (req, context) => {
  try {
    const { method: httpMethod, url } = req;
    const path = new URL(url).pathname;
    
    console.log('Function called:', { httpMethod, path });
    
    let body = '';
    if (req.body && httpMethod === 'POST') {
      const reader = req.body.getReader();
      const decoder = new TextDecoder();
      let result = await reader.read();
      while (!result.done) {
        body += decoder.decode(result.value);
        result = await reader.read();
      }
    }
    
    console.log('Request body:', body);

    if (httpMethod === 'GET' && (path.endsWith('/users') || path.includes('/.netlify/functions/users'))) {
      return new Response(JSON.stringify([
        { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }
      ]), {
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
      console.log('Creating user:', payload);
      
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

    return new Response(JSON.stringify({ error: 'Not found', method: httpMethod, path }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
