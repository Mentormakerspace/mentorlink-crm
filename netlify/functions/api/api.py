from fastapi import FastAPI

app = FastAPI()

@app.get('/deals')
async def get_deals():
    return [{'id': '1', 'title': 'Deal 1', 'status': 'Lead', 'amount': 5000, 'user_id': 'test-uuid'}]