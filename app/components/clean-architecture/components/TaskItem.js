// ===================================================================================
// --- LAYER 3: FRAMEWORKS & DRIVERS (REACT UI COMPONENTS) ---
// The outermost layer. Handles rendering and user input.
// It calls use cases to perform actions and receives new state to render.
// ===================================================================================

import { useState } from "react";

// import { Description } from "../../clean-architecture/components/Description-modal";

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
      if (updateText.trim()) {
        onAddUpdate(task.id, updateText.trim());
        setUpdateText("");
        setNoUpdatesError(false);
        setUpdateField(false);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg" data-task-id={task.id}>
      <div className="p-4 flex justify-between items-start">
        <div className="flex-grow">
          <TaskDescription
            setIsDetailsOpen={setIsDetailsOpen}
            isDetailsOpen={isDetailsOpen}
            isEditing={isEditing}
            task={task}
            handleEdit={handleEdit}
            setIsEditing={setIsEditing}
            onProjectFilter={onProjectFilter}
          />

          {task.status === "done" && <DoneRemarks task={task} />}
          {task.status === "paused" && (
            <PausedRemarks
              isEditing={isEditing}
              task={task}
              handleEdit={handleEdit}
              setIsEditing={setIsEditing}
            />
          )}

          {/* {task.status === "paused" && <PauseButton task />} */}

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isDetailsOpen ? "max-h-auto mt-2" : "max-h-0"
            }`}
          >
            <Details
              isEditing={isEditing}
              task={task}
              handleEdit={handleEdit}
              setIsEditing={setIsEditing}
            />

            {task.status !== "inbox" && (
              <Updates
                noUpdatesError={noUpdatesError}
                task={task}
                showUpdateField={showUpdateField}
                updateText={updateText}
                setUpdateText={setUpdateText}
                handleUpdates={handleUpdates}
              />
            )}
          </div>
        </div>
        <ActionIcons
          task={task}
          onAction={onAction}
          setNoUpdatesError={setNoUpdatesError}
          setUpdateField={setUpdateField}
        />
      </div>
      {children}
    </div>
  );
};
function ActionIcons({ task, onAction, setNoUpdatesError, setUpdateField }) {
  return (
    <div className="flex-shrink-0 ml-4 space-x-2">
      {task.status === "inbox" && (
        <button
          onClick={() => onAction(task.id, "today")}
          className="text-xl font-medium  text-orange-500 border-orange-500"
          title="Move to Today"
        >
          🎯
        </button>
      )}
      {task.status === "today" && (
        <>
          <button
            onClick={() => {
              if (task.updates.length === 0) {
                setNoUpdatesError(true);
                setUpdateField(true);
                return;
              }
              onAction(task.id, "done");
            }}
            className="text-xl"
            title="Mark Done"
          >
            ✅
          </button>
          <button
            onClick={() => {
              if (task.updates.length === 0) {
                setNoUpdatesError(true);
                setUpdateField(true);
                return;
              }
              onAction(task.id, "pause");
            }}
            className="text-xl"
            title="Pause"
          >
            ⏸️
          </button>
        </>
      )}
      {task.status === "paused" && (
        <button
          onClick={() => onAction(task.id, "resume")}
          className="text-xl"
          title="Resume Task"
        >
          ▶️
        </button>
      )}
    </div>
  );
}

function DoneRemarks({ task }) {
  return (
    <div className="mt-2 text-sm text-gray-400 border-l-2 border-gray-600 pl-2">
      <b>Reason to Mark as Done: </b>

      {task.doneRemarks && (
        <p className="italic mt-1 font-medium ">{task.doneRemarks}</p>
      )}
      <br></br>
      <p className="mt-1 font-medium">
        Completed: {new Date(task.completedAt).toLocaleString()}
      </p>
    </div>
  );
}

function PausedRemarks({ isEditing, task, handleEdit, setIsEditing }) {
  return (
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
          {task.pausedContext}
          <p className="mt-1 font-medium">
            <br></br>
            Resume: {task.resumeDate}
            {task.resumeDate
              ? new Date(task.resumeDate).toLocaleDateString(undefined, {
                  timeZone: "UTC",
                })
              : "anytime"}
          </p>
        </p>
      )}
    </div>
  );
}

function Updates({
  noUpdatesError,
  task,
  showUpdateField,
  updateText,
  setUpdateText,
  handleUpdates,
}) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Updates:
      </label>
      {noUpdatesError && (
        <span className="text-red-400 text-xs">
          An update is required to Pause or mark as Done.
        </span>
      )}
      <div className="updates-list mt-2 space-y-1">
        {task.updates?.map((update, index) => (
          <p
            key={index}
            className="text-sm text-gray-400 pl-2 border-l border-gray-700"
          >
            {" "}
            - {update}
          </p>
        ))}
      </div>
      {showUpdateField && (
        <textarea
          className="mt-2 w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          placeholder="Add an update..."
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleUpdates();
            }
          }}
        />
      )}
      <button
        className="mt-2 py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white"
        onClick={handleUpdates}
      >
        {showUpdateField ? "Save Update" : "Add Update"}
      </button>
    </div>
  );
}

function Details({ isEditing, task, handleEdit, setIsEditing }) {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Details:
      </label>
      {isEditing === "details" ? (
        <textarea
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          defaultValue={task.details || ""}
          onBlur={(e) => handleEdit("details", e.target.value)}
          autoFocus
        />
      ) : (
        <p
          className="text-sm text-gray-400 min-h-[20px]"
          onClick={() => setIsEditing("details")}
        >
          {task.details || "Add extra detailssss..."}
        </p>
      )}
    </div>
  );
}

function TaskDescription({
  setIsDetailsOpen,
  isDetailsOpen,
  isEditing,
  task,
  handleEdit,
  setIsEditing,
  onProjectFilter,
}) {
  return (
    <div
      className="flex items-center cursor-pointer"
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
          className="text-gray-200"
          onDoubleClick={() => setIsEditing("description")}
        >
          {task.description}
        </p>
      )}
      {task.projectId && (
        <span
          className="ml-2 text-xs bg-gray-700 text-orange-400 px-2 py-1 rounded-full cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onProjectFilter(task.projectId);
          }}
        >
          #{task.projectId}
        </span>
      )}
    </div>
  );
}
