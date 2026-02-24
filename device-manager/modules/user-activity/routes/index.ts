import express from 'express';
import { userActivityService } from '../services/userActivityService';
import type { UserActivityEvent, UserActivityBatch } from '../types';

const router = express.Router();

/**
 * @route POST /api/user-activity/event
 * @description Save a single user activity event
 */
router.post('/event', async (req, res) => {
  try {
    const event: UserActivityEvent = req.body;
    
    // Basic validation
    if (!event.userId || !event.sessionId || !event.type) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, sessionId, type' 
      });
    }

    await userActivityService.saveEvent(event);
    
    res.status(201).json({ 
      success: true, 
      message: 'Event saved successfully' 
    });
  } catch (error) {
    console.error('Error saving user activity event:', error);
    res.status(500).json({ 
      error: 'Failed to save event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/user-activity/batch
 * @description Save a batch of user activity events
 */
router.post('/batch', async (req, res) => {
  try {
    const batch: UserActivityBatch = req.body;
    
    // Basic validation
    if (!batch.userId || !batch.sessionId || !Array.isArray(batch.events)) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, sessionId, events (array)' 
      });
    }

    if (batch.events.length === 0) {
      return res.status(400).json({ 
        error: 'Events array cannot be empty' 
      });
    }

    await userActivityService.saveEventBatch(batch);
    
    res.status(201).json({ 
      success: true, 
      message: `Batch of ${batch.events.length} events saved successfully` 
    });
  } catch (error) {
    console.error('Error saving user activity batch:', error);
    res.status(500).json({ 
      error: 'Failed to save event batch',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/user/:userId/events
 * @description Get events for a specific user
 */
router.get('/user/:userId/events', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const events = await userActivityService.getUserEvents(userId, limit);
    
    res.json({
      success: true,
      userId,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error getting user events:', error);
    res.status(500).json({ 
      error: 'Failed to get user events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/user/:userId/sessions
 * @description Get sessions for a specific user
 */
router.get('/user/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const sessions = await userActivityService.getUserSessions(userId, limit);
    
    res.json({
      success: true,
      userId,
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get user sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/user/:userId/summary
 * @description Get complete activity summary for a user
 */
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const startTime = req.query.start ? parseInt(req.query.start as string) : undefined;
    const endTime = req.query.end ? parseInt(req.query.end as string) : undefined;
    
    const timeRange = (startTime && endTime) ? { start: startTime, end: endTime } : undefined;
    
    const summary = await userActivityService.getUserActivitySummary(userId, timeRange);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error getting user activity summary:', error);
    res.status(500).json({ 
      error: 'Failed to get activity summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/session/:sessionId
 * @description Get session details and events
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 1000;
    
    const [session, events] = await Promise.all([
      userActivityService.getSession(sessionId),
      userActivityService.getSessionEvents(sessionId, limit)
    ]);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session,
      events,
      eventCount: events.length
    });
  } catch (error) {
    console.error('Error getting session details:', error);
    res.status(500).json({ 
      error: 'Failed to get session details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/sessions/active
 * @description Get all active sessions
 */
router.get('/sessions/active', async (req, res) => {
  try {
    const activeSessions = await userActivityService.getActiveSessions();
    
    res.json({
      success: true,
      activeSessions,
      count: activeSessions.length
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get active sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/user/:userId/metrics
 * @description Get activity metrics for a user
 */
router.get('/user/:userId/metrics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;
    
    const metrics = await userActivityService.getUserMetrics(
      userId, 
      sessionId as string
    );
    
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get user metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/user-activity/dashboard
 * @description Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const startTime = req.query.start ? parseInt(req.query.start as string) : undefined;
    const endTime = req.query.end ? parseInt(req.query.end as string) : undefined;
    
    const timeRange = (startTime && endTime) ? { start: startTime, end: endTime } : undefined;
    
    const stats = await userActivityService.getDashboardStats(timeRange);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/user-activity/cleanup
 * @description Clean up old activity data (admin only)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { eventRetentionDays, sessionRetentionDays } = req.body;
    
    const result = await userActivityService.cleanupOldData(
      eventRetentionDays || 30,
      sessionRetentionDays || 90
    );
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      result
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;