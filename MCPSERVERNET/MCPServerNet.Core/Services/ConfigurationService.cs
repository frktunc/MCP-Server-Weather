using Microsoft.Extensions.Configuration;
using MCPServerNet.Core.Models;

namespace MCPServerNet.Core.Services;

public class ConfigurationService
{
    private readonly IConfiguration _configuration;

    public ConfigurationService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Configuration Load()
    {
        var config = new Configuration
        {
            Port = _configuration.GetValue<int>("PORT", 8080),
            LogLevel = _configuration.GetValue<string>("LOG_LEVEL", "info") ?? "info",
            OpenWeatherMapApiKey = _configuration.GetValue<string>("OWM_API_KEY") ?? string.Empty
        };

        if (string.IsNullOrEmpty(config.OpenWeatherMapApiKey))
        {
            throw new InvalidOperationException("OWM_API_KEY environment variable is required");
        }

        return config;
    }
} 