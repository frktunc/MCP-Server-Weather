using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using MCPServerNet.Core.Models;
using MCPServerNet.Core.Services;
using MCPServerNet.Console.Tools;
using System.Text.Json;

var builder = Host.CreateApplicationBuilder(args);

// Configuration
builder.Configuration.AddEnvironmentVariables();

// Services
builder.Services.AddHttpClient();
builder.Services.AddSingleton<ConfigurationService>();
builder.Services.AddSingleton<IWeatherService>(provider =>
{
    var configService = provider.GetRequiredService<ConfigurationService>();
    var config = configService.Load();
    var httpClient = provider.GetRequiredService<HttpClient>();
    var logger = provider.GetRequiredService<ILogger<WeatherService>>();
    
    return new WeatherService(httpClient, logger, config.OpenWeatherMapApiKey);
});

// MCP Server
builder.Services.AddMcpServer()
    .WithStdioServerTransport()
    .WithTools<WeatherTools>();

var host = builder.Build();

// Load configuration
var configService = host.Services.GetRequiredService<ConfigurationService>();
var config = configService.Load();

var logger = host.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Configuration loaded successfully. Log level: {LogLevel}, API key present: {ApiKeyPresent}", 
    config.LogLevel, !string.IsNullOrEmpty(config.OpenWeatherMapApiKey));

// Start MCP Server
logger.LogInformation("Starting MCP Weather Server on stdio");

try
{
    await host.RunAsync();
}
catch (Exception ex)
{
    logger.LogError(ex, "MCP server failed to start");
    return 1;
}

logger.LogInformation("MCP server exited");
return 0;
