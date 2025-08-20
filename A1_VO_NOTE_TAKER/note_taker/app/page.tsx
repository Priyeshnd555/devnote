"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BarChart3, Brain, AlertTriangle, Clock, Network } from "lucide-react"
import { TaskCapture } from "@/components/task-capture"
import { ContextPanel } from "@/components/context-panel"
import { ContextBreadcrumbs } from "@/components/context-breadcrumbs"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { IntelligentSurfacing } from "@/components/intelligent-surfacing"
import { DependencyMapper } from "@/components/dependency-mapper"

// Extended Task interface to include dependency tracking
export interface Task {
  id: string
  title: string
  description: string
  status: "active" | "paused" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  context: {
    environment?: string
    relatedSystems?: string[]
    dependencies?: string[]
    lastAction?: string
    nextSteps?: string[]
  }
  timeSpent: number
  estimatedTime?: number
  contextSnapshots?: ContextSnapshot[]
  lastActiveSession?: SessionData
  // Added dependency fields
  dependsOn?: string[] // Task IDs this task depends on
  blockedBy?: string[] // Task IDs that block this task
  blocks?: string[] // Task IDs this task blocks
  relatedTasks?: string[] // Task IDs of related tasks
  dependencyNotes?: string // Notes about dependencies
}

export interface ContextSnapshot {
  id: string
  timestamp: Date
  action: string
  details: string
  environment?: string
  files?: string[]
  commands?: string[]
  notes?: string
}

export interface SessionData {
  startTime: Date
  endTime?: Date
  duration: number
  actions: string[]
  filesModified?: string[]
  commandsRun?: string[]
  contextSwitches: number
}

export interface WorkSession {
  id: string
  taskId: string
  startTime: Date
  endTime?: Date
  snapshots: ContextSnapshot[]
  isActive: boolean
}

