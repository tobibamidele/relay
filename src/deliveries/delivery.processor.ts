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
        const { eventId, type, endpointIds, endpoints, data } = job.data;
        console.log(`[WORKER] eventId => ${eventId}, endpointId => ${endpointIds}, data => ${JSON.stringify(data)}`)
        this.deliveryService.processDeliveries(job.data);
        

        return { delivered: true }
      }

      default:
        throw new Error(`Unknown job name: ${job.name}`)
    }
  }
}
