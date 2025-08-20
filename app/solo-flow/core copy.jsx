"use client";

import { useEffect, useState } from "react";
import { TaskItem } from "./task-item";
import Spaces from "./space";

const TASKS_STORAGE_KEY = "solo-flow-tasks";
export function Core() {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState("inbox");
  const [activeFilterProject, setActiveFilterProject] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    show: false,
    showUndo: false,
  });
  const [action, setAction] = useState("");

  // Load tasks from localStorage
  useEffect(() => {
    const space = localStorage.getItem("solo-flow-space");

    const storedTasks = JSON.parse(
      localStorage.getItem(TASKS_STORAGE_KEY + "+" + space) || "[]"
    );
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    const space = localStorage.getItem("solo-flow-space");

    tasks.length > 0 &&
      localStorage.setItem(
        TASKS_STORAGE_KEY + "+" + space,
        JSON.stringify(tasks)
      );
  }, [tasks]);

  // Handle notification timeout
  useEffect(() => {
    if (notification.show) {
      const timeout = setTimeout(
        () => setNotification({ ...notification, show: false }),
        3000
      );
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  const showNotification = (message, showUndo = false) => {
    setNotification({ message, show: true, showUndo });
  };

  const handleUndo = () => {
    if (lastAction) {
      setTasks(lastAction.tasks);
      setLastAction(null);
      showNotification("Action undone");
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const description = e.target[0].value.trim();
    let projectId = null;
    const match = description.match(/\s#([\w-]+)$/);
    if (match) {
      projectId = match[1];
      // description = description.replace(match[0], '').trim();
    }
    if (description) {
      setTasks([
        {
          id: Date.now().toString(),
          description,
          projectId,
          status: "inbox",
          createdAt: new Date().toISOString(),
          updates: [],
        },
        ...tasks,
      ]);
      e.target[0].value = "";
    }
  };

  const handleAction = (taskId, action) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setAction(action);
    setLastAction({ tasks: [...tasks] });
    if (action === "done") {
      setEditingTaskId(taskId);
    } else if (action === "pause") {
      setEditingTaskId(taskId);
    } else {
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status:
                  action === "today"
                    ? "today"
                    : action === "resume"
                    ? "today"
                    : t.status,
                pausedContext: action === "resume" ? null : t.pausedContext,
                resumeDate: action === "resume" ? null : t.resumeDate,
              }
            : t
        )
      );
      setCurrentView("today");
      showNotification(
        `Task ${action === "to-today" ? "moved to Today" : "resumed"}`,
        true
      );
    }
  };

  const handlePauseSubmit = (e) => {
    e.preventDefault();
    setTasks(
      tasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              status: "paused",
              pausedContext: e.target[0].value.trim(),
              resumeDate: e.target[1].value,
            }
          : t
      )
    );
    setCurrentView("pause");
    setEditingTaskId(null);
    showNotification("Task paused", true);
  };

  const handleDoneSubmit = (e) => {
    e.preventDefault();
    setTasks(
      tasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              status: "done",
              doneRemarks: e.target[0].value.trim(),
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setEditingTaskId(null);
    setCurrentView("done");
    showNotification("Task marked as done", true);
  };

  const handleEditField = (taskId, field, value) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, [field]: value.trim() } : t))
    );
    showNotification(
      `${
        field === "description"
          ? "Task"
          : field === "details"
          ? "Details"
          : "Pause context"
      } updated`
    );
  };

  const handleAddUpdate = (taskId, updateText) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updates: [updateText, ...(t.updates || [])],
            }
          : t
      )
    );
    showNotification("Update added");
  };

  const tasksToRender = activeFilterProject
    ? tasks.filter((task) => task.projectId === activeFilterProject)
    : tasks;
  const tasksByStatus = { inbox: [], today: [], paused: [], done: [] };
  tasksToRender.forEach((task) => tasksByStatus[task.status]?.push(task));

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Solo-Flow
        </h1>
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
              </button>
            ))}
          </nav>
          <div className="mt-2 text-sm text-gray-500">
            <span>{counts.inbox}</span>
            <span className="ml-4">{counts.today}</span>
            <span className="ml-4">{counts.paused}</span>
            <span className="ml-4">{counts.done}</span>
          </div>
          <div
            className={`items-center mt-2 ${
              activeFilterProject ? "" : "hidden"
            }`}
          >
            <span className="text-sm mr-2">Filtering by:</span>
            <span className="project-tag">
              {activeFilterProject ? `#${activeFilterProject}` : ""}
            </span>
            <button
              onClick={() => setActiveFilterProject(null)}
              className="ml-2 text-xl font-bold text-gray-500 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>

        <div>
          {["inbox", "today", "paused", "done", "spaces"].map((view) => {
            return (
              <>
                {currentView === "spaces" && view === "spaces" && <Spaces></Spaces>}
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
                  {view === "today" && (
                    <p
                      className={`text-sm text-amber-400 bg-amber-900/50 p-2 rounded-md mb-4 ${
                        tasksByStatus.today.length <= 5 ? "hidden" : ""
                      }`}
                    >
                      A long list can be overwhelming. Consider pausing some
                      tasks to maintain focus.
                    </p>
                  )}
                  {view === "done" && (
                    <p className="text-gray-400 mb-6">
                      Look what you shipped! Reflect and keep the momentum
                      going.
                    </p>
                  )}
                  <div className="space-y-3">
                    {tasksByStatus[view]?.length > 0 ? (
                      tasksByStatus[view]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .filter(
                          (task) =>
                            task.description != "" || task.updates.length > 0
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
                            <div
                              id="pause-form-container"
                              className={`p-4 rounded-b-lg mt-1 ${
                                editingTaskId &&
                                editingTaskId == task.id &&
                                action == "pause"
                                  ? ""
                                  : "hidden"
                              }`}
                            >
                              <p className="font-semibold text-orange-400 mb-3">
                                It’s okay to simplify. Let’s pause this for now
                                with context so Future You knows where to pick
                                up.
                              </p>
                              <form onSubmit={handlePauseSubmit}>
                                <div className="mb-3">
                                  <label
                                    htmlFor="pause-context"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                  >
                                    Why are you pausing?
                                  </label>
                                  <textarea
                                    id="pause-context"
                                    rows="2"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g., Blocked by API issue, feeling tired..."
                                    defaultValue={
                                      tasks.find((t) => t.id === editingTaskId)
                                        ?.pausedContext || ""
                                    }
                                  ></textarea>
                                </div>
                                <div className="mb-4">
                                  <label
                                    htmlFor="resume-date"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                  >
                                    When will you come back?
                                  </label>
                                  <input
                                    type="date"
                                    id="resume-date"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    defaultValue={
                                      tasks.find((t) => t.id === editingTaskId)
                                        ?.resumeDate || ""
                                    }
                                  />
                                </div>
                                <div className="flex justify-end space-x-3">
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
                              id="done-form-container"
                              className={`p-4 rounded-b-lg mt-1 ${
                                editingTaskId &&
                                action === "done" &&
                                editingTaskId == task.id
                                  ? "block"
                                  : "hidden"
                              }`}
                            >
                              <p className="font-semibold text-orange-400 mb-3">
                                Great job! Why is this task done?
                              </p>
                              <form onSubmit={handleDoneSubmit}>
                                <div className="mb-3">
                                  <label
                                    htmlFor="done-remarks"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                  >
                                    Remarks
                                  </label>
                                  <textarea
                                    id="done-remarks"
                                    rows="2"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    placeholder="e.g., Fixed bug, tested successfully..."
                                    defaultValue={
                                      tasks.find((t) => t.id === editingTaskId)
                                        ?.doneRemarks || ""
                                    }
                                  ></textarea>
                                </div>
                                <div className="flex justify-end space-x-3">
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
                        {activeFilterProject
                          ? ` for #${activeFilterProject}`
                          : ""}
                        .
                      </p>
                    )}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </main>
      <div id="notification-toast" className={notification.show ? "show" : ""}>
        <span>{notification.message}</span>
        <button
          onClick={handleUndo}
          className={`ml-4 font-bold text-orange-400 hover:text-orange-300 ${
            notification.showUndo ? "" : "hidden"
          }`}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
