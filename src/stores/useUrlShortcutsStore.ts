import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UrlShortcut } from "@/apps/add-url/types";

interface UrlShortcutsState {
  shortcuts: UrlShortcut[];

  // Actions
  createShortcut: (shortcut: Omit<UrlShortcut, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateShortcut: (id: string, updates: Partial<UrlShortcut>) => void;
  deleteShortcut: (id: string) => void;
  getShortcut: (id: string) => UrlShortcut | undefined;
  getAllShortcuts: () => UrlShortcut[];
}

const createShortcutId = () => `url_shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useUrlShortcutsStore = create<UrlShortcutsState>()(
  persist(
    (set, get) => ({
      shortcuts: [],

      createShortcut: (shortcutData) => {
        const id = createShortcutId();
        const now = Date.now();

        const newShortcut: UrlShortcut = {
          ...shortcutData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          shortcuts: [...state.shortcuts, newShortcut],
        }));

        console.log(`📎 Created URL shortcut: ${newShortcut.name} -> ${newShortcut.url}`);
        return id;
      },

      updateShortcut: (id, updates) => {
        set((state) => ({
          shortcuts: state.shortcuts.map((shortcut) =>
            shortcut.id === id
              ? { ...shortcut, ...updates, updatedAt: Date.now() }
              : shortcut
          ),
        }));
        console.log(`📝 Updated URL shortcut: ${id}`);
      },

      deleteShortcut: (id) => {
        set((state) => ({
          shortcuts: state.shortcuts.filter((shortcut) => shortcut.id !== id),
        }));
        console.log(`🗑️ Deleted URL shortcut: ${id}`);
      },

      getShortcut: (id) => {
        return get().shortcuts.find((shortcut) => shortcut.id === id);
      },

      getAllShortcuts: () => {
        return get().shortcuts;
      },
    }),
    {
      name: "url-shortcuts-storage",
      partialize: (state) => ({
        shortcuts: state.shortcuts,
      }),
    }
  )
);