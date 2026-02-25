import { useCallback, useEffect } from "react";
import { useUserActivity } from "../providers/UserActivityProvider";
import { UserActivityEvent } from "../types/analytics";
import config from "../config";

/**
 * Hook to automatically send user activity events to device-manager
 * via HTTP POST when they are captured.
 */
export function useUserActivitySync() {
  const { events, sessionId } = useUserActivity();

  // Send activity event to device-manager via HTTP POST
  const sendActivityEvent = useCallback(
    async (event: UserActivityEvent) => {
      try {
        const response = await fetch(`${config.api.baseUrl}/api/user-activity/event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("📊 User activity event sent:", event.type);
        return result;
      } catch (error) {
        console.error("Failed to send user activity event:", error);
        throw error;
      }
    },
    [],
  );

  // Send events in batches via HTTP POST
  const sendEventBatch = useCallback(
    async (events: UserActivityEvent[]) => {
      if (events.length === 0) {
        return;
      }

      try {
        const userId = events[0]?.userId;
        const batchPayload = {
          userId,
          sessionId,
          events,
          batchTimestamp: Date.now(),
          count: events.length,
        };

        const response = await fetch(`${config.api.baseUrl}/api/user-activity/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batchPayload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`📊 User activity batch sent: ${events.length} events`);
        return result;
      } catch (error) {
        console.error("Failed to send user activity batch:", error);
        throw error;
      }
    },
    [sessionId],
  );

  return {
    sendActivityEvent,
    sendEventBatch,
    isConnected: true, // HTTP is always "connected"
  };
}

export default useUserActivitySync;
