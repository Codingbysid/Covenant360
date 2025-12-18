#!/bin/bash

# Script to run the Covenant360 FastAPI backend
# Run this from the project root directory

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Run the FastAPI server
echo "Starting Covenant360 API server..."
echo "API will be available at http://localhost:8000"
echo "API Documentation at http://localhost:8000/docs"
echo ""
uvicorn main:app --reload --port 8000

