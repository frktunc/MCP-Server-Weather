namespace MCPServerNet.Core.Models;

public class Configuration
{
    public int Port { get; set; } = 8080;
    public string LogLevel { get; set; } = "info";
    public string OpenWeatherMapApiKey { get; set; } = string.Empty;
} 