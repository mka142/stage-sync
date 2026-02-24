export interface UserActivityEvent {
  _id?: string;
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  type: UserActivityType;
  data: ActivityEventData;
  createdAt?: Date;
}

export interface UserActivityEventWithId extends UserActivityEvent {
  _id: string;
}

export type UserActivityType = 
  | 'session_start'
  | 'session_end'
  | 'focus_change'
  | 'visibility_change'
  | 'touch_interaction'
  | 'scroll_interaction'
  | 'page_change';

export interface ActivityEventData {
  // Common fields
  url?: string;
  userAgent?: string;
  
  // Focus/visibility specific
  isVisible?: boolean;
  isFocused?: boolean;
  
  // Touch interaction specific
  touchType?: 'start' | 'move' | 'end';
  touchCount?: number;
  coordinates?: { x: number; y: number };
  
  // Scroll interaction specific
  scrollDirection?: 'up' | 'down' | 'left' | 'right';
  scrollPosition?: { x: number; y: number };
  
  // Session specific
  sessionDuration?: number;
  
  // Page change specific
  fromPage?: string;
  toPage?: string;
}

export interface UserSession {
  _id?: string;
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isActive: boolean;
  eventCount: number;
  lastActivity: number;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSessionWithId extends UserSession {
  _id: string;
}

export interface UserActivityBatch {
  sessionId: string;
  userId: string;
  events: UserActivityEvent[];
  batchTimestamp: number;
  count: number;
}

export interface ActivityMetrics {
  userId: string;
  sessionId: string;
  totalSessionTime: number;
  activeTime: number;
  inactiveTime: number;
  touchInteractions: number;
  scrollInteractions: number;
  pageChanges: number;
  focusChanges: number;
  visibilityChanges: number;
  averageSessionLength: number;
  lastActivity: number;
}