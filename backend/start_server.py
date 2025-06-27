#!/usr/bin/env python3
"""
Startup script for Stock Portfolio Tracker API
This script checks dependencies and starts the FastAPI server
"""

import sys
import os
import importlib

def check_dependencies():
    """Check if all required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'requests',
        'vaderSentiment',
        'python-dotenv'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - MISSING")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("\n✅ All dependencies are installed!")
    return True

def check_configuration():
    """Check if environment variables are configured"""
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n📋 Configuration Check:")
    
    # Check API keys
    finnhub_key = os.getenv('FINNHUB_API_KEY')
    alpha_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    
    if finnhub_key and finnhub_key != 'demo':
        print("✅ FINNHUB_API_KEY configured")
    else:
        print("⚠️  FINNHUB_API_KEY not configured (using demo)")
    
    if alpha_key and alpha_key != 'demo':
        print("✅ ALPHA_VANTAGE_API_KEY configured")
    else:
        print("⚠️  ALPHA_VANTAGE_API_KEY not configured (using demo)")
    
    # Check email configuration
    email_host = os.getenv('EMAIL_HOST')
    if email_host:
        print("✅ Email configuration found")
    else:
        print("⚠️  Email configuration not found (alerts will be logged only)")
    
    return True

def main():
    print("🚀 Stock Portfolio Tracker API - Startup Check")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check configuration
    check_configuration()
    
    print("\n🎯 Starting FastAPI server...")
    print("📖 API Documentation will be available at: http://localhost:8000/docs")
    print("🏠 API Root: http://localhost:8000")
    print("💚 Health Check: http://localhost:8000/health")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the server
    import uvicorn
    from main import app
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 