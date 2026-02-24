import { useEffect, useRef } from 'react';
import { useUserActivity } from '../providers/UserActivityProvider';
import { useUserActivitySync } from '../hooks/useUserActivitySync';
import { UserActivityEvent } from '../types/analytics';

/**
 * Component that handles automatic syncing of user activity events to device manager.
 * Must be rendered inside UserActivityProvider.
 */
function UserActivitySync() {
  const { events } = useUserActivity();
  const { sendEventBatch, isConnected } = useUserActivitySync();
  const lastEventCount = useRef(0);
  const eventQueue = useRef<UserActivityEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);

  const flushEvents = () => {
    if (eventQueue.current.length > 0 && isConnected) {
      sendEventBatch([...eventQueue.current]);
      eventQueue.current = [];
    }
  };

  // Monitor new events and add to queue
  useEffect(() => {
    const newEvents = events.slice(lastEventCount.current);
    if (newEvents.length > 0) {
      eventQueue.current.push(...newEvents);
      lastEventCount.current = events.length;

      // Clear existing timer
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }

      // Set new timer to batch events (send after 2 seconds of inactivity)
      batchTimer.current = setTimeout(flushEvents, 2000);

      // Also flush if we have too many events
      if (eventQueue.current.length >= 10) {
        if (batchTimer.current) {
          clearTimeout(batchTimer.current);
          batchTimer.current = null;
        }
        flushEvents();
      }
    }
  }, [events, isConnected]);

  // Flush any remaining events on unmount
  useEffect(() => {
    return () => {
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
      flushEvents();
    };
  }, []);

  return null; // This component doesn't render anything
}

export default UserActivitySync;