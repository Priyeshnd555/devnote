
// ===================================================================================
// --- LAYER 1: CORE (ENTITIES & USE CASES) ---
// Pure business logic. No knowledge of React, DOM, or localStorage.
// ===================================================================================

/**
 * --- ENTITIES ---
 * Simple factory functions to create consistent data structures for our core concepts.
 */
export const TaskFactory = {
  create: ({ description, projectId = null }) => ({
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
  create: ({ space = "Work" } = {}) => ({
    space, // 'Work', 'Personal', 'Project'
  }),
};

export const UserFactory = {
  create: ({ email, password }) => ({
    id: `user_${Date.now()}`,
    email,
    // In a real app, we would hash the password. For this example, we'll store it as is.
    password,
    createdAt: new Date().toISOString(),
  }),
};
