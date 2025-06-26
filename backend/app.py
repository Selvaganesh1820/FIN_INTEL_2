from fastapi import FastAPI
from stock_monitor import monitor_stocks

app = FastAPI()

@app.post('/monitor')
def run_monitor():
    alerts = monitor_stocks()
    return {'alerts': alerts}

@app.get('/status')
def status():
    return {'status': 'ok'} 