
interface TaskTabsProps {
    currentView: string;
    counts: { [key: string]: string };
    activeFilterProject: string | null;
    onSetCurrentView: (view: string) => void;
    onClearActiveFilterProject: () => void;
  }
  
  const INBOX_OVERLOADED = 8;

  export const TaskTabs = ({ currentView, counts, activeFilterProject, onSetCurrentView, onClearActiveFilterProject }: TaskTabsProps) => {
    return (
      <div className="border-b border-gray-700 mb-8">
        <nav className="flex flex-wrap space-x-1 sm:space-x-2">
          {["inbox", "today", "paused", "done", "spaces"].map((view) => (
            <button
              key={view}
              onClick={() => onSetCurrentView(view)}
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
              onClick={onClearActiveFilterProject}
              className="ml-2 text-xl font-bold text-gray-500 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    );
  };
