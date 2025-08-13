export default async (req, context) => {
  return new Response(JSON.stringify({ 
    message: 'Basic function test', 
    method: req.method,
    url: req.url 
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    }
  });
};
