import { UserActivityEventOperations, UserSessionOperations, UserActivityAnalyticsOperations } from '../db';
import type { UserActivityEvent, UserSession, UserActivityBatch, ActivityMetrics } from '../types';

class UserActivityService {
  
  // Event operations
  async saveEvent(event: UserActivityEvent): Promise<void> {
    try {
      const result = await UserActivityEventOperations.create(event);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log(`📊 Saved user activity event: ${event.type} for user ${event.userId}`);
      
      // Update session activity
      await this.updateSessionActivity(event.sessionId, event.timestamp);
    } catch (error) {
      console.error('Failed to save user activity event:', error);
      throw error;
    }
  }

  async saveEventBatch(batch: UserActivityBatch): Promise<void> {
    try {
      if (batch.events.length === 0) {
        console.warn('Empty event batch received');
        return;
      }

      const result = await UserActivityEventOperations.createBatch(batch.events);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log(`📊 Saved user activity batch: ${batch.count} events for user ${batch.userId}`);
      
      // Update session activity with latest timestamp
      const latestTimestamp = Math.max(...batch.events.map(e => e.timestamp));
      await this.updateSessionActivity(batch.sessionId, latestTimestamp);
    } catch (error) {
      console.error('Failed to save user activity batch:', error);
      throw error;
    }
  }

  // Session operations
  async createSession(userId: string, sessionId: string, startTime: number, userAgent?: string): Promise<void> {
    try {
      const session: UserSession = {
        sessionId,
        userId,
        startTime,
        isActive: true,
        eventCount: 0,
        lastActivity: startTime,
        userAgent,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await UserSessionOperations.create(session);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`📊 Created user session: ${sessionId} for user ${userId}`);
    } catch (error) {
      console.error('Failed to create user session:', error);
      throw error;
    }
  }

  async endSession(sessionId: string, endTime: number): Promise<void> {
    try {
      const result = await UserSessionOperations.endSession(sessionId, endTime);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`📊 Ended user session: ${sessionId}`);
    } catch (error) {
      console.error('Failed to end user session:', error);
      throw error;
    }
  }

  async updateSessionActivity(sessionId: string, timestamp: number): Promise<void> {
    try {
      // Get current session to increment event count
      const session = await UserSessionOperations.findBySessionId(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found, skipping activity update`);
        return;
      }

      const result = await UserSessionOperations.updateBySessionId(sessionId, {
        eventCount: session.eventCount + 1,
        lastActivity: timestamp,
        updatedAt: new Date()
      });

      if (!result.success) {
        console.warn(`Failed to update session activity: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
      // Don't throw here as it's a secondary operation
    }
  }

  // Data retrieval operations
  async getSessionEvents(sessionId: string, limit?: number): Promise<UserActivityEvent[]> {
    return UserActivityEventOperations.findBySession(sessionId, limit);
  }

  async getUserEvents(userId: string, limit?: number): Promise<UserActivityEvent[]> {
    return UserActivityEventOperations.findByUser(userId, limit);
  }

  async getUserSessions(userId: string, limit?: number): Promise<UserSession[]> {
    return UserSessionOperations.findByUser(userId, limit);
  }

  async getActiveSessions(): Promise<UserSession[]> {
    return UserSessionOperations.findActive();
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    return UserSessionOperations.findBySessionId(sessionId);
  }

  // Analytics operations
  async getUserMetrics(userId: string, sessionId?: string): Promise<ActivityMetrics | null> {
    const result = await UserActivityAnalyticsOperations.getActivityMetrics(userId, sessionId);
    return result.success ? result.data : null;
  }

  async getUserActivitySummary(userId: string, timeRange?: { start: number; end: number }) {
    const result = await UserActivityAnalyticsOperations.getUserActivitySummary(userId, timeRange);
    return result.success ? result.data : null;
  }

  async getEventsInTimeRange(startTime: number, endTime: number, limit?: number): Promise<UserActivityEvent[]> {
    return UserActivityEventOperations.findByTimeRange(startTime, endTime, limit);
  }

  // Process incoming MQTT messages
  async processActivityEvent(topic: string, payload: string): Promise<void> {
    try {
      // Parse the topic to extract user and session info
      const topicParts = topic.split('/');
      
      if (topicParts[0] === 'user-activity-batch') {
        // Handle batch: user-activity-batch/{userId}/{sessionId}
        const batch: UserActivityBatch = JSON.parse(payload);
        await this.saveEventBatch(batch);
      } else if (topicParts[0] === 'user-activity') {
        // Handle single event: user-activity/{userId}/{sessionId}
        const event: UserActivityEvent = JSON.parse(payload);
        await this.saveEvent(event);
        
        // Handle special session events
        if (event.type === 'session_start') {
          await this.createSession(
            event.userId, 
            event.sessionId, 
            event.timestamp, 
            event.data.userAgent
          );
        } else if (event.type === 'session_end') {
          await this.endSession(event.sessionId, event.timestamp);
        }
      }
    } catch (error) {
      console.error('Failed to process activity event:', error);
      throw error;
    }
  }

  // Dashboard data for admin panel
  async getDashboardStats(timeRange?: { start: number; end: number }) {
    try {
      const now = Date.now();
      const defaultStart = now - (24 * 60 * 60 * 1000); // Last 24 hours
      const range = timeRange || { start: defaultStart, end: now };

      const [activeSessions, recentEvents] = await Promise.all([
        this.getActiveSessions(),
        this.getEventsInTimeRange(range.start, range.end, 1000)
      ]);

      // Group events by type
      const eventTypes = recentEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get unique users in time range
      const uniqueUsers = new Set(recentEvents.map(e => e.userId));

      return {
        activeSessions: activeSessions.length,
        recentEvents: recentEvents.length,
        uniqueUsers: uniqueUsers.size,
        eventTypes,
        timeRange: range,
        lastUpdated: now
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  // Maintenance operations
  async cleanupOldData(eventRetentionDays = 30, sessionRetentionDays = 90) {
    try {
      const [eventsResult, sessionsResult] = await Promise.all([
        UserActivityEventOperations.cleanupOld(eventRetentionDays),
        UserSessionOperations.cleanupOld(sessionRetentionDays)
      ]);

      const deletedEvents = eventsResult.success ? eventsResult.data : 0;
      const deletedSessions = sessionsResult.success ? sessionsResult.data : 0;

      console.log(`🗑️ Cleanup completed: ${deletedEvents} events, ${deletedSessions} sessions removed`);
      return { deletedEvents, deletedSessions };
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      throw error;
    }
  }
}

export const userActivityService = new UserActivityService();
export default userActivityService;