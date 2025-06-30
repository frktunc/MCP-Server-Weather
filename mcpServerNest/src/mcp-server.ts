#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { WeatherModule } from './weather/weather.module';
import { McpWeatherToolService } from './weather/mcp/mcp-weather-tool.service';
import { WeatherService } from './weather/services/weather.service';
import { RedisService } from './shared/redis/redis.service';
import { Logger } from '@nestjs/common';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

async function bootstrap() {
  const logger = new Logger('MCPServer');
  
  try {
    logger.log('MCP Weather Server başlatılıyor...');
    
    // NestJS application context oluştur
    const appContext = await NestFactory.createApplicationContext(WeatherModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });
    
    logger.log('NestJS application context oluşturuldu');
    
    // Services'leri al
    const redisService = appContext.get(RedisService);
    const toolService = appContext.get(McpWeatherToolService);
    
    logger.log('Services başarıyla alındı');
    
    // Redis'i başlat
    try {
      await redisService.onModuleInit();
      logger.log('Redis service başlatıldı');
    } catch (error) {
      logger.warn('Redis başlatılamadı, cache olmadan devam ediliyor:', error.message);
    }

    // MCP Server oluştur
    const mcpServer = new Server(
      {
        name: 'mcp-weather-server-nest',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Tools listesi handler'ı
    mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.log('Tools listesi istendi');
      return {
        tools: [
          {
            name: 'get_weather',
            description: 'Gets the current weather for a given city.',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: 'The city to get the weather for, e.g., "Istanbul"'
                }
              },
              required: ['city']
            }
          },
          {
            name: 'get_weather_forecast',
            description: 'Gets the 5-day weather forecast for a given city.',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: 'The city to get the weather forecast for, e.g., "London"'
                }
              },
              required: ['city']
            }
          },
          {
            name: 'compare_weather',
            description: 'Compares the current weather between two cities.',
            inputSchema: {
              type: 'object',
              properties: {
                city1: {
                  type: 'string',
                  description: 'The first city for comparison, e.g., "Ankara"'
                },
                city2: {
                  type: 'string',
                  description: 'The second city for comparison, e.g., "Izmir"'
                }
              },
              required: ['city1', 'city2']
            }
          }
        ]
      };
    });

    // Tool çağrısı handler'ı
    mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.log(`Tool çağrısı: ${name}`, args);
      
      try {
        let result;
        
        switch (name) {
          case 'get_weather':
            result = await toolService.getWeather(args);
            break;
          case 'get_weather_forecast':
            result = await toolService.getWeatherForecast(args);
            break;
          case 'compare_weather':
            result = await toolService.compareWeather(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        logger.log(`Tool ${name} başarıyla çalıştırıldı`);
        
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      } catch (error) {
        logger.error(`Tool ${name} hatası:`, error.message);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });

    // Transport oluştur ve bağlan
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    
    logger.log('MCP Server başarıyla başlatıldı ve transport\'a bağlandı');

    // Graceful shutdown
    const shutdown = async () => {
      logger.log('Shutdown sinyali alındı, kapatılıyor...');
      try {
        await redisService.onModuleDestroy();
        await appContext.close();
        logger.log('MCP Server başarıyla kapatıldı');
        process.exit(0);
      } catch (error) {
        logger.error('Shutdown sırasında hata:', error.message);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGQUIT', shutdown);

    // Server'ı çalışır durumda tut
    await new Promise(() => {});
  } catch (error) {
    logger.error('MCP Server başlatma hatası:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap hatası:', error);
  process.exit(1);
});
