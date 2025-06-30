using MCPServerNet.Core.Models;

namespace MCPServerNet.Core.Services;

public interface IWeatherService
{
    Task<WeatherData> GetWeatherDataAsync(string city, CancellationToken cancellationToken = default);
} 