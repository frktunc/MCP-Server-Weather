#!/bin/bash

echo "🌐 MCP Weather Server RESTful API Test"
echo "======================================"

# Server'ın çalışıp çalışmadığını kontrol et
echo "1. Server durumu kontrol ediliyor..."
curl -s http://localhost:3000/weather/test || echo "❌ Server çalışmıyor. Önce 'npm run start:dev' çalıştırın."

echo -e "\n2. Istanbul hava durumu (GET):"
curl -s http://localhost:3000/weather/city/Istanbul | jq '.' 2>/dev/null || curl -s http://localhost:3000/weather/city/Istanbul

echo -e "\n3. Ankara hava durumu (POST):"
curl -s -X POST http://localhost:3000/weather/get-weather \
  -H "Content-Type: application/json" \
  -d '{"city": "Ankara"}' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3000/weather/get-weather \
  -H "Content-Type: application/json" \
  -d '{"city": "Ankara"}'

echo -e "\n4. Izmir hava durumu (POST):"
curl -s -X POST http://localhost:3000/weather/get-weather \
  -H "Content-Type: application/json" \
  -d '{"city": "Izmir"}' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3000/weather/get-weather \
  -H "Content-Type: application/json" \
  -d '{"city": "Izmir"}'

echo -e "\n✅ Test tamamlandı!" 