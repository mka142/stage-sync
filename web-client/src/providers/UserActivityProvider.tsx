import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { UserActivityEvent, UserActivityType, ActivityEventData, UserSession } from '../types/analytics';

interface UserActivityContextType {
  sessionId: string;
  events: UserActivityEvent[];
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  sendEvent: (type: UserActivityType, data?: Partial<ActivityEventData>) => void;
  currentSession: UserSession | null;
}

const UserActivityContext = createContext<UserActivityContextType | undefined>(undefined);

interface UserActivityProviderProps {
  children: ReactNode;
  userId: string;
  onEventCapture?: (event: UserActivityEvent) => void;
  enableBatching?: boolean;
  batchSize?: number;
}

export function UserActivityProvider({ 
  children, 
  userId, 
  onEventCapture,
  enableBatching = true,
  batchSize = 10 
}: UserActivityProviderProps) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [events, setEvents] = useState<UserActivityEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  
  const eventBatch = useRef<UserActivityEvent[]>([]);
  const lastActivity = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());
  const visibilityState = useRef<boolean>(true);
  const focusState = useRef<boolean>(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30000; // 30 seconds

  // Helper function to determine current page context
  const getCurrentPageContext = useCallback(() => {
    const path = window.location.pathname;
    if (path.includes('/concert') || path.includes('/piece')) return 'CONCERT_SESSION';
    if (path.includes('/program')) return 'PROGRAM_VIEW';
    return 'SYSTEM';
  }, []);
  
  const generateEventId = useCallback(() => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const sendEvent = useCallback((type: UserActivityType, data: Partial<ActivityEventData> = {}) => {
    if (!isTracking) return;

    const event: UserActivityEvent = {
      id: generateEventId(),
      userId,
      sessionId,
      timestamp: Date.now(),
      type,
      data: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...data
      }
    };

    setEvents(prev => [...prev, event]);
    lastActivity.current = Date.now();

    // Reset inactivity timer on each activity
    resetInactivityTimer();

    if (enableBatching) {
      eventBatch.current.push(event);
      if (eventBatch.current.length >= batchSize) {
        flushEventBatch();
      }
    } else {
      onEventCapture?.(event);
    }
  }, [userId, sessionId, isTracking, generateEventId, enableBatching, batchSize, onEventCapture]);

  const flushEventBatch = useCallback(() => {
    if (eventBatch.current.length > 0 && onEventCapture) {
      eventBatch.current.forEach(event => onEventCapture(event));
      eventBatch.current = [];
    }
  }, [onEventCapture]);

  // Immediate flush when user might be leaving
  const immediateFlush = useCallback(() => {
    if (eventBatch.current.length > 0 && onEventCapture) {
      console.log('📊 Immediate flush: sending', eventBatch.current.length, 'events');
      eventBatch.current.forEach(event => onEventCapture(event));
      eventBatch.current = [];
    }
  }, [onEventCapture]);

  // Handle inactivity timeout
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      // If user has been inactive and app is not visible/focused, flush events
      if (!visibilityState.current || !focusState.current) {
        console.log('📊 Inactivity timeout + not focused/visible - flushing events');
        immediateFlush();
      }
    }, INACTIVITY_TIMEOUT);
  }, [immediateFlush, INACTIVITY_TIMEOUT]);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      visibilityState.current = isVisible;
      
      sendEvent('visibility_change', {
        fromPage: getCurrentPageContext(),
        isVisible,
        isFocused: focusState.current
      });

      // If page becomes hidden, immediately flush any pending events
      if (!isVisible) {
        console.log('📊 Page hidden - flushing events immediately');
        immediateFlush();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sendEvent, immediateFlush]);

  // Track window focus/blur
  useEffect(() => {
    const handleFocus = () => {
      focusState.current = true;
      sendEvent('focus_change', {
        fromPage: getCurrentPageContext(),
        isFocused: true,
        isVisible: visibilityState.current
      });
    };

    const handleBlur = () => {
      focusState.current = false;
      sendEvent('focus_change', {
        fromPage: getCurrentPageContext(),
        isFocused: false,
        isVisible: visibilityState.current
      });

      // When window loses focus, immediately flush any pending events
      console.log('📊 Window blur - flushing events immediately');
      immediateFlush();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [sendEvent, immediateFlush]);

  // Track touch interactions
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      sendEvent('touch_interaction', {
        fromPage: getCurrentPageContext(),
        touchType: 'start',
        touchCount: e.touches.length,
        coordinates: e.touches.length > 0 ? {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        } : undefined
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      sendEvent('touch_interaction', {
        fromPage: getCurrentPageContext(),
        touchType: 'end',
        touchCount: e.touches.length,
        coordinates: e.changedTouches.length > 0 ? {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY
        } : undefined
      });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sendEvent]);

  // Track scroll interactions
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollX = window.scrollX;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 
                            currentScrollY < lastScrollY ? 'up' :
                            currentScrollX > lastScrollX ? 'right' : 'left';

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sendEvent('scroll_interaction', {
          fromPage: getCurrentPageContext(),
          scrollDirection,
          scrollPosition: { x: currentScrollX, y: currentScrollY }
        });
      }, 150); // Debounce scroll events

      lastScrollY = currentScrollY;
      lastScrollX = currentScrollX;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sendEvent]);

  // Handle session start/stop
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    sessionStartTime.current = Date.now();
    
    const session: UserSession = {
      sessionId,
      userId,
      startTime: sessionStartTime.current,
      events: [],
      isActive: true
    };
    
    setCurrentSession(session);
    sendEvent('session_start', {
      fromPage: getCurrentPageContext()
    });
  }, [userId, sessionId, isTracking, sendEvent]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    const sessionDuration = Date.now() - sessionStartTime.current;
    sendEvent('session_end', {
      fromPage: getCurrentPageContext(),
      sessionDuration
    });
    immediateFlush();
    
    setIsTracking(false);
    setCurrentSession(prev => prev ? { ...prev, endTime: Date.now(), isActive: false } : null);
  }, [isTracking, sendEvent, immediateFlush, getCurrentPageContext]);

  // Auto-start tracking when component mounts
  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
      // Clean up inactivity timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [startTracking, stopTracking]);

  // Flush remaining events before unmount
  useEffect(() => {
    return () => {
      immediateFlush();
    };
  }, [immediateFlush]);

  // Handle page unload and leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('📊 Before unload - flushing events immediately');
      const sessionDuration = Date.now() - sessionStartTime.current;
      sendEvent('session_end', {
        fromPage: getCurrentPageContext(),
        sessionDuration
      });
      immediateFlush();
      
      // Don't prevent the default as we want to capture the leaving
      // but ensure our data is sent
    };

    const handlePageHide = (e: PageTransitionEvent) => {
      // pagehide is more reliable on mobile devices
      console.log('📊 Page hide - flushing events immediately');
      const sessionDuration = Date.now() - sessionStartTime.current;
      sendEvent('session_end', {
        fromPage: getCurrentPageContext(),
        sessionDuration
      });
      immediateFlush();
    };

    // For mobile devices - handle app switching
    const handleFreeze = () => {
      console.log('📊 Page freeze - flushing events immediately');
      immediateFlush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    // Modern browsers support 'freeze' event for better mobile handling
    window.addEventListener('freeze', handleFreeze);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('freeze', handleFreeze);
    };
  }, [sendEvent, immediateFlush]);

  // Auto-start tracking when provider is mounted
  useEffect(() => {
    console.log('📊 UserActivityProvider mounted, starting tracking for userId:', userId);
    startTracking();
  }, [startTracking]);

  const value: UserActivityContextType = {
    sessionId,
    events,
    isTracking,
    startTracking,
    stopTracking,
    sendEvent,
    currentSession
  };

  return (
    <UserActivityContext.Provider value={value}>
      {children}
    </UserActivityContext.Provider>
  );
}

export function useUserActivity() {
  const context = useContext(UserActivityContext);
  if (context === undefined) {
    throw new Error('useUserActivity must be used within a UserActivityProvider');
  }
  return context;
}

export default UserActivityProvider;