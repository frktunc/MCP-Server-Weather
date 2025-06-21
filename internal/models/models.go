package models

import "time"

// MCPRequest represents the incoming MCP request
type MCPRequest struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// WeatherRequest represents the payload for weather requests
type WeatherRequest struct {
	City string `json:"city"`
}

// WeatherData represents the weather information from OpenWeatherMap API
type WeatherData struct {
	Main struct {
		Temp      float64 `json:"temp"`
		FeelsLike float64 `json:"feels_like"`
		Humidity  int     `json:"humidity"`
		Pressure  int     `json:"pressure"`
	} `json:"main"`
	Weather []struct {
		ID          int    `json:"id"`
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Wind struct {
		Speed float64 `json:"speed"`
		Deg   int     `json:"deg"`
	} `json:"wind"`
	Clouds struct {
		All int `json:"all"`
	} `json:"clouds"`
	Rain struct {
		OneHour float64 `json:"1h,omitempty"`
	} `json:"rain,omitempty"`
	Snow struct {
		OneHour float64 `json:"1h,omitempty"`
	} `json:"snow,omitempty"`
	Visibility int   `json:"visibility"`
	Dt         int64 `json:"dt"`
	Sys        struct {
		Sunrise int64 `json:"sunrise"`
		Sunset  int64 `json:"sunset"`
	} `json:"sys"`
	Name string `json:"name"`
}

// ContextResponse represents the MCP response with contextual message
type ContextResponse struct {
	Message string `json:"message"`
	Data    struct {
		City        string    `json:"city"`
		Temperature float64   `json:"temperature"`
		Description string    `json:"description"`
		Humidity    int       `json:"humidity"`
		WindSpeed   float64   `json:"wind_speed"`
		Timestamp   time.Time `json:"timestamp"`
	} `json:"data"`
}

// ErrorResponse represents error responses
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
