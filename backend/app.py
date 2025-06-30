from fastapi import FastAPI, Request
from stock_monitor import monitor_stocks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
import os

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GMAIL_USER = 'selvaganeshan1820@gmail.com'
GMAIL_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')  # Set this in your environment
EMAIL_TO = 'selvaganeshan1820@gmail.com'

class AlertEmail(BaseModel):
    symbol: str
    change: float
    changePercent: float

@app.post('/monitor')
def run_monitor():
    alerts = monitor_stocks()
    return {'alerts': alerts}

@app.get('/status')
def status():
    return {'status': 'ok'}

@app.post('/api/send-alert-email')
async def send_alert_email(alert: AlertEmail):
    subject = f"Stock Alert: {alert.symbol} Decrease"
    body = f"Alert: {alert.symbol} price decreased by {alert.change} ({alert.changePercent}%)"
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = GMAIL_USER
    msg['To'] = EMAIL_TO
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(msg)
        return {"status": "sent"}
    except Exception as e:
        print('Email error:', e)
        return {"error": str(e)}, 500 