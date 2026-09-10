import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { DeliveryController } from "./deliveries.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { DeliveryService } from "./deliveries.service.js";
import { DeliveryProcessor } from "./delivery.processor.js";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "event-queue",
    }),
    DatabaseModule
  ],
  controllers: [DeliveryController],
  providers: [AuthService, DeliveryService, DeliveryProcessor],
})
export class DeliveryModule {}
