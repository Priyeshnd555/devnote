import {
  createLocalStorageRepository,
  createSettingsRepository,
} from "../adapters/repositories";
import { TaskFactory, Task, Settings, User } from "./entities";

/**
 * --- USE CASES ---
 * The "verbs" of the application. They orchestrate entities to perform actions
 * and depend on abstract "repositories" (gateways) for data persistence.
 * This is where all your application's unique rules live.
 */

export const createAppUseCases = (user: User | null) => {
  const userId = user?.id ?? "anonymous";
  const taskRepo = createLocalStorageRepository(userId);
  const settingsRepo = createSettingsRepository();

  return {
    // Gets all necessary data to bootstrap the application.
    getInitialState: (): { tasks: Task[]; settings: Settings } => {
      const settings = settingsRepo.get();
      return {
        tasks: taskRepo.getAll(settings.space),
        settings: settings,
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
      taskRepo.save(task, userId);
      return {
        success: true,
        tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
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
        return {
          success: true,
          tasks: taskRepo.getAll(settingsRepo.get().space),
        };
      }
      return { success: false, error: "Task not found." };
    },

    // Changes the current workspace.
    setSpace: (
      space: "Work" | "Personal" | "Project"
    ): { success: boolean; settings: Settings; tasks: Task[] } => {
      const settings = settingsRepo.get();
      settings.space = space;
      console.log("=================", settings);
      settingsRepo.save(settings);
      // This use case also needs to signal that tasks should be reloaded for the new space.
      const newTasks = taskRepo.getAll(space); // The repo needs to know about the space.
      return { success: true, settings: settingsRepo.get(), tasks: newTasks };
    },
  };
};
