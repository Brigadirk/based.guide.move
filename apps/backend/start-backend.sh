#!/bin/bash

# Start the BasedGuide backend server
echo "🚀 Starting BasedGuide Backend..."

# Load environment variables from the backend directory (before changing to src)
export PYTHONPATH="$(dirname "$0")/src"
cd "$(dirname "$0")"

# Set Python path and CORS configuration
export PYTHONPATH="$PYTHONPATH:."
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Start the server using uvicorn module
# Use python3.11 specifically since dependencies are installed there
python3.11 -m uvicorn app:app --host 0.0.0.0 --port 5001 --reload
