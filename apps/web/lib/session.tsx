"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  group_id: string | null;
  weekly_step_target: number;
  avatar_skin: number;
  avatar_hair: number;
  avatar_colorway: number;
  fitbit_connected: boolean;
  last_synced_at: string | null;
}

interface SessionPayload {
  user: SessionUser | null;
  group: { id: string; name: string; invite_code: string; admin_id: string } | null;
  activeWeek: Record<string, unknown> | null;
}

interface SessionState extends SessionPayload {
  loading: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionPayload>({ user: null, group: null, activeWeek: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setState(await api<SessionPayload>("/api/auth/session"));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setState({ user: null, group: null, activeWeek: null });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ ...state, loading, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
