import { TaskItem } from "../clean-architecture/components/TaskItem";
import { Task } from "../clean-architecture/core/entities";

interface TaskListProps {
  tasks: Task[];
  currentView: string;
  editingTaskId: string | null;
  action: string;
  searchQuery: string;
  activeFilterProject: string | null;
  onAction: (taskId: string, actionType: string) => void;
  onEditField: <K extends keyof Task>(
    taskId: string,
    field: K,
    value: Task[K]
  ) => void;
  onAddUpdate: (taskId: string, updateText: string) => void;
  onProjectFilter: (projectId: string | null) => void;
  onPauseSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDoneSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
}

const PauseForm = ({ onSubmit, onCancel }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; }) => {
  return (
    <form onSubmit={onSubmit}>
      <p className="font-semibold text-orange-400 mb-3">
        Pause with context so Future You knows where to pick up.
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
          onClick={onCancel}
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
  );
};

const DoneForm = ({ onSubmit, onCancel }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; }) => {
  return (
    <form onSubmit={onSubmit}>
      <p className="font-semibold text-orange-400 mb-3">
        Great job! Add any final remarks.
      </p>
      <textarea
        id="done-remarks"
        name="done-remarks"
        rows={2}
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
        placeholder="e.g., Fixed bug, tested successfully..."
      ></textarea>
      <div className="flex justify-end space-x-3 mt-3">
        <button
          type="button"
          onClick={onCancel}
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
  );
};

// const TaskItem = ({ task, onAction, onEditField, onAddUpdate, onProjectFilter, children }: { task: Task; onAction: (taskId: string, actionType: string) => void; onEditField: <K extends keyof Task>(taskId: string, field: K, value: Task[K]) => void; onAddUpdate: (taskId: string, updateText: string) => void; onProjectFilter: (projectId: string | null) => void; children: React.ReactNode; }) => {
//     return (
//         <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
//             <div className="flex justify-between items-start">
//                 <span className="font-medium text-white">{task.description}</span>
//                 <div className="flex space-x-2">
//                     <button onClick={() => onAction(task.id, 'done')} className="text-gray-400 hover:text-white">Done</button>
//                     <button onClick={() => onAction(task.id, 'pause')} className="text-gray-400 hover:text-white">Pause</button>
//                     <button onClick={() => onAction(task.id, 'today')} className="text-gray-400 hover:text-white">Today</button>
//                     <button onClick={() => onEditField(task.id, 'description', prompt('New description:', task.description) || task.description)} className="text-gray-400 hover:text-white">Edit</button>
//                     <button onClick={() => onAddUpdate(task.id, prompt('New update:') || '')} className="text-gray-400 hover:text-white">Update</button>
//                 </div>
//             </div>
//             {task.projectId && <span className="text-xs text-gray-400 cursor-pointer" onClick={() => onProjectFilter(task.projectId)}>#{task.projectId}</span>}
//             {children}
//         </div>
//     )
// }

export const TaskList = ({
  tasks,
  currentView,
  editingTaskId,
  action,
  searchQuery,
  activeFilterProject,
  onAction,
  onEditField,
  onAddUpdate,
  onProjectFilter,
  onPauseSubmit,
  onDoneSubmit,
  onCancelEdit,
}: TaskListProps) => {
  const tasksByStatus: { [key: string]: Task[] } = {
    inbox: [],
    today: [],
    paused: [],
    done: [],
  };
  tasks.forEach((task) => {
    if (tasksByStatus[task.status]) tasksByStatus[task.status].push(task);
  });

  return (
    <div>
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
                    onAction={onAction}
                    onEditField={onEditField}
                    onAddUpdate={onAddUpdate}
                    onProjectFilter={onProjectFilter}
                  >
                    <div
                      className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${
                        editingTaskId === task.id && action === "pause"
                          ? ""
                          : "hidden"
                      }`}
                    >
                      <PauseForm onSubmit={onPauseSubmit} onCancel={onCancelEdit} />
                    </div>
                    <div
                      className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${
                        editingTaskId === task.id && action === "done"
                          ? ""
                          : "hidden"
                      }`}
                    >
                      <DoneForm onSubmit={onDoneSubmit} onCancel={onCancelEdit} />
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
  );
};