import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { StorageService } from '../../backend/storage/StorageService';

interface AppState {
  /** Whether any concepts exist in the database */
  hasConcepts: boolean;
  /** Whether global search modal is open */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** Whether settings modal is open */
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  /** Refresh app state from storage */
  refresh: () => Promise<void>;
  /** Storage service instance */
  storage: StorageService;
}

const AppStateContext = createContext<AppState | null>(null);

const storage = new StorageService();

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasConcepts, setHasConcepts] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refresh = useCallback(async () => {
    const concepts = await storage.getConcepts({});
    setHasConcepts(concepts.length > 0);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AppStateContext.Provider
      value={{ hasConcepts, searchOpen, setSearchOpen, settingsOpen, setSettingsOpen, refresh, storage }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
