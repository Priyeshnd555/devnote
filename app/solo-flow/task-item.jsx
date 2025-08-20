"use client";

import { useState } from "react";

export const TaskItem = ({
  task,
  onAction,
  onEditField,
  onAddUpdate,
  onProjectFilter,
  children,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(
    !!task.details || task.updates?.length > 0
  );
  const [isEditing, setIsEditing] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [showUpdateField, setUpdateField] = useState(false);
  const [noUpdatesError, setNoUpdatesError] = useState(false);

  const handleEdit = (field, value) => {
    setIsEditing(null);
    onEditField(task.id, field, value);
  };

  const handleUpdates = () => {
    if (!showUpdateField) {
      setUpdateField(true);
    } else {
        setUpdateField(false);
        onAddUpdate(task.id, updateText.trim());
        setUpdateText("");
        setNoUpdatesError(false);
    }
  };
  return (
    <div
      className="task-item bg-gray-800 rounded-lg p-4 flex justify-between items-start"
      data-task-id={task.id}
    >
      <div className="flex-grow">
        <div
          className="flex items-center task-details-toggle"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          {isEditing === "description" ? (
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              defaultValue={task.description}
              onBlur={(e) => handleEdit("description", e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && e.target.blur()
              }
              autoFocus
            />
          ) : (
            <p
              className="text-gray-200 editable"
              onClick={() => setIsEditing("description")}
            >
              {task.description}
            </p>
          )}
          {task.projectId && (
            <span
              className="project-tag ml-2"
              onClick={() => onProjectFilter(task.projectId)}
            >
              #{task.projectId}
            </span>
          )}
        </div>
        {task.status === "paused" && (
          <div className="mt-2 text-sm text-gray-400 border-l-2 border-gray-600 pl-2">
            <b>Reason to pause this </b>
            {isEditing === "pausedContext" ? (
              <textarea
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                defaultValue={task.pausedContext}
                onBlur={(e) => handleEdit("pausedContext", e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && e.target.blur()
                }
                autoFocus
              />
            ) : (
              <p
                className="italic editable"
                onClick={() => setIsEditing("pausedContext")}
              >
                "{task.pausedContext}"
              </p>
            )}
            <p className="mt-1 font-medium">
              Resume around:{" "}
              {task.resumeDate
                ? new Date(task.resumeDate).toLocaleDateString(undefined, {
                    timeZone: "UTC",
                  })
                : "anytime"}
            </p>
          </div>
        )}
        <div className={`task-details ${isDetailsOpen ? "open" : ""}`}>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Details :
            </label>
            {isEditing === "details" ? (
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                defaultValue={task.details || ""}
                onBlur={(e) => handleEdit("details", e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && e.target.blur()
                }
                autoFocus
              />
            ) : (
              <p
                className="text-sm text-gray-400 editable"
                onClick={() => setIsEditing("details")}
              >
                {task.details || "Add extra details..."}
              </p>
            )}
          </div>
          {task.status !== "inbox" && (
            <>
              <div className="mt-2" >
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Task Updates :{" "}
                  {noUpdatesError && (
                    <span className="text-red-300">
                      At least one Update is required to mark as Done or Pause
                    </span>
                  )}
                </label>
                <div className="updates-list mt-2 space-y-2">
                  {task.updates?.map((update, index) => (
                    <p key={index} className="text-sm text-gray-400">
                      {update}
                    </p>
                  ))}
                </div>
                {showUpdateField && (
                  <>
                    <textarea
                      className="update-input w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Add an update..."
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      onBlur={handleUpdates}
                      onKeyDown={(e) => {
                        e.key === "Enter" && !e.shiftKey && e.target.blur();
                      }}
                    ></textarea>
                  </>
                )}
              </div>
            <button
                className="add-update-btn mt-2 py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white"
                onClick={handleUpdates}
              >
                 {showUpdateField ? "save update" : <span>Add Update</span>}
              </button>
            </>
          )}
        </div>

        {task.status === "done" && (
          <div>
            <p className="text-xs text-gray-500 mt-1">
              Completed: {new Date(task.completedAt).toLocaleString()}
            </p>
            {task.doneRemarks && (
              <p className="text-xs text-gray-400 mt-1">
                Remarks: {task.doneRemarks}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="task-actions flex-shrink-0 ml-4 space-x-2">
        {task.status === "inbox" && (
          <button
            onClick={() => {
              if (task.details == "") {
                alert();
                return;
              }
              onAction(task.id, "today");
            }}
            className="action-btn"
            title="Move to Today"
          >
            🎯
          </button>
        )}
        {task.status === "today" && (
          <>
            <button
              onClick={() => {
                if (task.updates.length == 0) {
                  setNoUpdatesError(true);
                  handleUpdates();

                  return;
                }
                onAction(task.id, "done");
              }}
              className="action-btn"
              title="Mark Done"
            >
              ✅
            </button>
            <button
              onClick={() => {
                if (task.updates.length == 0) {
                  setNoUpdatesError(true);
                  handleUpdates();
                  return;
                }
                onAction(task.id, "pause");
              }}
              className="action-btn"
              title="Pause"
            >
              ⏸️
            </button>
          </>
        )}
        {task.status === "paused" && (
          <button
            onClick={() => onAction(task.id, "resume")}
            className="action-btn"
            title="Resume Task"
          >
            ▶️
          </button>
        )}
      </div>
      {children}
    </div>
  );
};
