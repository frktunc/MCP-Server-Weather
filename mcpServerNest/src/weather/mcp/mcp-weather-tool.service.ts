import { Injectable, Scope } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';

@Injectable({ scope: Scope.DEFAULT })
export class McpWeatherToolService {
  constructor(private readonly weatherService: WeatherService) {}

  async getWeather(input: { city: string }): Promise<string> {
    try {
      const weatherData = await this.weatherService.getWeatherData(input.city);
      return `Current weather in ${weatherData.name}: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C`;
    } catch (error) {
      return `An error occurred: ${error.message}`;
    }
  }

  async getWeatherForecast(input: { city: string }): Promise<string> {
    try {
      const forecastData = await this.weatherService.getWeatherForecast(
        input.city,
      );

      // Group forecasts by day
      const dailyForecasts: { [key: string]: any[] } = {};
      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
      });

      let forecastSummary = `5-Day Weather Forecast for ${forecastData.city.name}:\n`;

      for (const date in dailyForecasts) {
        const dayItems = dailyForecasts[date];
        const dayName = new Date(date).toLocaleDateString('tr-TR', {
          weekday: 'long',
        });
        const avgTemp =
          dayItems.reduce((sum, item) => sum + item.main.temp, 0) /
          dayItems.length;
        const descriptions = [
          ...new Set(dayItems.map((item) => item.weather[0].description)),
        ];

        forecastSummary += `- ${dayName} (${date}):\n`;
        forecastSummary += `  - Ortalama Sıcaklık: ${avgTemp.toFixed(2)}°C\n`;
        forecastSummary += `  - Durum: ${descriptions.join(', ')}\n`;
      }

      return forecastSummary;
    } catch (error) {
      return `An error occurred while fetching the forecast: ${error.message}`;
    }
  }

  async compareWeather(input: {
    city1: string;
    city2: string;
  }): Promise<string> {
    //deneme
    try {
      const [weather1, weather2] = await Promise.all([
        this.weatherService.getWeatherData(input.city1),
        this.weatherService.getWeatherData(input.city2),
        
      ]);

      let comparison = `Weather Comparison between ${weather1.name} and ${weather2.name}:\n\n`;

      // Temperature
      const tempDiff = weather1.main.temp - weather2.main.temp;
      if (tempDiff > 0) {
        comparison += `- ${weather1.name} is ${tempDiff.toFixed(
          2,
        )}°C warmer than ${weather2.name}.\n`;
      } else if (tempDiff < 0) {
        comparison += `- ${weather2.name} is ${(-tempDiff).toFixed(
          2,
        )}°C warmer than ${weather1.name}.\n`;
      } else {
        comparison += `- Both cities have the same temperature.\n`;
      }
      comparison += `  - ${weather1.name}: ${weather1.main.temp}°C (${weather1.weather[0].description})\n`;
      comparison += `  - ${weather2.name}: ${weather2.main.temp}°C (${weather2.weather[0].description})\n\n`;

      // Wind
      const windDiff = weather1.wind.speed - weather2.wind.speed;
      if (windDiff > 0) {
        comparison += `- ${weather1.name} is windier than ${weather2.name}.\n`;
      } else if (windDiff < 0) {
        comparison += `- ${weather2.name} is windier than ${weather1.name}.\n`;
      } else {
        comparison += `- Both cities have the same wind speed.\n`;
      }
      comparison += `  - ${weather1.name}: ${weather1.wind.speed} m/s\n`;
      comparison += `  - ${weather2.name}: ${weather2.wind.speed} m/s\n\n`;
      
      // Humidity
      const humidityDiff = weather1.main.humidity - weather2.main.humidity;
       if (humidityDiff > 0) {
        comparison += `- ${weather1.name} is more humid than ${weather2.name}.\n`;
      } else if (humidityDiff < 0) {
        comparison += `- ${weather2.name} is more humid than ${weather1.name}.\n`;
      } else {
        comparison += `- Both cities have the same humidity level.\n`;
      }
      comparison += `  - ${weather1.name}: ${weather1.main.humidity}%\n`;
      comparison += `  - ${weather2.name}: ${weather2.main.humidity}%\n`;

      return comparison;
    } catch (error) {
      return `An error occurred during comparison: ${error.message}`;
    }
  }
} 