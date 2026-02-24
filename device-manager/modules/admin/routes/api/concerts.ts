import { Router } from "express";

import { config } from "@/config";
import { UserService } from "@/modules/user/services/userService";
import { ImageParser, readImageMetadata } from "@/modules/images";

import { ConcertService, EventService } from "../../services";

import type { Request, Response } from "express";

const router = Router();

router.get("/currentEvent", async (req: Request, res: Response) => {
  const activeConcert = await ConcertService.findActiveConcert();
  if (!activeConcert) {
    res.status(404).json({
      success: false,
      error: "No active concert found",
    });
    return;
  }

  const activeEventId = activeConcert.activeEventId;
  if (!activeEventId) {
    res.status(404).json({
      success: false,
      error: "No active event found for the current concert",
    });
    return;
  }

  const event = await EventService.getEventById(activeEventId.toString());
  if (!event) {
    res.status(404).json({
      success: false,
      error: "Active event not found",
    });
    return;
  }

  // Process payload content through ImageParser to convert <image uuid="..."/> tags
  const processedEvent = { ...event };
  if (event.payload && typeof event.payload === 'object') {
    const imageParser = new ImageParser({ domain: config.images.domain });
    // Load image metadata so parser can resolve UUIDs
    const imageMetadata = readImageMetadata();
    imageParser.setImageMetadata(imageMetadata);
    processedEvent.payload = processPayloadContent(event.payload, imageParser);
  }

  // check for clientId query param
  try {
    const clientId = req.query.clientId as string | undefined;
    if (clientId) {
      // get user by clientId and update lastPintg and set isActive to true
      await UserService.updateDeviceStatus(clientId, true);
    }
  } catch (error) {
    console.error("Failed to update user status:", error);
  }

  res.json({
    success: true,
    data: processedEvent,
  });
});

// Helper function to recursively process payload content
function processPayloadContent(obj: any, imageParser: ImageParser): any {
  if (typeof obj === 'string') {
    // Process string content through ImageParser
    const result = imageParser.parseContent(obj);
    return result.content;
  } else if (Array.isArray(obj)) {
    // Process array elements
    return obj.map(item => processPayloadContent(item, imageParser));
  } else if (obj && typeof obj === 'object') {
    // Process object properties
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processPayloadContent(value, imageParser);
    }
    return processed;
  }
  // Return as-is for other types (numbers, booleans, null, etc.)
  return obj;
}

export default router;
