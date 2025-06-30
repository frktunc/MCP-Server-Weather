import { NestFactory } from '@nestjs/core';
import { WeatherModule } from './weather/weather.module';
import { WeatherService } from './weather/services/weather.service';

async function testDI() {
  const appContext = await NestFactory.createApplicationContext(WeatherModule);
  const weatherService = appContext.get(WeatherService);
  console.log('WeatherService instance:', !!weatherService);
  await appContext.close();
}

testDI().catch(console.error); 