#!/bin/bash

# Start the BasedGuide backend server
echo "🚀 Starting BasedGuide Backend..."

# Change to the src directory
cd "$(dirname "$0")/src"

# Set Python path and CORS configuration
export PYTHONPATH=.
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Start the server using uvicorn module
# Use python3.11 specifically since dependencies are installed there
python3.11 -m uvicorn app:app --host 0.0.0.0 --port 5001 --reload
