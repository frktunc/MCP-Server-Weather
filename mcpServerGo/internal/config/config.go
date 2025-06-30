package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Port                 int
	LogLevel             string
	OpenWeatherMapAPIKey string
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil && !os.IsNotExist(err) {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	port := 8080
	if portStr := os.Getenv("PORT"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}

	logLevel := "info"
	if level := os.Getenv("LOG_LEVEL"); level != "" {
		logLevel = level
	}

	apiKey := os.Getenv("OWM_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OWM_API_KEY environment variable is required")
	}

	return &Config{
		Port:                 port,
		LogLevel:             logLevel,
		OpenWeatherMapAPIKey: apiKey,
	}, nil
}
