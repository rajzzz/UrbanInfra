# Server Setup Guide

This Flask application can be run in two modes:

## Development Server

For development and debugging:

```bash
cd backend
source ../venv/bin/activate
python app.py
```

The server will run on `http://127.0.0.1:5001` with auto-reload enabled.

## Production Server (Gunicorn)

For production use, use Gunicorn:

### Option 1: Using the startup script

```bash
cd backend
./start_server.sh
```

### Option 2: Manual Gunicorn command

```bash
cd backend
source ../venv/bin/activate
gunicorn -c gunicorn_config.py app:app
```

### Gunicorn Configuration

The `gunicorn_config.py` file includes:
- **Workers**: Automatically set based on CPU cores (CPU_COUNT * 2 + 1)
- **Bind**: `0.0.0.0:5001` (accessible on all interfaces)
- **Timeout**: 120 seconds
- **Logging**: To stdout/stderr

### Customizing Workers

To override the number of workers:

```bash
gunicorn -c gunicorn_config.py --workers 4 app:app
```

### Running in Background

To run Gunicorn as a background process:

```bash
nohup gunicorn -c gunicorn_config.py app:app > gunicorn.log 2>&1 &
```

### Stopping the Server

If running in foreground: `Ctrl+C`

If running in background, find the process:
```bash
ps aux | grep gunicorn
kill <PID>
```

Or use:
```bash
pkill -f "gunicorn.*app:app"
```

