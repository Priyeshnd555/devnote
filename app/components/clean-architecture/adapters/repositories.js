// ===================================================================================
// --- LAYER 2: ADAPTERS (GATEWAYS / REPOSITORIES) ---
// Connects the core to the outside world (e.g., localStorage).
// Implements the "ports" that the use cases depend on.
// ===================================================================================

import { SettingsFactory, UserFactory } from "../core/entities";

/**
 * A generic repository for storing array-based data in localStorage.
 * It's configured with a base key and can handle different "spaces".
 */
export const createLocalStorageRepository = (userId = "anonymous") => {
  const BASE_KEY = "solo-flow-tasks";
  const getStorageKey = (space) => `${BASE_KEY}+${userId}+${space}`;

  return {
    getAll: (space) => {
      const activeSpace =
        space || localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      return JSON.parse(
        localStorage.getItem(getStorageKey(activeSpace)) || "[]"
      );
    },
    save: (item) => {
      const space = localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      const items = JSON.parse(
        localStorage.getItem(getStorageKey(space)) || "[]"
      );
      items.unshift(item); // Add new items to the top
      localStorage.setItem(getStorageKey(space), JSON.stringify(items));
    },
    update: (updatedItem) => {
      const space = localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      let items = JSON.parse(
        localStorage.getItem(getStorageKey(space)) || "[]"
      );
      items = items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      localStorage.setItem(getStorageKey(space), JSON.stringify(items));
    },
    findById: (id) => {
      const space = localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      const items = JSON.parse(
        localStorage.getItem(getStorageKey(space)) || "[]"
      );
      return items.find((item) => item.id === id);
    },
    merge: (newUserId) => {
      const anonymousTasks = createLocalStorageRepository("anonymous").getAll();
      const userTasks = createLocalStorageRepository(newUserId).getAll();
      const mergedTasks = [...anonymousTasks, ...userTasks];
      localStorage.setItem(
        `${BASE_KEY}+${newUserId}+Work`,
        JSON.stringify(mergedTasks)
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
export const createSettingsRepository = () => {
  const STORAGE_KEY = "solo-flow-settings";
  const defaultSettings = SettingsFactory.create();
  return {
    get: () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (Boolean(stored) === false) {
        createSettingsRepository().save(defaultSettings);
      }
      return stored
        ? { ...defaultSettings, ...JSON.parse(stored) }
        : defaultSettings;
    },
    save: (settings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Also save the current space for the task repo to use.
      localStorage.setItem("solo-flow-space", settings.space);
    },
  };
};

/**
 * A repository for storing user data.
 */
export const createUserRepository = () => {
  const STORAGE_KEY = "pulse-note-users";
  return {
    findByEmail: (email) => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return users.find((user) => user.email === email);
    },
    save: (user) => {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      users.push(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    },
  };
};

/**
 * A repository for managing the authenticated user's session.
 */
export const createAuthRepository = () => {
  const STORAGE_KEY = "pulse-note-auth";
  return {
    getAuthenticatedUser: () => {
      const user = localStorage.getItem(STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    },
    setAuthenticatedUser: (user) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    },
    clearAuthenticatedUser: () => {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
};
