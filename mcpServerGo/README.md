# MCP Weather Server

Gerçek zamanlı hava durumu verisine dayalı bir MCP (Model Context Protocol) sunucusu. Bu sunucu, istemciden gelen şehir bilgisine göre OpenWeatherMap API üzerinden hava durumunu çeker ve MCP protokolü üzerinden yanıtlar üretir.

## Özellikler

- 🌤️ OpenWeatherMap API entegrasyonu
- 🔄 Gerçek zamanlı hava durumu verisi
- 📝 Yapılandırılabilir loglama
- 🛡️ Güvenli API anahtarı yönetimi
- 📦 Temiz mimari, arayüz odaklı servisler
- 📈 OpenTelemetry ile gözlemlenebilirlik (isteğe bağlı)

## Proje Yapısı

```
mcp-weather-server/
├── cmd/
│   └── server/
│       └── main.go              # Ana uygulama giriş noktası (MCP server)
├── internal/
│   ├── config/
│   │   └── config.go            # Konfigürasyon yönetimi
│   ├── models/
│   │   └── models.go            # Veri modelleri
│   └── service/
│       └── weather_service.go   # Hava durumu servisi
├── pkg/
│   └── logger/
│       └── logger.go            # Loglama paketi
├── go.mod                       # Go modül dosyası
└── README.md                    # Bu dosya
```

## Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   go mod tidy
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
go run cmd/server/main.go
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

## Test Etme

Bir MCP istemcisi ile stdio üzerinden test edebilirsiniz. (Örnek istemci için [mcp-golang örneklerine](https://github.com/metoro-io/mcp-golang) bakabilirsiniz.)

## Konfigürasyon

| Ortam Değişkeni | Açıklama | Varsayılan |
|----------------|----------|------------|
| `OWM_API_KEY` | OpenWeatherMap API anahtarı | Gerekli |
| `LOG_LEVEL` | Log seviyesi (debug, info, warn, error) | info |

## Geliştirme

### Test Çalıştırma
```bash
go test ./...
```

### Linting
```bash
golangci-lint run
```

### Build
```bash
go build -o bin/server cmd/server/main.go
```

## Teknolojiler

- **Go 1.21+** - Programlama dili
- **OpenTelemetry** - Observability (isteğe bağlı)
- **OpenWeatherMap API** - Hava durumu verisi
- **Structured Logging** - JSON formatında loglama
- **MCP Protocol** - Model Context Protocol ile iletişim

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 

CLIENT_PORT=6280 SERVER_PORT=6281 npx @modelcontextprotocol/inspector ./mcp-weather-server
