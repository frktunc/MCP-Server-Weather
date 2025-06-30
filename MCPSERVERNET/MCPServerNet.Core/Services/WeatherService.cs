using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using MCPServerNet.Core.Models;

namespace MCPServerNet.Core.Services;

public class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WeatherService> _logger;
    private readonly string _apiKey;

    public WeatherService(HttpClient httpClient, ILogger<WeatherService> logger, string apiKey)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = apiKey;
    }

    public async Task<WeatherData> GetWeatherDataAsync(string city, CancellationToken cancellationToken = default)
    {
        var baseUrl = "https://api.openweathermap.org/data/2.5/weather";
        var queryParams = new Dictionary<string, string>
        {
            ["q"] = city,
            ["appid"] = _apiKey,
            ["units"] = "metric", // Celsius
            ["lang"] = "tr"       // Turkish language
        };

        var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var requestUrl = $"{baseUrl}?{queryString}";

        _logger.LogDebug("Weather API URL: {Url}", requestUrl);
        _logger.LogDebug("Fetching weather data for city: {City}", city);

        try
        {
            var response = await _httpClient.GetAsync(requestUrl, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(errorContent);
                
                throw new HttpRequestException(
                    $"API request failed: {errorResponse?.Message ?? response.StatusCode.ToString()}", 
                    null, 
                    response.StatusCode);
            }

            var weatherData = await response.Content.ReadFromJsonAsync<WeatherData>(
                cancellationToken: cancellationToken);

            if (weatherData == null)
            {
                throw new InvalidOperationException("Failed to deserialize weather data");
            }

            _logger.LogInformation(
                "Successfully fetched weather data for city: {City}, temperature: {Temperature}, description: {Description}",
                weatherData.Name,
                weatherData.Main.Temp,
                weatherData.Weather.FirstOrDefault()?.Description);

            return weatherData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get weather data for city: {City}", city);
            throw;
        }
    }

    private class ErrorResponse
    {
        public string Cod { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
} 