/**
 * User Activity Database Operations
 * Following the same pattern as re-record-form database operations
 */

import { config } from "@/config";
import { documentMapper } from "@/lib/db/mapper";
import { parseId, setTimestamps } from "@/lib/db/utils";
import { db } from "@/modules/db";

import type { UserActivityEvent, UserSession, UserActivityBatch, ActivityMetrics } from "../types";
import type { OperationResult } from "@/lib/types";
import type { ObjectId } from "mongodb";

const byId = (id: string | ObjectId) => ({ _id: parseId(id) });

/**
 * User Activity Events database operations
 */
export class UserActivityEventOperations {
  private static async getCollection() {
    return await db().collection<UserActivityEvent>(config.database.collections.userActivityEvents);
  }

  static async create(event: UserActivityEvent): Promise<OperationResult<UserActivityEvent>> {
    try {
      const collection = await this.getCollection();
      const eventToSave = {
        ...event,
        createdAt: new Date()
      };
      const { insertedId } = await collection.insertOne(this.mapToDocument(eventToSave));
      return { success: true, data: { ...eventToSave, _id: insertedId.toString() } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async createBatch(events: UserActivityEvent[]): Promise<OperationResult<UserActivityEvent[]>> {
    try {
      if (events.length === 0) {
        return { success: false, error: "Empty batch" };
      }

      const collection = await this.getCollection();
      const eventsToSave = events.map(event => ({
        ...event,
        createdAt: new Date()
      }));

      await collection.insertMany(eventsToSave.map(this.mapToDocument));
      return { success: true, data: eventsToSave };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findBySession(sessionId: string, limit = 1000): Promise<UserActivityEvent[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ sessionId })
        .sort({ timestamp: 1 })
        .limit(limit)
        .toArray();
      return docs.map(this.mapFromDocument);
    } catch (error) {
      console.error("Failed to find events by session:", error);
      return [];
    }
  }

  static async findByUser(userId: string, limit = 1000): Promise<UserActivityEvent[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      return docs.map(this.mapFromDocument);
    } catch (error) {
      console.error("Failed to find events by user:", error);
      return [];
    }
  }

  static async findByTimeRange(startTime: number, endTime: number, limit = 1000): Promise<UserActivityEvent[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({
          timestamp: {
            $gte: startTime,
            $lte: endTime
          }
        })
        .sort({ timestamp: 1 })
        .limit(limit)
        .toArray();
      return docs.map(this.mapFromDocument);
    } catch (error) {
      console.error("Failed to find events by time range:", error);
      return [];
    }
  }

  static async cleanupOld(daysToKeep = 30): Promise<OperationResult<number>> {
    try {
      const collection = await this.getCollection();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      return { success: true, data: result.deletedCount || 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static mapFromDocument(doc: UserActivityEvent) {
    return documentMapper.fromDocument<UserActivityEvent>(doc);
  }

  private static mapToDocument(event: UserActivityEvent) {
    return documentMapper.toDocument<UserActivityEvent>(event);
  }
}

/**
 * User Sessions database operations
 */
export class UserSessionOperations {
  private static async getCollection() {
    return await db().collection<UserSession>(config.database.collections.userSessions);
  }

  static async create(session: UserSession): Promise<OperationResult<UserSession>> {
    try {
      const collection = await this.getCollection();
      const sessionToSave = {
        ...session,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { insertedId } = await collection.insertOne(this.mapToDocument(sessionToSave));
      return { success: true, data: { ...sessionToSave, _id: insertedId.toString() } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findBySessionId(sessionId: string): Promise<UserSession | null> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ sessionId });
      return doc ? this.mapFromDocument(doc) : null;
    } catch (error) {
      console.error("Failed to find session by sessionId:", error);
      return null;
    }
  }

  static async findByUser(userId: string, limit = 100): Promise<UserSession[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ userId })
        .sort({ startTime: -1 })
        .limit(limit)
        .toArray();
      return docs.map(this.mapFromDocument);
    } catch (error) {
      console.error("Failed to find sessions by user:", error);
      return [];
    }
  }

