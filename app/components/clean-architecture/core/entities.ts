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
export const TaskFactory = {
  create: ({ description, projectId = null }: { description: string; projectId?: string | null }): Task => ({
    id: `task_${Date.now()}`,
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
