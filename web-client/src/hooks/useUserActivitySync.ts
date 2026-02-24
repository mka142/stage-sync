import { useCallback, useEffect } from 'react';
import { useDeviceManager } from '../lib/DeviceManagerClient';
import { useUserActivity } from '../providers/UserActivityProvider';
import { UserActivityEvent } from '../types/analytics';

/**
 * Hook to automatically send user activity events to device-manager
 * via MQTT when they are captured.
 */
export function useUserActivitySync() {
  const { publish, connectionStatus } = useDeviceManager();
  const { events, sessionId } = useUserActivity();

  // Send activity event to device-manager
  const sendActivityEvent = useCallback(async (event: UserActivityEvent) => {
    if (connectionStatus !== 'connected') {
      console.warn('Cannot send activity event: not connected to device manager');
      return;
    }

    try {
      const topic = `user-activity/${event.userId}/${event.sessionId}`;
      const payload = JSON.stringify(event);
      
      await publish(topic, payload);
      console.log('📊 User activity event sent:', event.type);
    } catch (error) {
      console.error('Failed to send user activity event:', error);
    }
  }, [publish, connectionStatus]);

  // Send events in batches to avoid overwhelming the server
  const sendEventBatch = useCallback(async (events: UserActivityEvent[]) => {
    if (connectionStatus !== 'connected' || events.length === 0) {
      return;
    }

    try {
      const userId = events[0]?.userId;
      const topic = `user-activity-batch/${userId}/${sessionId}`;
      const payload = JSON.stringify({
        sessionId,
        events,
        batchTimestamp: Date.now(),
        count: events.length
      });
      
      await publish(topic, payload);
      console.log(`📊 User activity batch sent: ${events.length} events`);
    } catch (error) {
      console.error('Failed to send user activity batch:', error);
    }
  }, [publish, connectionStatus, sessionId]);

  return {
    sendActivityEvent,
    sendEventBatch,
    isConnected: connectionStatus === 'connected'
  };
}

export default useUserActivitySync;