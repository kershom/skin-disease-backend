from app import app

with app.test_client() as c:
    r = c.get('/health')
    print('Status:', r.status_code)
    print('Data:', r.data)