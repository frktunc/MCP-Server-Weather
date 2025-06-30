using System.Text.Json.Serialization;

namespace MCPServerNet.Core.Models;

public class WeatherData
{
    [JsonPropertyName("main")]
    public MainInfo Main { get; set; } = new();

    [JsonPropertyName("weather")]
    public List<WeatherInfo> Weather { get; set; } = new();

    [JsonPropertyName("wind")]
    public WindInfo Wind { get; set; } = new();

    [JsonPropertyName("clouds")]
    public CloudsInfo Clouds { get; set; } = new();

    [JsonPropertyName("rain")]
    public RainInfo? Rain { get; set; }

    [JsonPropertyName("snow")]
    public SnowInfo? Snow { get; set; }

    [JsonPropertyName("visibility")]
    public int Visibility { get; set; }

    [JsonPropertyName("dt")]
    public long Dt { get; set; }

    [JsonPropertyName("sys")]
    public SysInfo Sys { get; set; } = new();

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class MainInfo
{
    [JsonPropertyName("temp")]
    public double Temp { get; set; }

    [JsonPropertyName("feels_like")]
    public double FeelsLike { get; set; }

    [JsonPropertyName("humidity")]
    public int Humidity { get; set; }

    [JsonPropertyName("pressure")]
    public int Pressure { get; set; }
}

public class WeatherInfo
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("main")]
    public string Main { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("icon")]
    public string Icon { get; set; } = string.Empty;
}

public class WindInfo
{
    [JsonPropertyName("speed")]
    public double Speed { get; set; }

    [JsonPropertyName("deg")]
    public int Deg { get; set; }
}

public class CloudsInfo
{
    [JsonPropertyName("all")]
    public int All { get; set; }
}

public class RainInfo
{
    [JsonPropertyName("1h")]
    public double OneHour { get; set; }
}

public class SnowInfo
{
    [JsonPropertyName("1h")]
    public double OneHour { get; set; }
}

public class SysInfo
{
    [JsonPropertyName("sunrise")]
    public long Sunrise { get; set; }

    [JsonPropertyName("sunset")]
    public long Sunset { get; set; }
} 