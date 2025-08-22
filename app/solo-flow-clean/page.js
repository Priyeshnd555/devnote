"use client";

import { useEffect, useMemo, useState } from "react";
import { createAppUseCases } from "./(src)/components/clean-architecture/core/useCases";
import { Spaces } from "../../app/solo-flow-clean/(src)/components/clean-architecture/components/Spaces";
import { TaskItem } from "../../app/solo-flow-clean/(src)/components/clean-architecture/components/TaskItem";
import { SettingsFactory } from "./(src)/components/clean-architecture/core/entities";

const INBOX_OVERLOADED = 8;

// The main App component, acting as the primary UI driver.
export default function App() {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(SettingsFactory.create());
  const [currentView, setCurrentView] = useState("inbox");
  const [activeFilterProject, setActiveFilterProject] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [action, setAction] = useState("");
  const [notification, setNotification] = useState("");

  // --- ARCHITECTURE SETUP ---
  // useMemo ensures these are created only once.
  const { useCases } = useMemo(() => {
    const appUseCases = createAppUseCases();
    return {
      useCases: appUseCases,
    };
  }, []);

  // --- EFFECTS ---
  // Load initial data on mount
  useEffect(() => {
    const { tasks, settings } = useCases.getInitialState();
    setTasks(tasks);
    setSettings(settings);
  }, [useCases]);

  // Show notification and clear it after a delay
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- EVENT HANDLERS (These call the use cases) ---
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const description = e.target[0].value.trim();
    const result = useCases.addTask(description);
    if (result.success) {
      setTasks(result.tasks);
      e.target[0].value = "";
      setNotification("Task added to Inbox.");
    }
  };

  const handleAction = (taskId, actionType) => {
    setAction(actionType);
    if (actionType === "done" || actionType === "pause") {
      setEditingTaskId(taskId);
    } else {
      const result =
        actionType === "today"
          ? useCases.moveTaskToToday(taskId)
          : useCases.resumeTask(taskId);
      if (result.success) {
        setTasks(result.tasks);
        setCurrentView("today");
        setNotification(`Task moved to Today.`);
      }
    }
  };

  const handlePauseSubmit = (e) => {
    e.preventDefault();
    const context = e.target.elements["pause-context"].value;
    const resumeDate = e.target.elements["resume-date"].value;
    const result = useCases.pauseTask(editingTaskId, { context, resumeDate });
    if (result.success) {
      setTasks(result.tasks);
      setEditingTaskId(null);
      setCurrentView("paused");
      setNotification("Task paused.");
    }
  };

  const handleDoneSubmit = (e) => {
    e.preventDefault();
    const remarks = e.target.elements["done-remarks"].value;
    const result = useCases.completeTask(editingTaskId, { remarks });
    if (result.success) {
      setTasks(result.tasks);
      setEditingTaskId(null);
      setCurrentView("done");
      setNotification("Task marked as done!");
    }
  };

  const handleEditField = (taskId, field, value) => {
    const result = useCases.updateTaskField(taskId, field, value);
    if (result.success) setTasks(result.tasks);
    setNotification(
      `${field.charAt(0).toUpperCase() + field.slice(1)} updated.`
    );
  };

  const handleAddUpdate = (taskId, updateText) => {
    const result = useCases.addTaskUpdate(taskId, updateText);
    if (result.success) {
      setTasks(result.tasks);
      setNotification("Update added.");
    }

    if (result.error) {
      setNotification("update Failed.");
    }
  };

  const handleSpaceChange = (newSpace) => {
    const result = useCases.setSpace(newSpace);
    console.log("=======space change");
    if (result.success) {
      setSettings(result.settings);
      setTasks(result.tasks); // Reload tasks for the new space
      setCurrentView("inbox"); // Reset view
      setNotification(`Switched to ${newSpace} space.`);
    }
  };

  // --- DERIVED STATE & RENDERING LOGIC ---
  const tasksToRender = activeFilterProject
    ? tasks.filter((task) => task.projectId === activeFilterProject)
    : tasks;
  const tasksByStatus = { inbox: [], today: [], paused: [], done: [] };
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
  }, {});

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
        <h1 className="text-4xl font-bold tracking-tight">Solo-Leveling</h1>
        {/* <h1 className="text-4xl font-bold tracking-tight">Day2Day</h1> */}

        <p className="mt-2 text-lg text-gray-400">
          Your co-pilot for focused, sustainable development.
        </p>
      </header>

      <main>
        <div className="mb-8">
          <form onSubmit={handleTaskSubmit} className="relative">
            <input
              type="text"
              placeholder="Fix login bug #api (use # for projects)"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </form>
        </div>

        <div className="border-b border-gray-700 mb-8">
          <nav className="flex flex-wrap space-x-1 sm:space-x-2">
            {["inbox", "today", "paused", "done", "spaces", "more"].map(
              (view) => (
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
                    parseInt(counts.inbox?.split(":")?.[1]?.trim() ?? 0) >
                      INBOX_OVERLOADED && <span className="mt-1"> 🔥 </span>}
                </button>
              )
            )}
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
          {["inbox", "today", "paused", "done", "more"].map((view) => (
            <div
              key={view}
              className={`view ${currentView === view ? "" : "hidden"}`}
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                {view === "inbox" && "📥 Inbox"}
                {view === "today" && "🎯 Today's Focus"}
                {view === "paused" && "🚧 Paused"}
                {view === "done" && "🏁 Progress Log"}
              </h2>
              {view === "today" && tasksByStatus.today.length > 5 && (
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
                          view === "done" ? b.completedAt : b.createdAt
                        ) -
                        new Date(view === "done" ? a.completedAt : a.createdAt)
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
                              rows="2"
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
                              rows="2"
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
