#!/bin/bash
# Shell script to run both Next.js client and WebSocket server

echo -e "\033[32mStarting Watch Together Application...\033[0m"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "\033[31mError: Node.js is not installed or not in PATH\033[0m"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "\033[31mError: npm is not installed or not in PATH\033[0m"
    exit 1
fi

# Install dependencies if needed
echo -e "\033[33mChecking and installing dependencies...\033[0m"

# Install server dependencies
if [ -f "server/package.json" ]; then
    cd server
    if [ ! -d "node_modules" ]; then
        echo -e "\033[33mInstalling server dependencies...\033[0m"
        npm install
    fi
    cd ..
else
    echo -e "\033[33mWarning: server/package.json not found\033[0m"
fi

# Install client dependencies
if [ -f "client/package.json" ]; then
    cd client
    if [ ! -d "node_modules" ]; then
        echo -e "\033[33mInstalling client dependencies...\033[0m"
        npm install
    fi
    cd ..
else
    echo -e "\033[33mWarning: client/package.json not found\033[0m"
fi

# Start the applications
echo -e "\033[32mStarting WebSocket server and Next.js client...\033[0m"

# Start server in background
cd server && npm run start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Start client in background
cd ../client && npm run dev &
CLIENT_PID=$!

cd ..

echo -e "\033[32mApplications are starting...\033[0m"
echo -e "\033[36mServer: WebSocket server on ws://localhost:8080\033[0m"
echo -e "\033[36mClient: Next.js app on http://localhost:3000\033[0m"
echo -e "\033[33mPress Ctrl+C to stop both applications\033[0m"

# Function to cleanup when script is interrupted
cleanup() {
    echo -e "\n\033[33mStopping applications...\033[0m"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    wait $SERVER_PID $CLIENT_PID 2>/dev/null
    echo -e "\033[32mApplications stopped.\033[0m"
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for user input to stop
while true; do
    sleep 1
done