import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_FROM, EMAIL_TO

def send_email(subject, body):
    # Check if email configuration is complete
    if not all([EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_FROM, EMAIL_TO]):
        print(f"Email not sent - missing configuration. Subject: {subject}")
        print("Configure EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_FROM, EMAIL_TO in .env file")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = EMAIL_TO
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())
        
        print(f"Email sent successfully: {subject}")
        return True
    except Exception as e:
        print(f"Failed to send email '{subject}': {e}")
        return False 