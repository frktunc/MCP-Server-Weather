# MCP Weather Server - NestJS

Bu proje, Model Context Protocol (MCP) kullanarak hava durumu verilerini sağlayan bir NestJS sunucusudur.

## 🚀 Özellikler

- **Anlık Hava Durumu**: Belirtilen şehir için güncel hava durumu bilgileri
- **5 Günlük Tahmin**: Belirtilen şehir için 5 günlük hava durumu tahmini
- **Şehir Karşılaştırması**: İki şehir arasında hava durumu karşılaştırması
- **Redis Cache**: Performans için Redis cache desteği
- **MCP Protocol**: Model Context Protocol ile uyumlu

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- OpenWeatherMap API key
- Redis (opsiyonel, cache için)

## 🛠️ Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd mcpServerNest
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment variables ayarlayın:**
`.env` dosyası oluşturun:
```env
# OpenWeatherMap API Key (zorunlu)
OWM_API_KEY=your_openweathermap_api_key_here

# Redis Configuration (opsiyonel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=info
```

4. **OpenWeatherMap API Key alın:**
- [OpenWeatherMap](https://openweathermap.org/api) sitesine gidin
- Ücretsiz hesap oluşturun
- API key alın
- `.env` dosyasına `OWM_API_KEY` olarak ekleyin

## 🏗️ Build

MCP server'ı build etmek için:
```bash
npm run build:mcp
```

## 🧪 Test

MCP server'ı test etmek için:
```bash
npm run test:mcp
```

## 📖 Kullanım

### MCP Tools

Server aşağıdaki MCP tools'ları sağlar:

#### 1. get_weather
Anlık hava durumu bilgilerini getirir.

**Parametreler:**
- `city` (string): Şehir adı (örn: "Istanbul")

**Örnek:**
```json
{
  "name": "get_weather",
  "arguments": {
    "city": "Istanbul"
  }
}
```

#### 2. get_weather_forecast
5 günlük hava durumu tahminini getirir.

**Parametreler:**
- `city` (string): Şehir adı (örn: "Ankara")

**Örnek:**
```json
{
  "name": "get_weather_forecast",
  "arguments": {
    "city": "Ankara"
  }
}
```

#### 3. compare_weather
İki şehir arasında hava durumu karşılaştırması yapar.

**Parametreler:**
- `city1` (string): İlk şehir adı
- `city2` (string): İkinci şehir adı

**Örnek:**
```json
{
  "name": "compare_weather",
  "arguments": {
    "city1": "Istanbul",
    "city2": "Ankara"
  }
}
```

## 🏗️ Proje Yapısı

```
src/
├── mcp-server.ts              # MCP Server ana dosyası
├── weather/
│   ├── weather.module.ts      # Weather modülü
│   ├── services/
│   │   └── weather.service.ts # Hava durumu servisi
│   ├── mcp/
│   │   └── mcp-weather-tool.service.ts # MCP tool servisi
│   ├── models/
│   │   └── weather-data.interface.ts # Veri modelleri
│   └── dto/
│       └── mcp-tool-request.dto.ts # DTO'lar
└── shared/
    ├── redis/
    │   ├── redis.module.ts    # Redis modülü
    │   └── redis.service.ts   # Redis servisi
    └── config/
        └── winston.config.ts  # Winston logger konfigürasyonu
```

## 🔧 Geliştirme

### Scripts

- `npm run build:mcp`: MCP server'ı build eder
- `npm run test:mcp`: MCP server'ı test eder
- `npm run start:mcp`: Production'da MCP server'ı çalıştırır
- `npm run start:mcp:dev`: Development modunda MCP server'ı çalıştırır

### Logging

Proje Winston logger kullanır. Log seviyesini `.env` dosyasında `LOG_LEVEL` ile ayarlayabilirsiniz.

### Cache

Redis cache kullanımı opsiyoneldir. Redis bağlantısı başarısız olursa, uygulama cache olmadan çalışmaya devam eder.

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **"OpenWeatherMap API key is not defined"**
   - `.env` dosyasında `OWM_API_KEY` değerini kontrol edin
   - API key'in geçerli olduğundan emin olun

2. **"Connection closed"**
   - `npm run build:mcp` komutunu çalıştırdığınızdan emin olun
   - Redis server'ın çalıştığını kontrol edin (opsiyonel)

3. **"Cannot read properties of undefined"**
   - NestJS dependency injection sorunu
   - Modüllerin doğru import edildiğini kontrol edin

### Debug

Debug modunda çalıştırmak için:
```bash
npm run start:mcp:dev
```


MIT License
