import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor('event-queue')
export class EventProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-event': {
        const { to, data } = job.data;
        console.log("[WORKER] Sending delivery to: ", to);

        return { delivered: true }
      }

      default:
        throw new Error(`Unknown job name: ${job.name}`)
    }
  }
}
