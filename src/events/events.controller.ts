import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import { EventsService } from "./events.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { CreateEventDto } from "./dto/create-event-dto.js";
import { GetEventsDto } from "./dto/get-events-dto.js";
import { InjectQueue } from "@nestjs/bullmq";

@UseGuards(AuthGuard)
@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  async listEvents(@Req() request: AuthenticatedRequest, @Query() query: GetEventsDto) {
    return { 
      data: await this.eventsService.findAll(request.project.id, query) 
    }
  }

  @Get(":eventId")
  async listEventByID(@Req() request: AuthenticatedRequest, @Param("eventId") id: string) {
    return this.eventsService.getEventByID(id, request.project.id)
  }


  @Post()
  async createEvent(
    @Req() request: AuthenticatedRequest, 
    @Body() body: CreateEventDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return await this.eventsService.createEvent(
      request.project.id,
      body.type,
      body.data,
      idempotencyKey,
    );
  }
}
