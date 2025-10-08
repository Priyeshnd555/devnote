import { createLocalStorageRepository } from "../adapters/repositories";
import { createAuthUseCases } from "./authUseCases";
import { TaskFactory, Task,} from "./entities";

/**
 * --- USE CASES ---
 * The "verbs" of the application. They orchestrate entities to perform actions
 * and depend on abstract "repositories" (gateways) for data persistence.
 * This is where all your application's unique rules live.
 */

export const createAppUseCases = () => {
  const { user } = createAuthUseCases().getCurrentUser();
  const taskRepo = createLocalStorageRepository(user?.id);
  const userId = user?.id ?? 'anonymous';

  return {
    // Gets all necessary data to bootstrap the application.
    getInitialState: (): { tasks: Task[] } => {
      const space = localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      return {
        tasks: taskRepo.getAll(space),
      };
    },

    // Pride Guardrail: Quick capture of a task.
    addTask: (
      description: string
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      if (!description || description.trim() === "") {
        return { success: false, error: "Task description cannot be empty." };
      }

      const taskDescription = description;
      const match = description.match(/\s#([\w-]+)$/);
      const projectId = match ? match[1] : null;

      const task = TaskFactory.create({
        description: taskDescription,
        projectId,
      });
      taskRepo.save(task);
      const space = localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
      return {
        success: true,
        tasks: taskRepo.getAll(space),
      };
    },

    // Moves a task to the 'today' list. app/components/clean-architecture/core/useCases.ts
    moveTaskToToday: (
      taskId: string
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task) {
        task.status = "today";
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: "Task not found." };
    },

    // Pauses a task with context.
    pauseTask: (
      taskId: string,
      { context, resumeDate }: { context: string; resumeDate: string }
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task) {
        task.status = "paused";
        task.pausedContext = context;
        task.resumeDate = resumeDate;
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: "Task not found." };
    },

    // Resumes a paused task.
    resumeTask: (
      taskId: string
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task) {
        task.status = "today";
        task.pausedContext = null;
        task.resumeDate = null;
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: "Task not found." };
    },

    // Completes a task with remarks.
    completeTask: (
      taskId: string,
      { remarks }: { remarks: string }
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task) {
        task.status = "done";
        task.doneRemarks = remarks;
        task.completedAt = new Date().toISOString();
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: "Task not found." };
    },

    // Updates a specific field on a task.
    updateTaskField: <K extends keyof Task>(
      taskId: string,
      field: K,
      value: Task[K]
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task && typeof task[field] !== "undefined") {
        task[field] = value;
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: `Task or field '${field}' not found.` };
    },

    // Adds a text update to a task's log.
    addTaskUpdate: (
      taskId: string,
      updateText: string
    ): { success: boolean; tasks?: Task[]; error?: string } => {
      const task = taskRepo.findById(taskId);
      if (task) {
        task.updates = [updateText, ...(task.updates || [])];
        taskRepo.update(task);
        const space =
          localStorage.getItem(`solo-flow-space-${userId}`) || "Work";
        return {
          success: true,
          tasks: taskRepo.getAll(space),
        };
      }
      return { success: false, error: "Task not found." };
    },
  };
};
