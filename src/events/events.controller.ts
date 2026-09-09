import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import { EventsService } from "./events.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

@UseGuards(AuthGuard)
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listEvents(@Req() request: AuthenticatedRequest) {
    return { 
      data: await this.eventsService.getEventsByProjectID(request.project.id) 
    }
  }
}
