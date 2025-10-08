"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createAppUseCases } from "./src/clean-architecture/core/useCases";
import { createAuthUseCases } from "./src/clean-architecture/core/authUseCases";
import { createSettingsUseCases } from "./src/clean-architecture/core/settingsUseCases";
import { Spaces } from "./src/clean-architecture/ui/Spaces";
import {
  Task,
  User,
} from "./src/clean-architecture/core/entities";
import SignUpModal from "./src/clean-architecture/ui/SignUpModal";
import SignInModal from "./src/clean-architecture/ui/SignInModal";
import AuthPage from "./src/clean-architecture/ui/AuthPage";
import { Header } from "./src/features/Header";
import { SearchBar } from "./src/features/SearchBar";
import { TaskTabs } from "./src/features/TaskTabs";
import { TaskList } from "./src/features/TaskList";
import { Notification } from "./src/features/Notification";

// The main App component, acting as the primary UI driver.
export default function App() {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState(tasks.filter(task=>(task.status == 'today')).length === 0 ? "today": "inbox");
  const [activeFilterProject, setActiveFilterProject] = useState<string | null>(
    null
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [notification, setNotification] = useState("");
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // --- ARCHITECTURE SETUP ---
  const authUseCases = useMemo(() => createAuthUseCases(), []);
  const settingsUseCases = useMemo(() => createSettingsUseCases(), []);
  const appUseCases = useMemo(() => {
    return createAppUseCases();
  }, [currentUser]);


  // --- EFFECTS ---
  useEffect(() => {
    const { user } = authUseCases.getCurrentUser();
    // Only update if the user identity actually changed to avoid re-render loops
    setCurrentUser((prev) => (prev?.id === user?.id ? prev : user));
  }, [authUseCases]);

  useEffect(() => {
    const initialState = appUseCases.getInitialState();
    setTasks(initialState.tasks);
  }, [appUseCases, dataVersion, settingsUseCases,]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- EVENT HANDLERS (These call the use cases) ---
  const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use the controlled state as the single source of truth
    const description = searchQuery.trim();
    if (!description) return;

    // Reset search immediately, then create the task
    setSearchQuery("");
    const result = appUseCases.addTask(description);
    if (result.success) {
      setTasks(result.tasks || []);
      setNotification("Task added to Inbox.");
    }
  };


  const handleAction = (taskId: string, actionType: string) => {
    setAction(actionType);
    if (actionType === "done" || actionType === "pause") {
      setEditingTaskId(taskId);
    } else {
      const result =
        actionType === "today"
          ? appUseCases.moveTaskToToday(taskId)
          : appUseCases.resumeTask(taskId);
      if (result.success) {
        setTasks(result.tasks || []);
        setCurrentView("today");
        setNotification(`Task moved to Today.`);
      }
    }
  };

  const handlePauseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const context = (
      e.currentTarget.elements.namedItem("pause-context") as HTMLTextAreaElement
    ).value;
    const resumeDate = (
      e.currentTarget.elements.namedItem("resume-date") as HTMLInputElement
    ).value;
    const result = appUseCases.pauseTask(editingTaskId!, {
      context,
      resumeDate,
    });
    if (result.success) {
      setTasks(result.tasks || []);
      setEditingTaskId(null);
      setCurrentView("paused");
      setNotification("Task paused.");
    }
  };

  const handleDoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const remarks = (
      e.currentTarget.elements.namedItem("done-remarks") as HTMLTextAreaElement
    ).value;
    const result = appUseCases.completeTask(editingTaskId!, { remarks });
    if (result.success) {
      setTasks(result.tasks || []);
      setEditingTaskId(null);
      setCurrentView("done");
      setNotification("Task marked as done!");
    }
  };

  const handleEditField = <K extends keyof Task>(
    taskId: string,
    field: K,
    value: Task[K]
  ) => {
    const result = appUseCases.updateTaskField(taskId, field, value);
    if (result.success) setTasks(result.tasks || []);
    setNotification(
      `${field.charAt(0).toUpperCase() + field.slice(1)} updated.`
    );
  };

  const handleAddUpdate = (taskId: string, updateText: string) => {
    const result = appUseCases.addTaskUpdate(taskId, updateText);
    if (result.success) {
      setTasks(result.tasks || []);
      setNotification("Update added.");
    }

    if (result.error) {
      setNotification("update Failed.");
    }
  };

  const handleSpaceChange = (newSpace: "Work" | "Personal" | "Project") => {
    const result = settingsUseCases.setSpace(newSpace);
    if (result.success) {
      setDataVersion((v) => v + 1);
      // setCurrentView(tasks.filter(task=>(task.status == "today")).length === 0 ? "today": "inbox"); // Reset view
      setNotification(`Switched to ${newSpace} space.`);
    }
  };

  const handleSignUp = (email: string, password: string) => {
    const { success, user, error } = authUseCases.signUp(email, password);
    if (success) {
      setCurrentUser(user!);
      setIsSignUpModalOpen(false);
    } else {
      alert(error);
    }
  };

  const handleSignIn = (email: string, password: string) => {
    const { success, user, error } = authUseCases.signIn(email, password);
    if (success) {
      setCurrentUser(user!);
      setDataVersion((v) => v + 1);
      setIsSignInModalOpen(false);
    } else {
      alert(error);
    }
  };

  const handleSignOut = () => {
    const { success } = authUseCases.signOut();
    if (success) {
      setCurrentUser(null);
    }
  };

  // --- DERIVED STATE & RENDERING LOGIC ---
  if (!currentUser) {
    return (
      <>
        <AuthPage
          onSignInClick={() => setIsSignInModalOpen(true)}
          onSignUpClick={() => setIsSignUpModalOpen(true)}
        />
        <SignUpModal
          open={isSignUpModalOpen}
          onOpenChange={setIsSignUpModalOpen}
          onSignUp={handleSignUp}
        />
        <SignInModal
          open={isSignInModalOpen}
          onOpenChange={setIsSignInModalOpen}
          onSignIn={handleSignIn}
        />
      </>
    );
  }

  const tasksToRender = tasks
    .filter((task) =>
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((task) =>
      activeFilterProject ? task.projectId === activeFilterProject : true
    );

    const tasksByStatus: { [key: string]: Task[] } = {
      inbox: [],
      today: [],
      paused: [],
      done: [],
    };
    tasksToRender.forEach((task) => {
      if (tasksByStatus[task.status]) tasksByStatus[task.status].push(task);
    });

  const counts = Object.keys(tasksByStatus).reduce((acc, status) => {
    const total = tasks.filter((t) => t.status === status).length;
    const filtered = tasksByStatus[status].length;
    acc[status] =
      total > 0
        ? `${status.charAt(0).toUpperCase() + status.slice(1)}: ${
            activeFilterProject ? `${filtered}/${total}` : total
          }`
        : "";
    return acc;
  }, {} as { [key: string]: string });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900 text-white min-h-screen">
      <style>{`
                body { background-color: #111827; }
                .nav-btn { transition: all 0.2s ease-in-out; }
                .view { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                #notification-toast { position: fixed;  left: 85%; bottom: 20px; transform: translateX(-50%); background-color: #1f2937; color: #f97316; padding: 12px 24px; border-radius: 8px; border: 1px solid #374151; transition: all 0.3s ease-in-out; opacity: 0; pointer-events: none; }
                #notification-toast.show { opacity: 1; pointer-events: auto; }
            `}</style>
      <Header email={currentUser.email} onSignOut={handleSignOut} />

      <main>
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchSubmit={handleTaskSubmit}
        />

        <TaskTabs
          currentView={currentView}
          counts={counts}
          activeFilterProject={activeFilterProject}
          onSetCurrentView={setCurrentView}
          onClearActiveFilterProject={() => setActiveFilterProject(null)}
        />

        <div>
          {currentView === "spaces" && (
            <Spaces
              
              handleSpaceChange={handleSpaceChange}
            />
          )}
          <TaskList
            tasks={tasksToRender}
            currentView={currentView}
            editingTaskId={editingTaskId}
            action={action}
            searchQuery={searchQuery}
            activeFilterProject={activeFilterProject}
            onAction={handleAction}
            onEditField={handleEditField}
            onAddUpdate={handleAddUpdate}
            onProjectFilter={setActiveFilterProject}
            onPauseSubmit={handlePauseSubmit}
            onDoneSubmit={handleDoneSubmit}
            onCancelEdit={() => setEditingTaskId(null)}
          />
        </div>
      </main>
      <Notification notification={notification} />
    </div>
  );
}