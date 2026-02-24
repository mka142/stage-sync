import { useEffect, useRef } from 'react';
import { useUserActivity } from '../providers/UserActivityProvider';
import { useUserActivitySync } from '../hooks/useUserActivitySync';
import { UserActivityEvent } from '../types/analytics';

/**
 * Component that handles syncing user activity events to the device manager.
 * This should be rendered inside the UserActivityProvider.
 */
function UserActivitySync() {
  const { events } = useUserActivity();
  const { sendEventBatch } = useUserActivitySync();
  const lastEventCount = useRef(0);
  const eventQueue = useRef<UserActivityEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);

  const flushEvents = () => {
    if (eventQueue.current.length > 0) {
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
        flushEvents();
      }
    }
  }, [events, sendEventBatch]);

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

/**
 * Wrapper component that provides user activity tracking integrated with device manager sync
 */
export function UserActivityWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserActivitySync />
      {children}
    </>
  );
}

export default UserActivityWrapper;