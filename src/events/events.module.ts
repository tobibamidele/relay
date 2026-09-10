import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { EventsService } from "./events.service.js";
import { EventsController } from "./events.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'delivery-queue',
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, AuthService],
})
export class EventsModule {};
