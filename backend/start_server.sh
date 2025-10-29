#!/bin/bash

# Start the Flask app with Gunicorn

cd "$(dirname "$0")"

# Check and kill any processes using port 5001
echo "Checking if port 5001 is available..."
PIDS=$(lsof -ti:5001 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "Port 5001 is in use. Killing existing processes..."
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null
    done
    sleep 1
fi

source ../../venv/bin/activate

# Get the app instance from the app module
echo "Starting Gunicorn server on port 5001..."
exec gunicorn -c gunicorn_config.py app:app

