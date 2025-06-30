#!/bin/bash

# MCP Weather Server Test Script

echo "🚀 MCP Weather Server Test Script"
echo "=================================="

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start the server first:"
    echo "   go run cmd/server/main.go"
    exit 1
fi

echo ""
echo "🧪 Running tests..."

# Test 1: Health Check
echo "1. Testing Health Check..."
response=$(curl -s http://localhost:8080/health)
if echo "$response" | grep -q "healthy"; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
    echo "   Response: $response"
fi

# Test 2: Weather Request - Istanbul
echo "2. Testing Weather Request for Istanbul..."
response=$(curl -s -X POST http://localhost:8080/api/v1/weather/context \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weather_request",
    "payload": {
      "city": "Istanbul"
    }
  }')

if echo "$response" | grep -q "ContextResponse"; then
    echo "   ✅ Istanbul weather request passed"
    echo "   📊 Response: $(echo "$response" | jq -r '.message' | cut -c1-50)..."
else
    echo "   ❌ Istanbul weather request failed"
    echo "   Response: $response"
fi

# Test 3: Weather Request - Ankara
echo "3. Testing Weather Request for Ankara..."
response=$(curl -s -X POST http://localhost:8080/api/v1/weather/context \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weather_request",
    "payload": {
      "city": "Ankara"
    }
  }')

if echo "$response" | grep -q "ContextResponse"; then
    echo "   ✅ Ankara weather request passed"
    echo "   📊 Response: $(echo "$response" | jq -r '.message' | cut -c1-50)..."
else
    echo "   ❌ Ankara weather request failed"
    echo "   Response: $response"
fi

# Test 4: Invalid Request Type
echo "4. Testing Invalid Request Type..."
response=$(curl -s -X POST http://localhost:8080/api/v1/weather/context \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "payload": {
      "city": "Istanbul"
    }
  }')

if echo "$response" | grep -q "ErrorResponse"; then
    echo "   ✅ Invalid request type handled correctly"
else
    echo "   ❌ Invalid request type not handled"
    echo "   Response: $response"
fi

# Test 5: Missing City
echo "5. Testing Missing City..."
response=$(curl -s -X POST http://localhost:8080/api/v1/weather/context \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weather_request",
    "payload": {
      "city": ""
    }
  }')

if echo "$response" | grep -q "ErrorResponse"; then
    echo "   ✅ Missing city handled correctly"
else
    echo "   ❌ Missing city not handled"
    echo "   Response: $response"
fi

echo ""
echo "🎉 Test script completed!"
echo ""
echo "📝 Manual Test Commands:"
echo "   curl -X POST http://localhost:8080/api/v1/weather/context \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"type\": \"weather_request\", \"payload\": {\"city\": \"Izmir\"}}'"
echo ""
echo "   curl http://localhost:8080/health" 