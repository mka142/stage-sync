export interface UserActivityEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  type: UserActivityType;
  data: ActivityEventData;
}

export type UserActivityType =
  | "session_start"
  | "session_end"
  | "focus_change"
  | "visibility_change"
  | "touch_interaction"
  | "scroll_interaction"
  | "page_change"
  | "auto_navigate_to_current_piece"
  | "program_piece_clicked"
  | "back_to_program"
  | "before_concert_show_program"
  | "program_piece_preview";

export interface ActivityEventData {
  // Common fields
  url?: string;
  userAgent?: string;

  // Focus/visibility specific
  isVisible?: boolean;
  isFocused?: boolean;

  // Touch interaction specific
  touchType?: "start" | "move" | "end";
  touchCount?: number;
  coordinates?: { x: number; y: number };

  // Scroll interaction specific
  scrollDirection?: "up" | "down" | "left" | "right";
  scrollPosition?: { x: number; y: number };

  // Session specific
  sessionDuration?: number;

  // Page change specific
  fromPage?: string;
  toPage?: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  events: UserActivityEvent[];
  isActive: boolean;
}

export interface ActivityMetrics {
  totalSessionTime: number;
  activeTime: number;
  inactiveTime: number;
  touchInteractions: number;
  scrollInteractions: number;
  pageChanges: number;
  averageSessionLength: number;
}
