import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { createWinstonConfig } from '../shared/config/winston.config';
import { RedisModule } from '../shared/redis/redis.module';
import { WinstonModule } from 'nest-winston';
import { WeatherService } from './services/weather.service';
import { McpWeatherToolService } from './mcp/mcp-weather-tool.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    WinstonModule.forRoot(createWinstonConfig()),
    RedisModule,
  ],
  providers: [WeatherService, McpWeatherToolService],
  exports: [WeatherService, McpWeatherToolService],
})
export class WeatherModule {}
