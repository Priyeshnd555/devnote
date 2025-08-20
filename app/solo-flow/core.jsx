

"use client";

import React, { useState, useEffect, useMemo } from 'react';

// ===================================================================================
// --- LAYER 1: CORE (ENTITIES & USE CASES) ---
// Pure business logic. No knowledge of React, DOM, or localStorage.
// ===================================================================================

/**
 * --- ENTITIES ---
 * Simple factory functions to create consistent data structures for our core concepts.
 */
const TaskFactory = {
    create: ({
        description,
        projectId = null
    }) => ({
        id: `task_${Date.now()}`,
        description,
        projectId,
        status: 'inbox', // 'inbox', 'today', 'paused', 'done'
        details: '',
        updates: [],
        pausedContext: null,
        resumeDate: null,
        doneRemarks: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
    }),
};

const SettingsFactory = {
    create: ({
        space = 'Work'
    } = {}) => ({
        space, // 'Work', 'Personal', 'Project'
    }),
};


/**
 * --- USE CASES ---
 * The "verbs" of the application. They orchestrate entities to perform actions
 * and depend on abstract "repositories" (gateways) for data persistence.
 * This is where all your application's unique rules live.
 */
const createAppUseCases = (taskRepo, settingsRepo) => ({

    // Gets all necessary data to bootstrap the application.
    getInitialState: () => {
        return {
            tasks: taskRepo.getAll(),
            settings: settingsRepo.get(),
        };
    },

    // Pride Guardrail: Quick capture of a task.
    addTask: (description) => {
        if (!description || description.trim() === '') {
            return { success: false, error: 'Task description cannot be empty.' };
        }

        let taskDescription = description;
        const match = description.match(/\s#([\w-]+)$/);
        const projectId = match ? match[1] : null;

        const task = TaskFactory.create({ description: taskDescription, projectId });
        taskRepo.save(task);
        return { success: true, tasks: taskRepo.getAll() };
    },

    // Moves a task to the 'today' list.
    moveTaskToToday: (taskId) => {
        const task = taskRepo.findById(taskId);
        if (task) {
            task.status = 'today';
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: 'Task not found.' };
    },

    // Pauses a task with context.
    pauseTask: (taskId, { context, resumeDate }) => {
        const task = taskRepo.findById(taskId);
        if (task) {
            task.status = 'paused';
            task.pausedContext = context;
            task.resumeDate = resumeDate;
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: 'Task not found.' };
    },

    // Resumes a paused task.
    resumeTask: (taskId) => {
        const task = taskRepo.findById(taskId);
        if (task) {
            task.status = 'today';
            task.pausedContext = null;
            task.resumeDate = null;
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: 'Task not found.' };
    },

    // Completes a task with remarks.
    completeTask: (taskId, { remarks }) => {
        const task = taskRepo.findById(taskId);
        if (task) {
            task.status = 'done';
            task.doneRemarks = remarks;
            task.completedAt = new Date().toISOString();
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: 'Task not found.' };
    },

    // Updates a specific field on a task.
    updateTaskField: (taskId, field, value) => {
        const task = taskRepo.findById(taskId);
        if (task && typeof task[field] !== 'undefined') {
            task[field] = value;
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: `Task or field '${field}' not found.` };
    },

    // Adds a text update to a task's log.
    addTaskUpdate: (taskId, updateText) => {
        const task = taskRepo.findById(taskId);
        if (task) {
            task.updates = [updateText, ...(task.updates || [])];
            taskRepo.update(task);
            return { success: true, tasks: taskRepo.getAll() };
        }
        return { success: false, error: 'Task not found.' };
    },

    // Changes the current workspace.
    setSpace: (space) => {
        const settings = settingsRepo.get();
        settings.space = space;
        settingsRepo.save(settings);
        // This use case also needs to signal that tasks should be reloaded for the new space.
        const newTasks = taskRepo.getAll(space); // The repo needs to know about the space.
        return { success: true, settings: settingsRepo.get(), tasks: newTasks };
    },
});


// ===================================================================================
// --- LAYER 2: ADAPTERS (GATEWAYS / REPOSITORIES) ---
// Connects the core to the outside world (e.g., localStorage).
// Implements the "ports" that the use cases depend on.
// ===================================================================================

/**
 * A generic repository for storing array-based data in localStorage.
 * It's configured with a base key and can handle different "spaces".
 */
const createLocalStorageRepository = (baseKey) => {
    const getStorageKey = (space) => `${baseKey}+${space}`;

    return {
        getAll: (space) => {
            const activeSpace = space || localStorage.getItem('solo-flow-space') || 'Work';
            return JSON.parse(localStorage.getItem(getStorageKey(activeSpace)) || '[]');
        },
        save: (item) => {
            const space = localStorage.getItem('solo-flow-space') || 'Work';
            const items = JSON.parse(localStorage.getItem(getStorageKey(space)) || '[]');
            items.unshift(item); // Add new items to the top
            localStorage.setItem(getStorageKey(space), JSON.stringify(items));
        },
        update: (updatedItem) => {
            const space = localStorage.getItem('solo-flow-space') || 'Work';
            let items = JSON.parse(localStorage.getItem(getStorageKey(space)) || '[]');
            items = items.map(item => (item.id === updatedItem.id ? updatedItem : item));
            localStorage.setItem(getStorageKey(space), JSON.stringify(items));
        },
        findById: (id) => {
             const space = localStorage.getItem('solo-flow-space') || 'Work';
             const items = JSON.parse(localStorage.getItem(getStorageKey(space)) || '[]');
             return items.find(item => item.id === id);
        }
    };
};

/**
 * A specific repository for storing the user settings object.
 */
const createSettingsRepository = (storageKey) => {
    const defaultSettings = SettingsFactory.create();
    return {
        get: () => {
            const stored = localStorage.getItem(storageKey);
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        },
        save: (settings) => {
            localStorage.setItem(storageKey, JSON.stringify(settings));
            // Also save the current space for the task repo to use.
            localStorage.setItem('solo-flow-space', settings.space);
        },
    };
};


// ===================================================================================
// --- LAYER 3: FRAMEWORKS & DRIVERS (REACT UI COMPONENTS) ---
// The outermost layer. Handles rendering and user input.
// It calls use cases to perform actions and receives new state to render.
// ===================================================================================

const TaskItem = ({ task, onAction, onEditField, onAddUpdate, onProjectFilter, children }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(!!task.details || task.updates?.length > 0);
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
                    <div className="flex items-center cursor-pointer" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                        {isEditing === 'description' ? (
                            <input
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                defaultValue={task.description}
                                onBlur={(e) => handleEdit('description', e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && e.target.blur()}
                                autoFocus
                            />
                        ) : (
                            <p className="text-gray-200" onDoubleClick={() => setIsEditing('description')}>{task.description}</p>
                        )}
                        {task.projectId && (
                            <span className="ml-2 text-xs bg-gray-700 text-orange-400 px-2 py-1 rounded-full cursor-pointer" onClick={(e) => { e.stopPropagation(); onProjectFilter(task.projectId); }}>
                                #{task.projectId}
                            </span>
                        )}
                    </div>

                    {task.status === 'paused' && (
                        <div className="mt-2 text-sm text-gray-400 border-l-2 border-gray-600 pl-2">
                            <p className="italic">"{task.pausedContext}"</p>
                            <p className="mt-1 font-medium">Resume: {task.resumeDate ? new Date(task.resumeDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'anytime'}</p>
                        </div>
                    )}

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDetailsOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                         <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Details:</label>
                             {isEditing === 'details' ? (
                                <textarea
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    defaultValue={task.details || ''}
                                    onBlur={(e) => handleEdit('details', e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <p className="text-sm text-gray-400 min-h-[20px]" onDoubleClick={() => setIsEditing('details')}>{task.details || 'Add extra details...'}</p>
                            )}
                        </div>

                        {task.status !== 'inbox' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Updates:</label>
                                {noUpdatesError && <span className="text-red-400 text-xs">An update is required to Pause or mark as Done.</span>}
                                <div className="updates-list mt-2 space-y-1">
                                    {task.updates?.map((update, index) => <p key={index} className="text-sm text-gray-400 pl-2 border-l border-gray-700"> - {update}</p>)}
                                </div>
                                {showUpdateField && (
                                    <textarea
                                        className="mt-2 w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Add an update..."
                                        value={updateText}
                                        onChange={(e) => setUpdateText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUpdates(); } }}
                                    />
                                )}
                                <button className="mt-2 py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white" onClick={handleUpdates}>
                                    {showUpdateField ? 'Save Update' : 'Add Update'}
                                </button>
                            </div>
                        )}
                    </div>
                     {task.status === 'done' && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500">Completed: {new Date(task.completedAt).toLocaleString()}</p>
                            {task.doneRemarks && <p className="text-xs text-gray-400 mt-1">Remarks: {task.doneRemarks}</p>}
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 ml-4 space-x-2">
                    {task.status === 'inbox' && <button onClick={() => onAction(task.id, 'today')} className="text-xl" title="Move to Today">🎯</button>}
                    {task.status === 'today' && (
                        <>
                            <button onClick={() => { if (task.updates.length === 0) { setNoUpdatesError(true); setUpdateField(true); return; } onAction(task.id, 'done'); }} className="text-xl" title="Mark Done">✅</button>
                            <button onClick={() => { if (task.updates.length === 0) { setNoUpdatesError(true); setUpdateField(true); return; } onAction(task.id, 'pause'); }} className="text-xl" title="Pause">⏸️</button>
                        </>
                    )}
                    {task.status === 'paused' && <button onClick={() => onAction(task.id, 'resume')} className="text-xl" title="Resume Task">▶️</button>}
                </div>
            </div>
            {children}
        </div>
    );
};

const Spaces = ({ currentSpace, onSpaceChange }) => {
    const options = [
        { id: 'space-work', value: 'Work', label: 'Work Day' },
        { id: 'space-personal', value: 'Personal', label: 'Personal Day' },
        { id: 'space-project', value: 'Project', label: 'Project Day' },
    ];
    return (
        <div className="max-w-md w-full p-4">
            <fieldset>
                <legend className="text-lg font-semibold text-white mb-4">Select Your Current Space</legend>
                <div className="space-y-3">
                    {options.map(option => (
                        <label key={option.id} htmlFor={option.id} className="flex items-center justify-between w-full p-4 cursor-pointer bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800">
                            <span className="text-gray-200 font-medium">{option.label}</span>
                            <input
                                type="radio"
                                id={option.id}
                                name="space"
                                value={option.value}
                                checked={currentSpace === option.value}
                                onChange={(e) => onSpaceChange(e.target.value)}
                                className="form-radio h-5 w-5 text-orange-600 bg-gray-700 border-gray-600 focus:ring-orange-500"
                            />
                        </label>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

// The main App component, acting as the primary UI driver.
export default function App() {
    // --- STATE MANAGEMENT ---
    const [tasks, setTasks] = useState([]);
    const [settings, setSettings] = useState(SettingsFactory.create());
    const [currentView, setCurrentView] = useState('inbox');
    const [activeFilterProject, setActiveFilterProject] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [action, setAction] = useState('');
    const [notification, setNotification] = useState('');

    // --- ARCHITECTURE SETUP ---
    // useMemo ensures these are created only once.
    const { taskRepository, settingsRepository, useCases } = useMemo(() => {
        const taskRepo = createLocalStorageRepository('solo-flow-tasks');
        const settingsRepo = createSettingsRepository('solo-flow-settings');
        const appUseCases = createAppUseCases(taskRepo, settingsRepo);
        return { taskRepository: taskRepo, settingsRepository: settingsRepo, useCases: appUseCases };
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
            const timer = setTimeout(() => setNotification(''), 3000);
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
            e.target[0].value = '';
            setNotification('Task added to Inbox.');
        }
    };

    const handleAction = (taskId, actionType) => {
        setAction(actionType);
        if (actionType === 'done' || actionType === 'pause') {
            setEditingTaskId(taskId);
        } else {
            const result = actionType === 'today' ? useCases.moveTaskToToday(taskId) : useCases.resumeTask(taskId);
            if (result.success) {
                setTasks(result.tasks);
                setCurrentView('today');
                setNotification(`Task moved to Today.`);
            }
        }
    };
    
    const handlePauseSubmit = (e) => {
        e.preventDefault();
        const context = e.target.elements['pause-context'].value;
        const resumeDate = e.target.elements['resume-date'].value;
        const result = useCases.pauseTask(editingTaskId, { context, resumeDate });
        if(result.success) {
            setTasks(result.tasks);
            setEditingTaskId(null);
            setCurrentView('paused');
            setNotification('Task paused.');
        }
    };

    const handleDoneSubmit = (e) => {
        e.preventDefault();
        const remarks = e.target.elements['done-remarks'].value;
        const result = useCases.completeTask(editingTaskId, { remarks });
        if(result.success) {
            setTasks(result.tasks);
            setEditingTaskId(null);
            setCurrentView('done');
            setNotification('Task marked as done!');
        }
    };

    const handleEditField = (taskId, field, value) => {
        const result = useCases.updateTaskField(taskId, field, value);
        if(result.success) setTasks(result.tasks);
        setNotification(`${field.charAt(0).toUpperCase() + field.slice(1)} updated.`);
    };

    const handleAddUpdate = (taskId, updateText) => {
        const result = useCases.addTaskUpdate(taskId, updateText);
        if(result.success) setTasks(result.tasks);
        setNotification('Update added.');
    };

    const handleSpaceChange = (newSpace) => {
        const result = useCases.setSpace(newSpace);
        if (result.success) {
            setSettings(result.settings);
            setTasks(result.tasks); // Reload tasks for the new space
            setCurrentView('inbox'); // Reset view
            setNotification(`Switched to ${newSpace} space.`);
        }
    };


    // --- DERIVED STATE & RENDERING LOGIC ---
    const tasksToRender = activeFilterProject ? tasks.filter(task => task.projectId === activeFilterProject) : tasks;
    const tasksByStatus = { inbox: [], today: [], paused: [], done: [] };
    tasksToRender.forEach(task => { if (tasksByStatus[task.status]) tasksByStatus[task.status].push(task) });

    const counts = Object.keys(tasksByStatus).reduce((acc, status) => {
        const total = tasks.filter(t => t.status === status).length;
        const filtered = tasksByStatus[status].length;
        acc[status] = total > 0 ? `${status.charAt(0).toUpperCase() + status.slice(1)}: ${activeFilterProject ? `${filtered}/${total}` : total}` : '';
        return acc;
    }, {});


    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900 text-white min-h-screen">
            <style>{`
                body { background-color: #111827; }
                .nav-btn { transition: all 0.2s ease-in-out; }
                .view { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                #notification-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #1f2937; color: #f97316; padding: 12px 24px; border-radius: 8px; border: 1px solid #374151; transition: all 0.3s ease-in-out; opacity: 0; pointer-events: none; }
                #notification-toast.show { opacity: 1; pointer-events: auto; }
            `}</style>
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Solo-Flow</h1>
                <p className="mt-2 text-lg text-gray-400">Your co-pilot for focused, sustainable development.</p>
            </header>

            <main>
                <div className="mb-8">
                    <form onSubmit={handleTaskSubmit} className="relative">
                        <input type="text" placeholder="Fix login bug #api (use # for projects)" className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" />
                    </form>
                </div>

                <div className="border-b border-gray-700 mb-8">
                    <nav className="flex flex-wrap space-x-1 sm:space-x-2">
                        {['inbox', 'today', 'paused', 'done', 'spaces'].map(view => (
                            <button key={view} onClick={() => setCurrentView(view)} className={`nav-btn py-2 px-4 font-medium border-b-2 ${currentView === view ? 'text-orange-500 border-orange-500' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                {view.charAt(0).toUpperCase() + view.slice(1)}
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
                            <button onClick={() => setActiveFilterProject(null)} className="ml-2 text-xl font-bold text-gray-500 hover:text-white">&times;</button>
                        </div>
                    )}
                </div>

                <div>
                    {currentView === 'spaces' && <Spaces currentSpace={settings.space} onSpaceChange={handleSpaceChange} />}
                    {['inbox', 'today', 'paused', 'done'].map(view => (
                        <div key={view} className={`view ${currentView === view ? '' : 'hidden'}`}>
                            <h2 className="text-2xl font-semibold text-white mb-4">
                                {view === 'inbox' && '📥 Inbox'}
                                {view === 'today' && "🎯 Today's Focus"}
                                {view === 'paused' && '🚧 Paused'}
                                {view === 'done' && '🏁 Progress Log'}
                            </h2>
                             {view === 'today' && tasksByStatus.today.length > 5 && (
                                <p className="text-sm text-amber-400 bg-amber-900/50 p-2 rounded-md mb-4">A long list can be overwhelming. Consider pausing some tasks to maintain focus.</p>
                            )}
                            <div className="space-y-3">
                                {tasksByStatus[view]?.length > 0 ? (
                                    tasksByStatus[view]
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .map(task => (
                                            <TaskItem key={task.id} task={task} onAction={handleAction} onEditField={handleEditField} onAddUpdate={handleAddUpdate} onProjectFilter={setActiveFilterProject}>
                                                {/* Pause and Done forms are now children */}
                                                <div className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${editingTaskId === task.id && action === 'pause' ? '' : 'hidden'}`}>
                                                    <form onSubmit={handlePauseSubmit}>
                                                        <p className="font-semibold text-orange-400 mb-3">Pause with context so Future You knows where to pick up.</p>
                                                        <textarea id="pause-context" rows="2" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="e.g., Blocked by API issue..."></textarea>
                                                        <input type="date" id="resume-date" className="mt-2 w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                                        <div className="flex justify-end space-x-3 mt-3">
                                                            <button type="button" onClick={() => setEditingTaskId(null)} className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium">Cancel</button>
                                                            <button type="submit" className="py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white">Confirm Pause</button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className={`bg-gray-800 p-4 rounded-b-lg mt-1 ${editingTaskId === task.id && action === 'done' ? '' : 'hidden'}`}>
                                                    <form onSubmit={handleDoneSubmit}>
                                                        <p className="font-semibold text-orange-400 mb-3">Great job! Add any final remarks.</p>
                                                        <textarea id="done-remarks" rows="2" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="e.g., Fixed bug, tested successfully..."></textarea>
                                                        <div className="flex justify-end space-x-3 mt-3">
                                                            <button type="button" onClick={() => setEditingTaskId(null)} className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium">Cancel</button>
                                                            <button type="submit" className="py-1 px-3 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-medium text-white">Confirm Done</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </TaskItem>
                                        ))
                                ) : (
                                    <p className="text-gray-500 italic mt-4">No tasks in this view{activeFilterProject ? ` for #${activeFilterProject}` : ''}.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <div id="notification-toast" className={notification ? 'show' : ''}>
                <span>{notification}</span>
            </div>
        </div>
    );
}
