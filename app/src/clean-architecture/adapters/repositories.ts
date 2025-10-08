import { SettingsFactory, Task, Settings, User } from "../core/entities";

// ===================================================================================
// --- LAYER 2: ADAPTERS (GATEWAYS / REPOSITORIES) ---
// Connects the core to the outside world (e.g., localStorage).
// Implements the "ports" that the use cases depend on.
// ===================================================================================

/**
 * A generic repository for storing array-based data in localStorage.
 * It's configured with a base key and can handle different "spaces".
 */
// "solo-flow-tasks+user_1758303654337+Personal"
export const createLocalStorageRepository = (userId: string = "anonymous") => {
  const BASE_KEY = "solo-flow-tasks";
  const getStorageKey = (space: string) => `${BASE_KEY}+${userId}+${space}`;

  userId = createAuthRepository().getAuthenticatedUser()?.id ?? "anonymous";

  return {
    getAll: (space: string): Task[] => {
      const activeSpace =
        space || localStorage?.getItem(`solo-flow-space-${userId}`) || "Work";
      const raw: Task[] = JSON.parse(
        localStorage?.getItem(getStorageKey(activeSpace)) || "[]"
      );
      // Dedupe by id to avoid rendering duplicates if historical data contains dupes
      const seen = new Set<string>();
      const deduped: Task[] = [];
      for (const t of raw) {
        if (!t || !t.id) continue;
        if (!seen.has(t.id)) {
          seen.add(t.id);
          deduped.push(t);
        }
      }
      if (deduped.length !== raw.length) {
        localStorage.setItem(
          getStorageKey(activeSpace),
          JSON.stringify(deduped, null, 2)
        );
      }
      return deduped;
    },
    save: (item: Task) => {
      const space = localStorage?.getItem(`solo-flow-space-${userId}`) || "Work";
      const items: Task[] = JSON.parse(
        localStorage?.getItem(getStorageKey(space)) || "[]"
      );
      items.unshift(item); // Add new items to the top
      // Ensure we never persist duplicates by id
      const seen = new Set<string>();
      const unique = items.filter((t) => {
        if (!t || !t.id) return false;
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      localStorage.setItem(
        getStorageKey(space),
        JSON.stringify(unique, null, 2)
      );
    },
    update: (updatedItem: Task) => {
      const space = localStorage?.getItem(`solo-flow-space-${userId}`) || "Work";
      let items: Task[] = JSON.parse(
        localStorage?.getItem(getStorageKey(space)) || "[]"
      );
      items = items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      localStorage.setItem(
        getStorageKey(space),
        JSON.stringify(items, null, 2)
      );
    },
    findById: (id: string): Task | undefined => {
      const space = localStorage?.getItem(`solo-flow-space-${userId}`) || "Work";
      const items: Task[] = JSON.parse(
        localStorage?.getItem(getStorageKey(space)) || "[]"
      );
      return items.find((item) => item.id === id);
    },
    merge: (newUserId: string) => {
      const anonymousTasks =
        createLocalStorageRepository("anonymous").getAll("Work");
      const userTasks = createLocalStorageRepository(newUserId).getAll("Work");
      const mergedTasks = [...anonymousTasks, ...userTasks];
      // Dedupe by id on merge
      const seen = new Set<string>();
      const unique = mergedTasks.filter((t) => {
        if (!t || !t.id) return false;
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      localStorage.setItem(
        `${BASE_KEY}+${newUserId}+Work`,
        JSON.stringify(unique, null, 2)
      );
      // Clear anonymous tasks after merging
      localStorage.removeItem(`${BASE_KEY}+anonymous+Work`);
      localStorage.removeItem(`${BASE_KEY}+anonymous+Personal`);
      localStorage.removeItem(`${BASE_KEY}+anonymous+Project`);
    },
  };
};

/**
 * A specific repository for storing the user settings object.
 */
export const createSettingsRepository = (userId: string) => {
  userId = createAuthRepository().getAuthenticatedUser()?.id ?? "anonymous";
  const STORAGE_KEY = `solo-flow-space-${userId}`;
  const defaultSettings = SettingsFactory.create();
  return {
    get: (): Settings => {
      const stored = JSON.parse(
        String(localStorage?.getItem(STORAGE_KEY)) ?? ""
      );
      if (Boolean(stored) === false) {
        createSettingsRepository(userId).save(defaultSettings);
      }
      return stored ? { space: stored } : defaultSettings;
    },
    save: (settings: Settings) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings.space, null, 2)
      );
    },
  };
};

/**
 * A repository for storing user data.
 */
export const createUserRepository = () => {
  const STORAGE_KEY = "pulse-note-users";
  return {
    findByEmail: (email: string): User | undefined => {
      const users: User[] = JSON.parse(
        localStorage?.getItem(STORAGE_KEY) || "[]"
      );
      return users.find((user) => user.email === email);
    },
    save: (user: User) => {
      const users: User[] = JSON.parse(
        localStorage?.getItem(STORAGE_KEY) || "[]"
      );
      users.push(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users, null, 2));
    },
  };
};

/**
 * A repository for managing the authenticated user's session.
 */
export const createAuthRepository = () => {
  const STORAGE_KEY = "pulse-note-auth";
  return {
    getAuthenticatedUser: (): User | null => {
      if (typeof window === "undefined") return null;
      const user = localStorage?.getItem(STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    },
    setAuthenticatedUser: (user: User) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user, null, 2));
    },
    clearAuthenticatedUser: () => {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
};
