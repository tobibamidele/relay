import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { GetDeliveriesDto } from "./dto/get-deliveries-dto.js";
import { SendDeliveryDto, SendDeliveryEndpointType } from "./dto/send-delivery-dto.js";
import { and, desc, eq, type SQL } from "drizzle-orm";

type DeliveryRow = typeof schema.deliveries.$inferSelect;

const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import("drizzle-orm/better-sqlite3").drizzle<typeof schema>>,
  ) {}

  async getDeliveryByID(id: string, projectId: string) {
    return this.db.query.deliveries.findFirst({
      where: and(
        eq(schema.deliveries.id, id),
        eq(schema.deliveries.projectId, projectId),
      ),
      columns: {
        projectId: false,
      },
    });
  }

  async getDeliveryByEventIdAndEndpointId(eventId: string, endpointId: string) {
    return this.db.query.deliveries.findFirst({
      where: and(
        eq(schema.deliveries.eventId, eventId),
        eq(schema.deliveries.endpointId, endpointId),
      ),
    });
  }

  async findAll(projectId: string, query: GetDeliveriesDto) {
    const conditions: SQL[] = [eq(schema.deliveries.projectId, projectId)];

    if (query.status) {
      conditions.push(eq(schema.deliveries.status, query.status));
    }

    if (query.eventId) {
      conditions.push(eq(schema.deliveries.eventId, query.eventId));
    }

    if (query.endpointId) {
      conditions.push(eq(schema.deliveries.endpointId, query.endpointId));
    }

    return this.db
      .select()
      .from(schema.deliveries)
      .where(and(...conditions))
      .orderBy(desc(schema.deliveries.createdAt), desc(schema.deliveries.id));
  }

  async processDeliveries(data: SendDeliveryDto): Promise<boolean> {
    if (data.endpoints.length === 0) {
      return true;
    }

    const now = new Date().toISOString();
    const existingDeliveries = await this.db.query.deliveries.findMany({
      where: and(
        eq(schema.deliveries.eventId, data.eventId),
        eq(schema.deliveries.projectId, data.projectId),
      ),
    });
    const deliveriesByEndpointId = new Map(
      existingDeliveries.map((delivery) => [delivery.endpointId, delivery] as const),
    );

    const results = await Promise.allSettled(
      data.endpoints.map((endpoint) =>
        this.deliverToEndpoint(endpoint, data, deliveriesByEndpointId.get(endpoint.id), now),
      ),
    );

    return results.every((result) => result.status === "fulfilled" && result.value);
  }

  private async deliverToEndpoint(
    endpoint: SendDeliveryEndpointType,
    data: SendDeliveryDto,
    existing: DeliveryRow | undefined,
    now: string,
  ): Promise<boolean> {
    const attemptCount = (existing?.attemptCount ?? 0) + 1;

    let status: schema.DeliveryStatus = "delivered";
    let lastStatusCode: number | null = null;
    let lastError: string | null = null;

    try {
      const response = await this.makePostRequest(endpoint.url, data.data, {
        "Content-Type": "application/json",
        ...(data.idempotencyKey ? { "Idempotency-Key": data.idempotencyKey } : {}),
        ...(endpoint.secret ? { "X-Body-Hash": endpoint.secret } : {}),
      });

      lastStatusCode = response.status;
      if (!response.ok) {
        status = "failed";
        lastError = `endpoint responded with ${response.status}`;
      }
    } catch (error) {
      status = "failed";
      lastError = error instanceof Error ? error.message : String(error);
    }

    const outcome = {
      status,
      attemptCount,
      lastAttemptAt: now,
      completedAt: now,
      lastStatusCode,
      lastError,
    };

    if (existing) {
      await this.db
        .update(schema.deliveries)
        .set(outcome)
        .where(and(eq(schema.deliveries.id, existing.id), eq(schema.deliveries.projectId, data.projectId)))
        .run();
    } else {
      await this.db
        .insert(schema.deliveries)
        .values({
          projectId: data.projectId,
          eventId: data.eventId,
          endpointId: endpoint.id,
          ...outcome,
        })
        .run();
    }

    return status === "delivered";
  }

  async makePostRequest(
    url: string,
    body: Record<string, any>,
    headers: Record<string, string> = {},
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ): Promise<Response> {
    return fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  }
}