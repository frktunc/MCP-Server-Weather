import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import {
  WeatherData,
  ForecastResponse,
} from '../models/weather-data.interface';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable({ scope: Scope.DEFAULT })
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {
    this.logger.log('WeatherService constructor başlatılıyor...');
    
    // API key'i al - birden fazla environment variable'ı dene
    this.apiKey = this.configService?.get<string>('OWM_API_KEY') || 
                  this.configService?.get<string>('OPENWEATHER_API_KEY') ||
                  process.env.OWM_API_KEY ||
                  process.env.OPENWEATHER_API_KEY;
    
    if (!this.apiKey) {
      this.logger.error('OpenWeatherMap API key bulunamadı. Lütfen OWM_API_KEY veya OPENWEATHER_API_KEY environment variable\'ını ayarlayın.');
      // API key olmadan da çalışmaya devam et, sadece uyarı ver
    } else {
      this.logger.log('WeatherService başarıyla başlatıldı - API key mevcut');
    }
  }

  async getWeatherData(city: string): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is not configured. Please set OWM_API_KEY environment variable.');
    }

    const cacheKey = `weather:${city}`;
    
    try {
      // Cache'den veri almayı dene
      const cachedData = await this.redisService.get<WeatherData>(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for weather:${city}`);
        return cachedData;
      }
    } catch (error) {
      this.logger.warn(
        `Could not retrieve from cache for ${city}: ${(error as Error).message}`,
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=tr`;

    try {
      this.logger.log(`Fetching weather data for ${city} from API`);
      
      const response = await firstValueFrom(
        this.httpService.get<WeatherData>(url).pipe(
          catchError((error) => {
            this.logger.error(
              `API Error for ${city}: ${error.response?.data?.message || error.message}`,
            );
            return throwError(() => new Error(`Could not fetch weather data for ${city}.`));
          }),
        ),
      );
      
      const weatherData = response.data;
      
      // Cache'e kaydet
      try {
        await this.redisService.set(cacheKey, weatherData, 300); // 5 dakika cache
        this.logger.log(`Weather data cached for ${city}`);
      } catch (error) {
        this.logger.warn(
          `Could not save to cache for ${city}: ${(error as Error).message}`,
        );
      }
      
      return weatherData;
    } catch (error) {
      this.logger.error(`Failed to get weather data for ${city}: ${error.message}`);
      throw error;
    }
  }

  async getWeatherForecast(city: string): Promise<ForecastResponse> {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is not configured. Please set OWM_API_KEY environment variable.');
    }

    const cacheKey = `forecast:${city}`;
    
    try {
      // Cache'den veri almayı dene
      const cachedData = await this.redisService.get<ForecastResponse>(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for forecast:${city}`);
        return cachedData;
      }
    } catch (error) {
      this.logger.warn(
        `Could not retrieve from cache for ${city}: ${(error as Error).message}`,
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=tr`;

    try {
      this.logger.log(`Fetching weather forecast for ${city} from API`);
      
      const response = await firstValueFrom(
        this.httpService.get<ForecastResponse>(url).pipe(
          catchError((error) => {
            this.logger.error(
              `API Error for forecast ${city}: ${error.response?.data?.message || error.message}`,
            );
            return throwError(() => new Error(`Could not fetch weather forecast for ${city}.`));
          }),
        ),
      );

      const forecastData = response.data;

      // Cache'e kaydet
      try {
        await this.redisService.set(cacheKey, forecastData, 900); // 15 dakika cache
        this.logger.log(`Forecast data cached for ${city}`);
      } catch (error) {
        this.logger.warn(
          `Could not save to cache for ${city}: ${(error as Error).message}`,
        );
      }

      return forecastData;
    } catch (error) {
      this.logger.error(`Failed to get weather forecast for ${city}: ${error.message}`);
      throw error;
    }
  }
} 