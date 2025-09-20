export interface Task {
  id: string;
  description: string;
  projectId: string | null;
  status: "inbox" | "today" | "paused" | "done";
  details: string;
  updates: string[];
  pausedContext: string | null;
  resumeDate: string | null;
  doneRemarks: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Settings {
  space: "Work" | "Personal" | "Project";
}

export interface User {
  id: string;
  email: string;
  password?: string; // Make password optional for security reasons
  createdAt: string;
}

// ===================================================================================
// --- LAYER 1: CORE (ENTITIES & USE CASES) ---
// Pure business logic. No knowledge of React, DOM, or localStorage.
// ===================================================================================

/**
 * --- ENTITIES ---
 * Simple factory functions to create consistent data structures for our core concepts.
 */

// Generate collision-resistant IDs for tasks
const generateTaskId = (): string => {
  // Prefer the browser's crypto API when available
  // Note: this module is used client-side in this app
  try {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return `task_${(crypto as any).randomUUID()}`;
    }
  } catch (_) {
    // ignore and fall back
  }
  // Fallback: timestamp + random suffix
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const TaskFactory = {
  create: ({ description, projectId = null }: { description: string; projectId?: string | null }): Task => ({
    id: generateTaskId(),
    description,
    projectId,
    status: "inbox", // 'inbox', 'today', 'paused', 'done'
    details: "",
    updates: [],
    pausedContext: null,
    resumeDate: null,
    doneRemarks: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  }),
};

export const SettingsFactory = {
  create: ({ space = "Work" }: { space?: "Work" | "Personal" | "Project" } = {}): Settings => ({
    space, // 'Work', 'Personal', 'Project'
  }),
};

export const UserFactory = {
  create: ({ email, password }: Omit<User, "id" | "createdAt">): User => ({
    id: `user_${Date.now()}`,
    email,
    // In a real app, we would hash the password. For this example, we'll store it as is.
    password,
    createdAt: new Date().toISOString(),
  }),
};
