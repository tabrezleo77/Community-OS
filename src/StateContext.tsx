import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, Attendee, Session, VolunteerTask, Announcement, UserRole, TaskStatus } from './types';

interface AppContextType extends AppState {
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserAttendeeId: (id: string | null) => void;
  checkInAttendee: (id: string) => void;
  uncheckInAttendee: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addAnnouncement: (message: string, sender: string) => void;
  isLoading: boolean;
  loadError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Same-origin API base. Works both in dev (via Vite proxy, see vite.config.ts)
// and in production (server serves the built frontend + these API routes).
const API_BASE = '/api';

// How often to re-poll the server so that check-ins / task updates / new
// announcements made from other devices show up here too.
const POLL_INTERVAL_MS = 5000;

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('Organizer');
  const [currentUserAttendeeId, setCurrentUserAttendeeId] = useState<string | null>('a1');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await apiFetch('/state');
      setAttendees(state.attendees);
      setSessions(state.sessions);
      setTasks(state.tasks);
      setAnnouncements(state.announcements);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + background polling so multiple devices stay in sync.
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const checkInAttendee = useCallback((id: string) => {
    const checkInTime = new Date().toISOString();
    // Optimistic update so the UI feels instant, then persist to the server.
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, status: 'Checked-In', checkInTime } : a));
    apiFetch(`/attendees/${id}/checkin`, { method: 'POST' }).catch(() => refresh());
  }, [refresh]);

  const uncheckInAttendee = useCallback((id: string) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, status: 'Registered', checkInTime: null } : a));
    apiFetch(`/attendees/${id}/uncheckin`, { method: 'POST' }).catch(() => refresh());
  }, [refresh]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }).catch(() => refresh());
  }, [refresh]);

  const addAnnouncement = useCallback((message: string, sender: string) => {
    const optimistic: Announcement = {
      id: `ann${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      sender,
    };
    setAnnouncements(prev => [optimistic, ...prev]);
    apiFetch('/announcements', { method: 'POST', body: JSON.stringify({ message, sender }) })
      .then(saved => {
        // Replace the optimistic entry with the server-confirmed one (real id).
        setAnnouncements(prev => [saved, ...prev.filter(a => a.id !== optimistic.id)]);
      })
      .catch(() => refresh());
  }, [refresh]);

  return (
    <AppContext.Provider value={{
      attendees, sessions, tasks, announcements, currentRole, currentUserAttendeeId,
      setCurrentRole, setCurrentUserAttendeeId, checkInAttendee, uncheckInAttendee,
      updateTaskStatus, addAnnouncement, isLoading, loadError,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
