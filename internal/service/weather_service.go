package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"mcp-weather-server/internal/models"
	"mcp-weather-server/pkg/logger"
)

// WeatherService interface for weather data operations
type WeatherService interface {
	GetWeatherData(ctx context.Context, city string) (*models.WeatherData, error)
}

// weatherService implements WeatherService interface
type weatherService struct {
	apiKey string
	client *http.Client
	logger logger.Logger
}

// NewWeatherService creates a new weather service instance
func NewWeatherService(apiKey string, logger logger.Logger) WeatherService {
	return &weatherService{
		apiKey: apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		logger: logger,
	}
}

// GetWeatherData fetches weather data from OpenWeatherMap API
func (w *weatherService) GetWeatherData(ctx context.Context, city string) (*models.WeatherData, error) {
	// Create request URL
	baseURL := "https://api.openweathermap.org/data/2.5/weather"
	params := url.Values{}
	params.Add("q", city)
	params.Add("appid", w.apiKey)
	params.Add("units", "metric") // Use Celsius
	params.Add("lang", "tr")      // Turkish language

	reqURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	w.logger.Debug("Weather API URL", "url", reqURL)

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	w.logger.Debug("Fetching weather data", "city", city, "url", reqURL)

	// Execute request
	resp, err := w.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check HTTP status code
	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Cod     string `json:"cod"`
			Message string `json:"message"`
		}
		if err := json.Unmarshal(body, &errorResp); err != nil {
			return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
		}
		return nil, fmt.Errorf("API request failed: %s", errorResp.Message)
	}

	// Parse response
	var weatherData models.WeatherData
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return nil, fmt.Errorf("failed to parse weather data: %w", err)
	}

	w.logger.Info("Successfully fetched weather data",
		"city", weatherData.Name,
		"temperature", weatherData.Main.Temp,
		"description", weatherData.Weather[0].Description)

	return &weatherData, nil
}
