import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ConfigModule } from '@nestjs/config';
import { EndpointsModule } from './endpoints/endpoints.module.js';
import { APIKeysModule } from './api-keys/api-key.module.js';
import { EventsModule } from './events/events.module.js';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    BullModule.forRoot({
      connection: {
        url: "redis://default:default@localhost:6379",
      }
    }),
    ProjectsModule,
    EndpointsModule,
    APIKeysModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
