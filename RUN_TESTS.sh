#!/bin/bash

# Quick test script for TikTok Metrics App
# Run this after setting up your database

echo "🚀 Testing TikTok Metrics App"
echo "================================"
echo ""

# Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it with: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Testing OAuth endpoint..."
OAUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/tiktok)
if [ "$OAUTH_RESPONSE" = "302" ] || [ "$OAUTH_RESPONSE" = "307" ]; then
    echo "✅ OAuth endpoint is working (redirects to TikTok)"
else
    echo "⚠️  OAuth endpoint returned: $OAUTH_RESPONSE"
fi

echo ""
echo "3️⃣  Testing cron endpoint..."
CRON_RESPONSE=$(curl -s http://localhost:3000/api/cron)
if echo "$CRON_RESPONSE" | grep -q "message"; then
    echo "✅ Cron endpoint is working"
    echo "Response: $CRON_RESPONSE" | head -c 200
    echo "..."
else
    echo "⚠️  Cron endpoint response: $CRON_RESPONSE"
fi

echo ""
echo "4️⃣  Testing connect page..."
CONNECT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/connect)
if [ "$CONNECT_RESPONSE" = "200" ]; then
    echo "✅ Connect page is accessible"
else
    echo "⚠️  Connect page returned: $CONNECT_RESPONSE"
fi

echo ""
echo "================================"
echo "✅ Basic tests complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/connect in your browser"
echo "2. Click 'Connect TikTok Account' to test OAuth"
echo "3. After connecting, run: curl http://localhost:3000/api/cron"
echo "4. Check your database metrics table for results"

