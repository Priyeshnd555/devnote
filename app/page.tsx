"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createAppUseCases } from "./components/clean-architecture/core/useCases";
import { createAuthUseCases } from "./components/clean-architecture/core/authUseCases";
import { createSettingsUseCases } from "./components/clean-architecture/core/settingsUseCases";
import { TaskItem } from "./components/clean-architecture/components/TaskItem";
import { Spaces } from "./components/clean-architecture/components/Spaces";
import {
  SettingsFactory,
  Task,
  Settings,
  User,
} from "./components/clean-architecture/core/entities";
import SignUpModal from "./components/clean-architecture/components/SignUpModal";
import SignInModal from "./components/clean-architecture/components/SignInModal";
import AuthPage from "./components/clean-architecture/components/AuthPage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const INBOX_OVERLOADED = 8;

// The main App component, acting as the primary UI driver.
export default function App() {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(SettingsFactory.create());
  const [currentView, setCurrentView] = useState("inbox");
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
    return createAppUseCases(currentUser);
  }, [currentUser]);

  // --- EFFECTS ---
  useEffect(() => {
    const { user } = authUseCases.getCurrentUser();
    // Only update if the user identity actually changed to avoid re-render loops
    setCurrentUser((prev) => (prev?.id === user?.id ? prev : user));
  }, [authUseCases]);

  useEffect(() => {
    const initialState = appUseCases.getInitialState();
    const initialSettings = settingsUseCases.getSettings();
    setTasks(initialState.tasks);
    setSettings(initialSettings);
  }, [appUseCases, dataVersion, settingsUseCases]);

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

  const handleSearch = () => {
    // The filtering is already done in the tasksToRender
    // This function is just to trigger the search when the icon is clicked
    if (!searchQuery) {
      setSearchQuery("");
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
      setSettings(result.settings);
      setDataVersion((v) => v + 1);
      setCurrentView("inbox"); // Reset view
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
      <header className="text-center mb-10">
        {/* <h1 className="text-4xl font-bold tracking-tight">DevNote</h1> */}

        <p className="mt-2 text-lg text-gray-400">
          Become a better engineer. &nbsp;
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-lg text-gray-400 hover:text-white">
                :::
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleSignOut}>
                Sign Out {currentUser.email}{" "}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </p>
      </header>

      <main>
        <div className="mb-8">
          <form onSubmit={handleTaskSubmit} className="relative">
            <input
              type="text"
              placeholder="Search tasks or add a new one..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              onClick={handleSearch}
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </form>
        </div>

        <div className="border-b border-gray-700 mb-8">
          <nav className="flex flex-wrap space-x-1 sm:space-x-2">
            {["inbox", "today", "paused", "done", "spaces"].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`nav-btn py-2 px-4 font-medium border-b-2 ${
                  currentView === view
                    ? "text-orange-500 border-orange-500"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
                {view === "inbox" &&
                  parseInt(counts.inbox?.split(":")?.[1]?.trim() ?? "0") >
                    INBOX_OVERLOADED && <span className="mt-1"> 🔥 </span>}
              </button>
            ))}
          </nav>
          <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-x-4">
            <span>{counts.inbox}</span>
            <span>{counts.today}</span>
            <span>{counts.paused}</span>
            <span>{counts.done}</span>
          </div>
          {activeFilterProject && (
            <div className="items-center mt-2 flex">
              <span className="text-sm mr-2 text-gray-400">Filtering by:</span>
              <span className="text-xs bg-gray-700 text-orange-400 px-2 py-1 rounded-full">{`#${activeFilterProject}`}</span>
              <button
                onClick={() => setActiveFilterProject(null)}
                className="ml-2 text-xl font-bold text-gray-500 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        <div>
          {currentView === "spaces" && (
            <Spaces
              currentSpace={settings.space}
              handleSpaceChange={handleSpaceChange}
            />
          )}
          {["inbox", "today", "paused", "done"].map((view) => (
            <div
              key={view}
              className={`view ${
                searchQuery ? '' : currentView === view ? '' : 'hidden'
              }`}>
              {view === "today" && tasksByStatus[view].length > 5 && (
                <p className="text-sm text-amber-400 bg-amber-900/50 p-2 rounded-md mb-4">
                  A long list can be overwhelming. Consider pausing some tasks
                  to maintain focus.
                </p>
              )}
              <div className="space-y-3">
                {tasksByStatus[view]?.length > 0 ? (
                  tasksByStatus[view]
                    .sort(
                      (a, b) =>
                        new Date(
                          view === "done" ? b.completedAt! : b.createdAt
                        ).getTime() -
                        new Date(
                          view === "done" ? a.completedAt! : a.createdAt
                        ).getTime()
                    )
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onAction={handleAction}
                        onEditField={handleEditField}
                        onAddUpdate={handleAddUpdate}
                        onProjectFilter={setActiveFilterProject}
                      >
                        {/* Pause and Done forms are now children */}
                        <div
                          className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${
                            editingTaskId === task.id && action === "pause"
                              ? ""
                              : "hidden"
                          }`}
                        >
                          <form onSubmit={handlePauseSubmit}>
                            <p className="font-semibold text-orange-400 mb-3">
                              Pause with context so Future You knows where to
                              pick up.
                            </p>
                            <textarea
                              name="pause-context"
                              rows={2}
                              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              placeholder="e.g., Blocked by API issue..."
                            ></textarea>
                            <input
                              type="date"
                              name="resume-date"
                              className="mt-2 w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <div className="flex justify-end space-x-3 mt-3">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white"
                              >
                                Confirm Pause
                              </button>
                            </div>
                          </form>
                        </div>
                        <div
                          className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${
                            editingTaskId === task.id && action === "done"
                              ? ""
                              : "hidden"
                          }`}
                        >
                          <form onSubmit={handleDoneSubmit}>
                            <p className="font-semibold text-orange-400 mb-3">
                              Great job! Add any final remarks.
                            </p>
                            <textarea
                              id="done-remarks"
                              rows={2}
                              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              placeholder="e.g., Fixed bug, tested successfully..."
                            ></textarea>
                            <div className="flex justify-end space-x-3 mt-3">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white"
                              >
                                Confirm Done
                              </button>
                            </div>
                          </form>
                        </div>
                      </TaskItem>
                    ))
                ) : (
                  <p className="text-gray-500 italic mt-4">
                    No tasks in this view
                    {activeFilterProject ? ` for #${activeFilterProject}` : ""}.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <div id="notification-toast" className={notification ? "show" : ""}>
        <span>{notification}</span>
      </div>
    </div>
  );
}
