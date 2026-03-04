import { parseId } from "@/lib/db/utils";
import { PublisherService } from "@/modules/connections/services/publisherService";

import { ConcertOperations } from "../db";

import { EventService } from "./eventService";

import type { Concert } from "../types";
import type { OperationResult } from "@/lib/types";
import type { ObjectId } from "mongodb";
import { ImageParser, processPayloadContent, readImageMetadata } from "@/modules/images";
import { config } from "@/config";

/**
 * Concert Service - Business Logic Layer
 * Handles concert-related business operations
 */
export class ConcertService {
  static async getAllConcerts() {
    return ConcertOperations.findAll();
  }
  static async getConcertById(concertId: string) {
    return ConcertOperations.findById(concertId);
  }

  static async createConcert(concertData: Concert) {
    const concert: Concert = {
      ...concertData,
    };

    return ConcertOperations.create(concert);
  }
  static async findActiveConcert() {
    return ConcertOperations.findActive();
  }

  static async activateConcert(concertId: string | ObjectId): Promise<OperationResult<boolean>> {
    try {
      // First deactivate all other concerts
      const allConcerts = await ConcertOperations.findAll();
      for (const concert of allConcerts) {
        if (concert.isActive) {
          await ConcertOperations.updateById(concert._id, { isActive: false });
        }
      }

      // Then activate the target concert
      const result = await ConcertOperations.updateById(concertId, { isActive: true });

      if (result.success) {
        return { success: true, data: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Failed to activate concert" };
    }
  }

  static async deactivateConcert(concertId: string): Promise<OperationResult<boolean>> {
    try {
      const result = await ConcertOperations.updateById(concertId, { isActive: false });

      if (result.success) {
        return { success: true, data: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Failed to deactivate concert" };
    }
  }

  static async setActiveEvent(concertId: string, eventId: string | null, publish = true): Promise<OperationResult<boolean>> {
    if (eventId) {
      const event = await EventService.getEventById(eventId ?? "");

      if (!event) {
        return { success: false, error: "Event not found" };
      }

      if (publish) {
        // Process payload content through ImageParser to convert <image uuid="..."/> tags
        const processedEvent = { ...event };
        if (event.payload && typeof event.payload === "object") {
          const imageParser = new ImageParser({ domain: config.images.domain });
          // Load image metadata so parser can resolve UUIDs
          const imageMetadata = readImageMetadata();
          imageParser.setImageMetadata(imageMetadata);
          processedEvent.payload = processPayloadContent(event.payload, imageParser);
        }
        // Optionally, publish the event via MQTT when setting it active
        const pubRes = await PublisherService.publishEvent(processedEvent);
        if (!pubRes.success) {
          console.error("Failed to publish event when setting active:", pubRes.error);
          return { success: false, error: "Failed to publish event" };
        }
      }
    }

    try {
      const result = await ConcertOperations.updateById(concertId, { activeEventId: eventId ? parseId(eventId) : null });

      if (result.success) {
        return { success: true, data: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Failed to set active event" };
    }
  }
}
