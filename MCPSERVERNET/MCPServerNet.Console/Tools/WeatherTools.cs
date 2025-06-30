using ModelContextProtocol;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json;
using MCPServerNet.Core.Services;

namespace MCPServerNet.Console.Tools;

[McpServerToolType]
public sealed class WeatherTools
{
    [McpServerTool, Description("Get current weather for a city using OpenWeatherMap API.")]
    public static async Task<string> GetWeather(
        IWeatherService weatherService,
        [Description("The city name to get weather for (e.g. Istanbul, London, New York).")] string city)
    {
        if (string.IsNullOrEmpty(city))
        {
            throw new ArgumentException("City parameter is required");
        }

        var weatherData = await weatherService.GetWeatherDataAsync(city);
        var weatherJson = JsonSerializer.Serialize(weatherData, new JsonSerializerOptions { WriteIndented = true });
        
        return weatherJson;
    }
} 