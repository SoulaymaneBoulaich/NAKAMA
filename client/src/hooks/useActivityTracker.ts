import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to track user activity, screen time, and behavioral patterns.
 * Ensures data is synchronized with the backend via heartbeats.
 */
export const useActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionId = useRef<string | null>(null);
  const activeSeconds = useRef<number>(0);
  const heartbeatInterval = useRef<any>(null);
  const isTabActive = useRef<boolean>(true);

  // 1. Initialize session on auth change
  useEffect(() => {
    // Prevent unauthenticated requests that lead to 401s
    if (!user) {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      sessionId.current = null;
      return;
    }

    const initSession = async () => {
      try {
        const response = await api.post('/activity/session/start', {
          initialPage: window.location.pathname
        });
        
        sessionId.current = response.data.id;
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.warn('[ActivityTracker] Auth expired. Stop tracking.');
          // Stop heartbeat if it was running
          if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        } else {
          console.error('[ActivityTracker] Failed to start session:', err.message);
        }
      }
    };

    initSession();

    // Visibility handlers to track real "active" time
    const handleVisibilityChange = () => {
      isTabActive.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat: Every 30 seconds
    heartbeatInterval.current = setInterval(async () => {
      if (sessionId.current && isTabActive.current && user) {
        try {
          await api.post(`/activity/session/${sessionId.current}/heartbeat`, {
            activeSeconds: 30
          });
          
          activeSeconds.current = 0;
        } catch (err: any) {
          if (err.response?.status === 401) {
            clearInterval(heartbeatInterval.current);
            console.warn('[ActivityTracker] Heartbeat auth failed. Stopped tracking.');
          } else {
            console.error('[ActivityTracker] Heartbeat failed:', err.message);
          }
        }
      }
    }, 30000);

    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // 2. Track page views on route change
  useEffect(() => {
    if (sessionId.current && user) {
      api.post(`/activity/session/${sessionId.current}/page-view`, {
        url: location.pathname
      }).catch(err => {
        // Silent fail for page views to avoid spamming if the session is dead
      });
    }
  }, [location, user]);

  return { sessionId: sessionId.current };
};
