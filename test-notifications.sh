#!/bin/bash

echo "🧪 Testing Notification System..."
echo ""

# Test 1: Login with demo credentials
echo "1. Testing login with demo credentials..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@renter.com","password":"demo123"}')

echo "Login response: $RESPONSE"

# Extract token (simple grep approach)
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Login successful"
    echo "Token: ${TOKEN:0:20}..."
    echo ""
    
    # Test 2: Get notifications
    echo "2. Testing get notifications..."
    NOTIFICATIONS=$(curl -s -X GET http://localhost:5000/api/notifications \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Notifications response: $NOTIFICATIONS"
    echo ""
    
    # Test 3: Test mark all as read
    echo "3. Testing mark all as read..."
    MARK_READ=$(curl -s -X PATCH http://localhost:5000/api/notifications/mark-all-read \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Mark all read response: $MARK_READ"
    
else
    echo "❌ Login failed - no token received"
fi
