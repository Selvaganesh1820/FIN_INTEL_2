# Stock Portfolio Tracker API

A FastAPI backend for stock monitoring with sentiment analysis and email alerts.

## 🚀 Quick Start

### Option 1: Using the startup script (Recommended)
```bash
python start_server.py
```

### Option 2: Using uvicorn directly
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Windows batch file
```bash
start_backend.bat
```

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Virtual environment** (recommended)
3. **API Keys** (optional - demo mode available)

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables** (optional):
   Create a `.env` file in the backend directory:
   ```env
   # API Keys (get from https://finnhub.io/ and https://www.alphavantage.co/)
   FINNHUB_API_KEY=your_finnhub_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

   # Email Configuration (for alerts)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_TO=your-email@gmail.com
   ```

## 🌐 API Endpoints

- **Root**: `GET /` - API information
- **Health**: `GET /health` - Health check
- **Status**: `GET /status` - Configuration status
- **Monitor**: `POST /monitor` - Run stock monitoring

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔍 Features

- ✅ **Stock Price Monitoring** - Tracks price changes for configured stocks
- ✅ **News Sentiment Analysis** - Analyzes news sentiment using VADER
- ✅ **Email Alerts** - Sends alerts for price drops and negative news
- ✅ **CORS Support** - Ready for frontend integration
- ✅ **Error Handling** - Graceful handling of missing API keys
- ✅ **Demo Mode** - Works without real API keys

## 🛠️ Troubleshooting

### Common Issues:

1. **"Could not import module" error:**
   - Make sure you're in the `backend` directory
   - Run: `cd backend` then `python start_server.py`

2. **API key errors:**
   - The app works in demo mode without real API keys
   - Get free API keys from [Finnhub](https://finnhub.io/) and [Alpha Vantage](https://www.alphavantage.co/)

3. **Email not sending:**
   - Check your `.env` file configuration
   - For Gmail, use an App Password instead of your regular password

4. **Port already in use:**
   - Change the port in `start_server.py` or kill the process using port 8000

### Debug Mode:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI application
├── start_server.py      # Startup script with checks
├── stock_monitor.py     # Stock monitoring logic
├── sentiment.py         # Sentiment analysis
├── email_utils.py       # Email functionality
├── config.py           # Configuration management
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive data
- The app includes CORS middleware for frontend integration

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Check the console output for error messages
4. Ensure you're running from the correct directory 