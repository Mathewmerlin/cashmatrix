#!/bin/bash
echo "🚀 Starting CashMatrix Quantum Engine v5.0..."

# Start the Rust backend in the background
cd backend
cargo run &
BACKEND_PID=$!
cd ..

echo "⚡ Backend running with PID $BACKEND_PID"
echo "🌐 Frontend assets are built in dist/"

# Keep script alive and handle shutdown
trap "kill $BACKEND_PID; exit" INT TERM
wait $BACKEND_PID