  static async findActive(): Promise<UserSession[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ isActive: true })
        .sort({ lastActivity: -1 })
        .toArray();
      return docs.map(this.mapFromDocument);
    } catch (error) {
      console.error("Failed to find active sessions:", error);
      return [];
    }
  }

  static async updateBySessionId(sessionId: string, updates: Partial<UserSession>): Promise<OperationResult<UserSession | null>> {
    try {
      const collection = await this.getCollection();
      const updateDoc = setTimestamps(updates);
      const doc = await collection.findOneAndUpdate(
        { sessionId },
        { $set: updateDoc },
        { returnDocument: "after" }
      );
      const session = doc ? this.mapFromDocument(doc) : null;
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async endSession(sessionId: string, endTime: number): Promise<OperationResult<UserSession | null>> {
    try {
      const session = await this.findBySessionId(sessionId);
      if (!session) {
        return { success: false, error: "Session not found" };
      }

      const duration = endTime - session.startTime;
      const updates = {
        endTime,
        duration,
        isActive: false,
        lastActivity: endTime
      };

      return await this.updateBySessionId(sessionId, updates);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async cleanupOld(daysToKeep = 90): Promise<OperationResult<number>> {
    try {
      const collection = await this.getCollection();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate },
        isActive: false
      });

      return { success: true, data: result.deletedCount || 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static mapFromDocument(doc: UserSession) {
    return documentMapper.fromDocument<UserSession>(doc);
  }

  private static mapToDocument(session: UserSession) {
    return documentMapper.toDocument<UserSession>(session);
  }
}

/**
 * User Activity Analytics operations
 */
export class UserActivityAnalyticsOperations {
  static async getActivityMetrics(userId: string, sessionId?: string): Promise<OperationResult<ActivityMetrics | null>> {
    try {
      const eventsCollection = await db().collection<UserActivityEvent>(config.database.collections.userActivityEvents);

      const matchCriteria: any = { userId };
      if (sessionId) {
        matchCriteria.sessionId = sessionId;
      }

      const result = await eventsCollection.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: sessionId ? "$sessionId" : "$userId",
            touchInteractions: {
              $sum: {
                $cond: [{ $eq: ["$type", "touch_interaction"] }, 1, 0]
              }
            },
            scrollInteractions: {
              $sum: {
                $cond: [{ $eq: ["$type", "scroll_interaction"] }, 1, 0]
              }
            },
            pageChanges: {
              $sum: {
                $cond: [{ $eq: ["$type", "page_change"] }, 1, 0]
              }
            },
            focusChanges: {
              $sum: {
                $cond: [{ $eq: ["$type", "focus_change"] }, 1, 0]
              }
            },
            visibilityChanges: {
              $sum: {
                $cond: [{ $eq: ["$type", "visibility_change"] }, 1, 0]
              }
            },
            lastActivity: { $max: "$timestamp" },
            sessionSamples: {
              $addToSet: {
                $cond: [
                  { $in: ["$type", ["session_start", "session_end"]] },
                  {
                    sessionId: "$sessionId",
                    type: "$type",
                    timestamp: "$timestamp",
                    sessionDuration: "$data.sessionDuration"
                  },
                  null
                ]
              }
            }
          }
        }
      ]).toArray();

      if (result.length === 0) {
        return { success: true, data: null };
      }

      const metrics = result[0];
      const sessionSamples = metrics.sessionSamples.filter((s: any) => s !== null);
      
      // Calculate session statistics
      let totalSessionTime = 0;
      let sessionCount = 0;
      
      const sessionDurations = new Map();
      sessionSamples.forEach((sample: any) => {
        if (sample.type === 'session_end' && sample.sessionDuration) {
          sessionDurations.set(sample.sessionId, sample.sessionDuration);
        }
      });

      sessionDurations.forEach((duration: number) => {
        totalSessionTime += duration;
        sessionCount++;
      });

      const averageSessionLength = sessionCount > 0 ? totalSessionTime / sessionCount : 0;

      const activityMetrics: ActivityMetrics = {
        userId,
        sessionId: sessionId || 'all',
        totalSessionTime,
        activeTime: totalSessionTime, // Simplified - could be calculated more precisely
        inactiveTime: 0, // Would need more sophisticated calculation
        touchInteractions: metrics.touchInteractions || 0,
        scrollInteractions: metrics.scrollInteractions || 0,
        pageChanges: metrics.pageChanges || 0,
        focusChanges: metrics.focusChanges || 0,
        visibilityChanges: metrics.visibilityChanges || 0,
        averageSessionLength,
        lastActivity: metrics.lastActivity || 0
      };

      return { success: true, data: activityMetrics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getUserActivitySummary(userId: string, timeRange?: { start: number; end: number }): Promise<OperationResult<any>> {
    try {
      const eventsCollection = await db().collection<UserActivityEvent>(config.database.collections.userActivityEvents);
      const sessionsCollection = await db().collection<UserSession>(config.database.collections.userSessions);

      const matchCriteria: any = { userId };
      if (timeRange) {
        matchCriteria.timestamp = {
          $gte: timeRange.start,
          $lte: timeRange.end
        };
      }

      const [events, sessions] = await Promise.all([
        eventsCollection.find(matchCriteria).sort({ timestamp: 1 }).toArray(),
        sessionsCollection.find({ userId }).sort({ startTime: -1 }).toArray()
      ]);

      const metricsResult = await this.getActivityMetrics(userId);
      const metrics = metricsResult.success ? metricsResult.data : null;

      const summary = {
        userId,
        totalEvents: events.length,
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.isActive).length,
        events: events.slice(0, 100), // Return last 100 events
        sessions: sessions.slice(0, 20), // Return last 20 sessions
        metrics
      };

      return { success: true, data: summary };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}