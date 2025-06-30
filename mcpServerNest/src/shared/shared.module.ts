import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { createWinstonConfig } from './config/winston.config';
import { RedisModule } from './redis/redis.module';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    WinstonModule.forRoot(createWinstonConfig()),
    RedisModule,
  ],
  exports: [ConfigModule, HttpModule, WinstonModule, RedisModule],
})
export class SharedModule {} 