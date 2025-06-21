package service

import (
	"context"
	"testing"

	"mcp-weather-server/pkg/logger"
)

func TestNewWeatherService(t *testing.T) {
	logger := logger.New("info")
	apiKey := "test-api-key"

	service := NewWeatherService(apiKey, logger)

	if service == nil {
		t.Error("Expected weather service to be created, got nil")
	}
}

func TestWeatherService_GetWeatherData_InvalidCity(t *testing.T) {
	logger := logger.New("info")
	apiKey := "test-api-key" // Test API key

	service := NewWeatherService(apiKey, logger)
	ctx := context.Background()

	// Test with invalid city
	_, err := service.GetWeatherData(ctx, "InvalidCity12345")

	if err == nil {
		t.Error("Expected error for invalid city, got nil")
	}
}