// Added dependency analysis interface
export interface DependencyAnalysis {
  circularDependencies: string[][]
  blockedChains: { taskId: string; blockedBy: string[]; depth: number }[]
  criticalPath: string[]
  orphanedTasks: string[]
  dependencyHealth: "healthy" | "warning" | "critical"
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([])
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null)
  const [contextHistory, setContextHistory] = useState<ContextSnapshot[]>([])
  const [lastTaskSwitch, setLastTaskSwitch] = useState<Date | null>(null)
  const [currentView, setCurrentView] = useState<"tasks" | "dashboard" | "dependencies">("tasks")
  const [surfacingEnabled, setSurfacingEnabled] = useState(true)
  const [surfacingMode, setSurfacingMode] = useState<"smart" | "priority" | "urgency">("smart")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = filterStatus === "all" || task.status === filterStatus

    return matchesSearch && matchesFilter
  })

  // Added dependency analysis logic
  const dependencyAnalysis = useMemo((): DependencyAnalysis => {
    const circularDependencies: string[][] = []
    const blockedChains: { taskId: string; blockedBy: string[]; depth: number }[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    // Detect circular dependencies using DFS
    const detectCircular = (taskId: string, path: string[]): void => {
      if (recursionStack.has(taskId)) {
        const cycleStart = path.indexOf(taskId)
        if (cycleStart !== -1) {
          circularDependencies.push(path.slice(cycleStart))
        }
        return
      }

      if (visited.has(taskId)) return

      visited.add(taskId)
      recursionStack.add(taskId)

      const task = tasks.find((t) => t.id === taskId)
      const dependencies = task?.dependsOn || []

      for (const depId of dependencies) {
        detectCircular(depId, [...path, taskId])
      }

      recursionStack.delete(taskId)
    }

    // Analyze blocked chains
    const analyzeBlockedChains = (taskId: string, depth = 0, visited = new Set<string>()): string[] => {
      if (visited.has(taskId) || depth > 10) return []
      visited.add(taskId)

      const task = tasks.find((t) => t.id === taskId)
      if (!task) return []

      const blockers = task.blockedBy || []
      if (blockers.length === 0) return []

      const allBlockers: string[] = []
      for (const blockerId of blockers) {
        allBlockers.push(blockerId)
        allBlockers.push(...analyzeBlockedChains(blockerId, depth + 1, new Set(visited)))
      }

      return [...new Set(allBlockers)]
    }

    // Run analysis
    for (const task of tasks) {
      detectCircular(task.id, [])

      const blockers = analyzeBlockedChains(task.id)
      if (blockers.length > 0) {
        blockedChains.push({
          taskId: task.id,
          blockedBy: blockers,
          depth: blockers.length,
        })
      }
    }

    // Find critical path (longest dependency chain)
    const findCriticalPath = (): string[] => {
      let longestPath: string[] = []

      const dfs = (taskId: string, path: string[], visited: Set<string>): void => {
        if (visited.has(taskId)) return
        visited.add(taskId)

        const task = tasks.find((t) => t.id === taskId)
        const dependencies = task?.dependsOn || []

        if (dependencies.length === 0) {
          if (path.length > longestPath.length) {
            longestPath = [...path]
          }
          return
        }

        for (const depId of dependencies) {
          dfs(depId, [...path, depId], new Set(visited))
        }
      }

      for (const task of tasks) {
        dfs(task.id, [task.id], new Set())
      }

      return longestPath
    }

    const criticalPath = findCriticalPath()
    const orphanedTasks = tasks
      .filter((task) => !task.dependsOn?.length && !task.blocks?.length && !task.relatedTasks?.length)
      .map((task) => task.id)

    const dependencyHealth: "healthy" | "warning" | "critical" =
      circularDependencies.length > 0 ? "critical" : blockedChains.length > 3 ? "warning" : "healthy"

    return {
      circularDependencies,
      blockedChains,
      criticalPath,
      orphanedTasks,
      dependencyHealth,
    }
  }, [tasks])

  const intelligentlyOrderedTasks = useMemo(() => {
    if (!surfacingEnabled) {
      return filteredTasks
    }

    const now = new Date()
    const tasksWithScores = filteredTasks.map((task) => {
      let score = 0

      // Priority scoring (0-40 points)
      const priorityScores = { low: 10, medium: 20, high: 30, critical: 40 }
      score += priorityScores[task.priority]

      // Staleness scoring (0-30 points)
      const daysSinceUpdate = (now.getTime() - task.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate > 7) score += 30
      else if (daysSinceUpdate > 3) score += 20
      else if (daysSinceUpdate > 1) score += 10

      // Status urgency (0-25 points)
      const statusScores = { blocked: 25, active: 15, paused: 10, completed: 0 }
      score += statusScores[task.status] || 0

      // Added dependency-aware scoring (0-20 points)
      // Tasks that block others get higher priority
      const blocksCount = task.blocks?.length || 0
      score += Math.min(blocksCount * 5, 15)

      // Tasks with resolved dependencies get priority boost
      const unresolvedDeps = (task.dependsOn || []).filter((depId) => {
        const depTask = tasks.find((t) => t.id === depId)
        return depTask && depTask.status !== "completed"
      }).length
      if (unresolvedDeps === 0 && (task.dependsOn?.length || 0) > 0) {
        score += 10 // Boost for tasks ready to start
      }

      // Context activity bonus (0-15 points)
      const recentSnapshots =
        task.contextSnapshots?.filter(
          (snapshot) => now.getTime() - snapshot.timestamp.getTime() < 24 * 60 * 60 * 1000,
        ) || []
      score += Math.min(recentSnapshots.length * 3, 15)

      // Time investment factor (0-10 points)
      const hoursSpent = task.timeSpent / (1000 * 60 * 60)
      if (hoursSpent > 4) score += 10
      else if (hoursSpent > 2) score += 5
      else if (hoursSpent > 1) score += 3

      return { ...task, intelligenceScore: score }
    })

    switch (surfacingMode) {
      case "priority":
        return tasksWithScores.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
      case "urgency":
        return tasksWithScores.sort((a, b) => {
          const urgencyOrder = { blocked: 4, active: 3, paused: 2, completed: 1 }
          return urgencyOrder[b.status] - urgencyOrder[a.status]
        })
      default: // smart
        return tasksWithScores.sort((a, b) => b.intelligenceScore - a.intelligenceScore)
    }
  }, [tasks, surfacingEnabled, surfacingMode])

  const taskRisks = useMemo(() => {
    const now = new Date()
    const risks = []

    for (const task of tasks) {
      const daysSinceUpdate = (now.getTime() - task.updatedAt.getTime()) / (1000 * 60 * 60 * 24)

      // Stale high-priority tasks
      if (
        (task.priority === "high" || task.priority === "critical") &&
        daysSinceUpdate > 3 &&
        task.status !== "completed"
      ) {
        risks.push({
          taskId: task.id,
          type: "stale_priority",
          message: `High priority task "${task.title}" hasn't been updated in ${Math.floor(daysSinceUpdate)} days`,
          severity: "high" as const,
        })
      }

      // Added dependency-related risks
      // Tasks blocked by completed dependencies
      const blockedByCompleted = (task.blockedBy || []).filter((blockerId) => {
        const blocker = tasks.find((t) => t.id === blockerId)
        return blocker && blocker.status === "completed"
      })
      if (blockedByCompleted.length > 0) {
        risks.push({
          taskId: task.id,
          type: "dependency_resolved",
          message: `Task "${task.title}" can now proceed - blocking dependencies resolved`,
          severity: "medium" as const,
        })
      }

      // Circular dependency detection
      const isInCircular = dependencyAnalysis.circularDependencies.some((cycle) => cycle.includes(task.id))
      if (isInCircular) {
        risks.push({
          taskId: task.id,
          type: "circular_dependency",
          message: `Task "${task.title}" is part of a circular dependency`,
          severity: "high" as const,
        })
      }

      // Blocked tasks without recent activity
      if (task.status === "blocked" && daysSinceUpdate > 1) {
        risks.push({
          taskId: task.id,
          type: "blocked_stale",
          message: `Blocked task "${task.title}" needs attention`,
          severity: "medium" as const,
        })
      }

      // Tasks with significant time investment but no recent progress
      const hoursSpent = task.timeSpent / (1000 * 60 * 60)
      if (hoursSpent > 2 && daysSinceUpdate > 2 && task.status !== "completed") {
        risks.push({
          taskId: task.id,
          type: "investment_risk",
          message: `Task "${task.title}" has ${Math.floor(hoursSpent)}h invested but no recent progress`,
          severity: "medium" as const,
        })
      }
    }

    return risks.slice(0, 5)
  }, [tasks, dependencyAnalysis])

  const selectTask = (task: Task) => {
    setSelectedTask(task)
    setLastTaskSwitch(new Date())
  }

  // Added dependency management functions
  const addDependency = (taskId: string, dependencyId: string, type: "dependsOn" | "blocks" | "relatedTasks") => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const currentDeps = task[type] || []
          if (!currentDeps.includes(dependencyId)) {
            return {
              ...task,
              [type]: [...currentDeps, dependencyId],
              updatedAt: new Date(),
            }
          }
        }
        return task
      }),
    )

    // Update the reverse relationship
    if (type === "dependsOn") {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === dependencyId) {
            const currentBlocks = task.blocks || []
            if (!currentBlocks.includes(taskId)) {
              return {
                ...task,
                blocks: [...currentBlocks, taskId],
                updatedAt: new Date(),
              }
            }
          }
          return task
        }),
      )
    }
  }

  const removeDependency = (taskId: string, dependencyId: string, type: "dependsOn" | "blocks" | "relatedTasks") => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const currentDeps = task[type] || []
          return {
            ...task,
            [type]: currentDeps.filter((id) => id !== dependencyId),
            updatedAt: new Date(),
          }
        }
        return task
      }),
    )
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "paused":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <Clock className="h-4 w-4 text-green-500" />
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">IT Task Manager</h1>
              <p className="text-muted-foreground">Chaos-resistant task management designed for IT professionals</p>
            </div>
            {/* Added dependencies tab */}
            <Tabs
              value={currentView}
              onValueChange={(value) => setCurrentView(value as "tasks" | "dashboard" | "dependencies")}
            >
              <TabsList>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Dependencies
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {currentSession && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Active session: {Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)}m
              {currentSession.snapshots.length > 0 && (
                <span>• {currentSession.snapshots.length} context snapshots</span>
              )}
            </div>
          )}
        </div>

        {currentView === "tasks" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <TaskCapture
                onAddTask={(taskData) => {
                  const newTask: Task = {
                    ...taskData,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    timeSpent: 0,
                  }
                  setTasks((prev) => [newTask, ...prev])
                }}
              />

              <ContextBreadcrumbs
                contextHistory={contextHistory}
                currentTask={selectedTask}
                onRestoreContext={(snapshot) => {
                  if (selectedTask) {
                    // saveContextSnapshot logic would go here
                  }
                }}
              />

              <IntelligentSurfacing
                taskRisks={taskRisks}
                surfacingEnabled={surfacingEnabled}
                surfacingMode={surfacingMode}
                onToggleSurfacing={() => setSurfacingEnabled(!surfacingEnabled)}
                onChangeSurfacingMode={setSurfacingMode}
                onSelectTask={selectTask}
                tasks={tasks}
              />
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Active Tasks
                      {surfacingEnabled && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Smart
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={surfacingMode}
                      onValueChange={(value: "smart" | "priority" | "urgency") => setSurfacingMode(value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smart">Smart</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="urgency">Urgency</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {intelligentlyOrderedTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No tasks found. Create your first task to get started.
                    </p>
                  ) : (
                    intelligentlyOrderedTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedTask?.id === task.id ? "bg-accent border-primary" : ""
                        } ${index < 3 && surfacingEnabled ? "ring-1 ring-primary/20" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {surfacingEnabled && index < 3 && (
                              <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            )}
                            <h3 className="font-medium text-sm" onClick={() => selectTask(task)}>
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {/* Added dependency indicators */}
                            {(task.dependsOn?.length || 0) > 0 && (
                              <div
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                title={`${task.dependsOn?.length} dependencies`}
                              />
                            )}
                            {(task.blocks?.length || 0) > 0 && (
                              <div
                                className="w-2 h-2 bg-red-500 rounded-full"
                                title={`Blocks ${task.blocks?.length} tasks`}
                              />
                            )}
                            {task.contextSnapshots && task.contextSnapshots.length > 0 && (
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                title={`${task.contextSnapshots.length} context snapshots`}
                              />
                            )}
                            {surfacingEnabled && surfacingMode === "smart" && "intelligenceScore" in task && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(task.intelligenceScore)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{task.updatedAt.toLocaleDateString()}</span>
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <ContextPanel
                task={selectedTask}
                onUpdateTask={(taskId, updates) => {
                  setTasks((prev) =>
                    prev.map((task) => (task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task)),
                  )

                  if (selectedTask?.id === taskId) {
                    setSelectedTask((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null))
                  }
                }}
                onSaveSnapshot={(action, details, data) => {
                  if (selectedTask) {
                    // saveContextSnapshot logic would go here
                  }
                }}
                currentSession={currentSession}
              />
            </div>
          </div>
        ) : currentView === "dashboard" ? (
          <ProgressDashboard
            tasks={tasks}
            workSessions={workSessions}
            contextHistory={contextHistory}
            currentSession={currentSession}
          />
        ) : (
          /* Added dependency mapper view */
          <DependencyMapper
            tasks={tasks}
            dependencyAnalysis={dependencyAnalysis}
            onSelectTask={selectTask}
            onAddDependency={addDependency}
            onRemoveDependency={removeDependency}
            selectedTask={selectedTask}
          />
        )}
      </div>
    </div>
  )
}
