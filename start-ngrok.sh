#!/bin/bash

# Meetora ngrok Setup Helper Script
# This script helps you start ngrok tunnels for backend and frontend

echo "🚀 Meetora ngrok Setup Helper"
echo "================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install it with one of these methods:"
    echo ""
    echo "Option 1 - Download:"
    echo "  wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
    echo "  tar -xvzf ngrok-v3-stable-linux-amd64.tgz"
    echo "  sudo mv ngrok /usr/local/bin/"
    echo ""
    echo "Option 2 - Package Manager:"
    echo "  See NGROK_SETUP.md for apt installation"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if servers are running
echo "📡 Checking if servers are running..."
echo ""

# Check backend
if curl -s http://localhost:3001/api > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "⚠️  Backend is NOT running on http://localhost:3001"
    echo "   Start it with: cd backend && npm run start:dev"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend is NOT running on http://localhost:3000"
    echo "   Start it with: cd frontend && npm run dev"
fi

echo ""
echo "================================"
echo ""
echo "Starting ngrok tunnels..."
echo "This will open 2 terminal windows."
echo "Press Ctrl+C to stop the tunnels."
echo ""
echo "After tunnels start:"
echo "1. Note the HTTPS URLs for backend and frontend"
echo "2. Update frontend/.env.local with backend URL"
echo "3. Update backend/.env with frontend URL"
echo "4. Restart both servers"
echo ""
echo "See NGROK_SETUP.md for detailed instructions"
echo ""

# Function to start ngrok in background and capture URL
start_ngrok() {
    local port=$1
    local name=$2
    
    echo "Starting $name tunnel on port $port..."
    
    # Start ngrok in background and save to log file
    ngrok http $port > /tmp/ngrok-$name.log 2>&1 &
    
    # Wait for ngrok to start
    sleep 3
    
    # Try to get URL from ngrok API
    local url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*ngrok[^"]*' | head -1)
    
    if [ -n "$url" ]; then
        echo "✅ $name URL: $url"
    else
        echo "⚠️  Could not get $name URL automatically"
        echo "   Check the ngrok terminal for the URL"
    fi
}

# Ask user if they want to continue
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Opening ngrok terminals..."
echo "(Use Ctrl+C in each terminal to stop)"
echo ""

# Open terminals with ngrok commands
# For GNOME Terminal
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="ngrok - Backend (3001)" -- bash -c "ngrok http 3001; exec bash"
    sleep 2
    gnome-terminal --title="ngrok - Frontend (3000)" -- bash -c "ngrok http 3000; exec bash"
# For other terminal emulators
else
    echo "Could not detect terminal emulator."
    echo "Run these commands in separate terminals:"
    echo ""
    echo "Terminal 1: ngrok http 3001"
    echo "Terminal 2: ngrok http 3000"
fi

echo ""
echo "✅ ngrok setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the HTTPS URLs from the ngrok terminals"
echo "2. Update your environment files:"
echo "   - frontend/.env.local: NEXT_PUBLIC_API_URL"
echo "   - backend/.env: FRONTEND_URL"
echo "3. Restart your servers"
echo "4. Share the frontend URL with others!"
echo ""
