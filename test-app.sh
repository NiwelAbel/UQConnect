#!/bin/bash

echo "=== UQ Connect Feature Test ==="
echo ""

# Test server status
echo "1. Checking server status..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running, please start the server first"
    exit 1
fi

echo ""

# Test registration
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","name":"Test User"}')

if echo "$REGISTER_RESPONSE" | grep -q "User created successfully"; then
    echo "✅ Registration function works"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Registration function failed"
    echo "Response: $REGISTER_RESPONSE"
fi

echo ""

# Test login with registered user
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "✅ Login function works"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Login function failed"
    echo "Response: $LOGIN_RESPONSE"
fi

echo ""

# Test events API
echo "4. Testing events API..."
EVENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/events)
EVENTS_COUNT=$(echo "$EVENTS_RESPONSE" | grep -o '"id"' | wc -l)

if [ "$EVENTS_COUNT" -gt 0 ]; then
    echo "✅ Events API works, returned $EVENTS_COUNT events"
else
    echo "❌ Events API abnormal"
fi

echo ""

# Test calendar API
echo "5. Testing calendar API..."
CALENDAR_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/calendar)

if echo "$CALENDAR_RESPONSE" | grep -q "events"; then
    echo "✅ Calendar API works"
else
    echo "❌ Calendar API abnormal"
fi

echo ""

# Test recommendations API
echo "6. Testing recommendations API..."
RECOMMENDATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/recommendations)
RECOMMENDATIONS_COUNT=$(echo "$RECOMMENDATIONS_RESPONSE" | grep -o '"id"' | wc -l)

if echo "$RECOMMENDATIONS_RESPONSE" | grep -q "recommendations"; then
    echo "✅ Recommendations API works, returned $RECOMMENDATIONS_COUNT recommendations"
else
    echo "❌ Recommendations API abnormal"
fi

echo ""

echo "=== Test Complete ==="
echo ""
echo "🌐 Access Application: http://localhost:3001"
echo "📝 Create Account: http://localhost:3001/register.html"
echo ""
echo "📱 Main Feature Pages:"
echo "   - Login: http://localhost:3001/login.html"
echo "   - Register: http://localhost:3001/register.html"
echo "   - Dashboard: http://localhost:3001/dashboard.html"
echo "   - Events: http://localhost:3001/events.html"
echo "   - Calendar: http://localhost:3001/calendar.html"
echo "   - Recommendations: http://localhost:3001/recommendations.html"
