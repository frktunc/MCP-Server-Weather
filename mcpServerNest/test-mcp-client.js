#!/usr/bin/env node

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testMcpServer() {
  console.log('🚀 MCP Weather Server Test Başlatılıyor...\n');

  let client = null;
  
  try {
    // MCP Server'ı başlatmak için gerekli command ve args
    const serverCommand = 'node';
    const serverArgs = ['dist/mcp-server.js'];
    
    console.log('📡 MCP Server\'a bağlanılıyor...');
    
    // MCP Client oluştur
    const transport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs,
    });
    
    client = new Client({
      name: 'mcp-weather-test-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    // Timeout ile bağlantı
    const connectionPromise = client.connect(transport);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ MCP Client başarıyla bağlandı\n');

    // Mevcut araçları listele
    console.log('📋 Mevcut araçlar listeleniyor...');
    const tools = await client.listTools();
    console.log('✅ Mevcut araçlar:', tools.tools.map(t => t.name));
    console.log('');

    // Test 1: Anlık hava durumu
    console.log('🌤️ Test 1: Anlık hava durumu (Istanbul)');
    try {
      const weatherResult = await client.callTool({
        name: 'get_weather',
        arguments: { city: 'Istanbul' }
      });
      console.log('✅ Sonuç:', weatherResult.content[0].text);
    } catch (error) {
      console.log('❌ Hata:', error.message);
      if (error.data) {
        console.log('Hata detayı:', error.data);
      }
    }
    console.log('');

    // Test 2: Hava durumu tahmini
    console.log('📅 Test 2: 5 günlük tahmin (Ankara)');
    try {
      const forecastResult = await client.callTool({
        name: 'get_weather_forecast',
        arguments: { city: 'Ankara' }
      });
      console.log('✅ Sonuç:', forecastResult.content[0].text);
    } catch (error) {
      console.log('❌ Hata:', error.message);
      if (error.data) {
        console.log('Hata detayı:', error.data);
      }
    }
    console.log('');

    // Test 3: Şehir karşılaştırması
    console.log('⚖️ Test 3: Şehir karşılaştırması (Istanbul vs Ankara)');
    try {
      const compareResult = await client.callTool({
        name: 'compare_weather',
        arguments: { city1: 'Istanbul', city2: 'Ankara' }
      });
      console.log('✅ Sonuç:', compareResult.content[0].text);
    } catch (error) {
      console.log('❌ Hata:', error.message);
      if (error.data) {
        console.log('Hata detayı:', error.data);
      }
    }
    console.log('');

    console.log('🎉 Tüm testler tamamlandı!');

  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
    
    if (error.code) {
      console.error('Hata kodu:', error.code);
    }
    
    if (error.message.includes('Connection closed')) {
      console.error('💡 Öneriler:');
      console.error('1. OpenWeatherMap API key\'inizi .env dosyasında OWM_API_KEY olarak ayarlayın');
      console.error('2. Redis server\'ın çalıştığından emin olun (opsiyonel)');
      console.error('3. npm run build:mcp komutunu çalıştırdığınızdan emin olun');
    }
  } finally {
    // Client'ı temizle
    if (client) {
      try {
        await client.close();
        console.log('🔌 MCP Client bağlantısı kapatıldı');
      } catch (error) {
        console.log('Client kapatma hatası:', error.message);
      }
    }
    
    // 2 saniye bekle ve çık
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
}

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

testMcpServer().catch(console.error);
