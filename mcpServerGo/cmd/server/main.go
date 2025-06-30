package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"mcp-weather-server/internal/config"
	"mcp-weather-server/internal/service"
	"mcp-weather-server/pkg/logger"

	mcp_golang "github.com/metoro-io/mcp-golang"
	"github.com/metoro-io/mcp-golang/transport/stdio"
)

// Tool argument struct for get_weather
type GetWeatherArgs struct {
	City string `json:"city" jsonschema:"required,description=City name"`
}

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	log := logger.New(cfg.LogLevel)
	log.Info("Configuration loaded successfully", "log_level", cfg.LogLevel, "api_key_present", cfg.OpenWeatherMapAPIKey != "")

	// Initialize weather service
	weatherService := service.NewWeatherService(cfg.OpenWeatherMapAPIKey, log)

	// Create MCP server with stdio transport
	server := mcp_golang.NewServer(stdio.NewStdioServerTransport())

	// Register get_weather tool
	err = server.RegisterTool("get_weather", "Get current weather for a city", func(args GetWeatherArgs) (*mcp_golang.ToolResponse, error) {
		if args.City == "" {
			return nil, fmt.Errorf("city is required")
		}
		ctx := context.Background()
		weatherData, err := weatherService.GetWeatherData(ctx, args.City)
		if err != nil {
			log.Error("Failed to get weather data", "error", err)
			return nil, fmt.Errorf("failed to get weather data: %w", err)
		}
		weatherJSON, err := json.MarshalIndent(weatherData, "", "  ")
		if err != nil {
			log.Error("Failed to marshal weather data", "error", err)
			return nil, fmt.Errorf("failed to marshal weather data: %w", err)
		}
		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(string(weatherJSON))), nil
	})
	if err != nil {
		log.Error("Failed to register get_weather tool", "error", err)
		os.Exit(1)
	}

	// Start server in a goroutine
	go func() {
		log.Info("Starting MCP Weather Server on stdio")
		if err := server.Serve(); err != nil {
			log.Error("MCP server failed to start", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down MCP server...")
	log.Info("MCP server exited")
}
