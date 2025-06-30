import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherService } from './weather.service';
import { WeatherData } from '../models/weather-data.interface';
import { RedisService } from '../../shared/redis/redis.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockWeatherData: WeatherData = {
    coord: { lon: 28.9744, lat: 41.0128 },
    main: {
      temp: 25.5,
      feels_like: 27.2,
      temp_min: 24.0,
      temp_max: 27.0,
      humidity: 65,
      pressure: 1013,
    },
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    ],
    base: 'stations',
    wind: {
      speed: 3.5,
      deg: 180,
    },
    clouds: {
      all: 0,
    },
    visibility: 10000,
    dt: 1234567890,
    sys: {
      country: 'TR',
      sunrise: 1234567800,
      sunset: 1234567900,
    },
    timezone: 10800,
    id: 745044,
    name: 'Istanbul',
    cod: 200,
  };

  const mockAxiosResponse: AxiosResponse<WeatherData> = {
    data: mockWeatherData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should throw error if API key is not provided', async () => {
      const mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
          {
            provide: HttpService,
            useValue: {
              get: jest.fn(),
            },
          },
          {
            provide: RedisService,
            useValue: {
              get: jest.fn(),
              set: jest.fn(),
            },
          },
        ],
      }).compile();

      expect(() => module.get<WeatherService>(WeatherService)).toThrow('OPENWEATHER_API_KEY is not defined in the configuration.');
    });
  });

  describe('getWeatherData', () => {
    it('should return weather data for valid city', async () => {
      // Arrange
      const inputCity = 'Istanbul';
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      // Act
      const actualResult = await service.getWeatherData(inputCity);

      // Assert
      expect(actualResult).toEqual(mockWeatherData);
      expect(httpService.get).toHaveBeenCalledWith(expect.stringContaining('q=Istanbul'));
    });

    it('should handle API errors', async () => {
      // Arrange
      const inputCity = 'InvalidCity';
      const mockError = {
        response: { status: 404 },
        message: 'Not found',
      };
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => mockError));

      // Act & Assert
      await expect(service.getWeatherData(inputCity)).rejects.toThrow('Could not fetch weather data.');
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast for valid city', async () => {
      // Arrange
      const inputCity = 'Istanbul';
      const mockForecastResponse = {
        data: {
          cod: '200',
          message: 0,
          cnt: 40,
          list: [],
          city: {
            id: 745044,
            name: 'Istanbul',
            coord: { lat: 41.0128, lon: 28.9744 },
            country: 'TR',
            population: 15462452,
            timezone: 10800,
            sunrise: 1234567800,
            sunset: 1234567900,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockForecastResponse));

      // Act
      const actualResult = await service.getWeatherForecast(inputCity);

      // Assert
      expect(actualResult).toEqual(mockForecastResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(expect.stringContaining('forecast'));
    });
  });
}); 