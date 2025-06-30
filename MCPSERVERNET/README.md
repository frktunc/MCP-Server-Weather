# MCP Weather Server (.NET)

Gerçek zamanlı hava durumu verisine dayalı bir MCP (Model Context Protocol) sunucusu. Bu sunucu, istemciden gelen şehir bilgisine göre OpenWeatherMap API üzerinden hava durumunu çeker ve MCP protokolü üzerinden yanıtlar üretir.

## Özellikler

- 🌤️ OpenWeatherMap API entegrasyonu
- 🔄 Gerçek zamanlı hava durumu verisi
- 📝 Yapılandırılabilir loglama
- 🛡️ Güvenli API anahtarı yönetimi
- 📦 Temiz mimari, arayüz odaklı servisler
- 🚀 .NET 9.0 ile modern C# geliştirme

## Proje Yapısı 3.37 , 2,88
                2,16 ,  2,57
                3.06 , 1,69
                2,04 ,  2.17

```
MCPSERVERNET/
├── MCPServerNet.Console/
│   ├── Program.cs                 # Ana uygulama giriş noktası (MCP server)
│   └── MCPServerNet.Console.csproj
├── MCPServerNet.Core/
│   ├── Models/
│   │   ├── WeatherData.cs         # Hava durumu veri modelleri
│   │   └── Configuration.cs       # Konfigürasyon modeli
│   ├── Services/
│   │   ├── IWeatherService.cs     # Hava durumu servisi arayüzü
│   │   ├── WeatherService.cs      # Hava durumu servisi implementasyonu
│   │   └── ConfigurationService.cs # Konfigürasyon servisi
│   └── MCPServerNet.Core.csproj
├── MCPServerNet.sln
└── README.md
```

## Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   dotnet restore
   ```

2. **OpenWeatherMap API anahtarını alın:**
   - [OpenWeatherMap](https://openweathermap.org/api) sitesine gidin
   - Ücretsiz hesap oluşturun
   - "API keys" bölümünden API anahtarınızı alın
   - **Not:** API anahtarının aktif olması 2-3 saat sürebilir

3. **Ortam değişkenlerini ayarlayın:**
   ```bash
   export OWM_API_KEY="your_api_key_here"
   export LOG_LEVEL="info"  # Opsiyonel, varsayılan: info
   ```

## Çalıştırma

```bash
dotnet run --project MCPServerNet.Console
```

Sunucu, MCP protokolü üzerinden stdio (standart giriş/çıkış) ile çalışır. Herhangi bir HTTP endpoint açmaz.

## MCP Protokolü ile Kullanım

Sunucu, `get_weather` adında bir tool sağlar. MCP uyumlu bir istemci ile aşağıdaki gibi sorgu gönderebilirsiniz:

**İstek Örneği:**
```json
{
  "name": "get_weather",
  "arguments": {
    "city": "Istanbul"
  }
}
```

**Yanıt Örneği:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"main\": { ... }, ... }"
    }
  ]
}
```

Yanıt, OpenWeatherMap API'den alınan ham hava durumu verisinin JSON formatında döndürülmüş halidir.



## Konfigürasyon

| Ortam Değişkeni | Açıklama | Varsayılan |
|----------------|----------|------------|
| `OWM_API_KEY` | OpenWeatherMap API anahtarı | Gerekli |
| `LOG_LEVEL` | Log seviyesi (debug, info, warn, error) | info |

## Geliştirme

### Test Çalıştırma
```bash
dotnet test
```

### Build
```bash
dotnet build
```

### Release Build
```bash
dotnet publish -c Release -o bin/Release
```

## Teknolojiler

- **.NET 9.0** - Programlama platformu
- **C#** - Programlama dili
- **ModelContextProtocol** - MCP SDK
- **OpenWeatherMap API** - Hava durumu verisi
- **Microsoft.Extensions** - Dependency Injection, Configuration, Logging
- **Structured Logging** - JSON formatında loglama

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 

export OWM_API_KEY="" && npx @modelcontextprotocol/inspector dotnet run --project MCPServerNet.Console