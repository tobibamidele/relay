import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SendDeliveryDto } from "./dto/send-delivery-dto.js";
import { DeliveryService } from "./deliveries.service.js";

@Processor('delivery-queue')
export class DeliveryProcessor extends WorkerHost {
  constructor(private readonly deliveryService: DeliveryService){
    super();
  }

  async process(job: Job<SendDeliveryDto, any, string>): Promise<any> {
    switch(job.name) {
      case 'send-event': {
const delivered = await this.deliveryService.processDeliveries(job.data);
        return { delivered }
      }

      default:
        throw new Error(`Unknown job name: ${job.name}`)
    }
  }
}
