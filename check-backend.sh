#!/bin/bash

echo "🔍 Checking RoomRento Backend Status..."
echo ""

# Array of possible backend URLs
backends=(
    "https://roomrento.onrender.com"
    "https://roomrento-backend.onrender.com"
    "https://roomrento-api.onrender.com" 
)

for backend in "${backends[@]}"; do
    echo "Testing: $backend"
    
    # Check root endpoint
    response=$(curl -s -w "HTTP_STATUS_CODE:%{http_code}" "$backend" 2>/dev/null)
    status_code=$(echo "$response" | grep -o 'HTTP_STATUS_CODE:[0-9]*' | cut -d: -f2)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
        echo "✅ Server is responding (Status: $status_code)"
        
        # Test API endpoint
        api_response=$(curl -s -w "HTTP_STATUS_CODE:%{http_code}" "$backend/api/rooms" 2>/dev/null)
        api_status=$(echo "$api_response" | grep -o 'HTTP_STATUS_CODE:[0-9]*' | cut -d: -f2)
        
        if [ "$api_status" = "200" ]; then
            echo "✅ API endpoint working (Status: $api_status)"
            echo "🎉 FOUND WORKING BACKEND: $backend"
            break
        else
            echo "❌ API endpoint not working (Status: $api_status)"
        fi
    else
        echo "❌ Server not responding (Status: $status_code)"
    fi
    echo ""
done

echo ""
echo "🔍 Manual check commands:"
echo "curl -I https://roomrento.onrender.com"
echo "curl -I https://roomrento.onrender.com/api/rooms"
