"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Play, Pause, Square, Edit3, Save, X } from "lucide-react"
import type { Task, ContextSnapshot, WorkSession } from "@/app/page"

interface ContextPanelProps {
  task: Task | null
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onSaveSnapshot?: (action: string, details: string, data?: Partial<ContextSnapshot>) => void
  currentSession?: WorkSession | null
}

export function ContextPanel({ task, onUpdateTask, onSaveSnapshot, currentSession }: ContextPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [contextNote, setContextNote] = useState("")
  const [timeTracker, setTimeTracker] = useState<{
    isRunning: boolean
    startTime: number | null
    sessionTime: number
  }>({
    isRunning: false,
    startTime: null,
    sessionTime: 0,
  })

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task })
      setIsEditing(false)
    }
  }, [task])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timeTracker.isRunning && timeTracker.startTime) {
      interval = setInterval(() => {
        setTimeTracker((prev) => ({
          ...prev,
          sessionTime: Date.now() - (prev.startTime || 0),
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timeTracker.isRunning, timeTracker.startTime])

  const startTimer = () => {
    setTimeTracker({
      isRunning: true,
      startTime: Date.now(),
      sessionTime: 0,
    })
    if (task) {
      onUpdateTask(task.id, { status: "active" })
      onSaveSnapshot?.("timer_start", "Started working on task")
    }
  }

  const pauseTimer = () => {
    if (task && timeTracker.startTime) {
      const sessionTime = Date.now() - timeTracker.startTime
      onUpdateTask(task.id, {
        timeSpent: task.timeSpent + sessionTime,
        status: "paused",
      })
      onSaveSnapshot?.("timer_pause", `Paused after ${formatTime(sessionTime)}`)
    }
    setTimeTracker({
      isRunning: false,
      startTime: null,
      sessionTime: 0,
    })
  }

  const stopTimer = () => {
    if (task && timeTracker.startTime) {
      const sessionTime = Date.now() - timeTracker.startTime
      onUpdateTask(task.id, {
        timeSpent: task.timeSpent + sessionTime,
        status: "completed",
      })
      onSaveSnapshot?.("timer_complete", `Completed after ${formatTime(sessionTime)}`)
    }
    setTimeTracker({
      isRunning: false,
      startTime: null,
      sessionTime: 0,
    })
  }

  const saveChanges = () => {
    if (task && editedTask) {
      onUpdateTask(task.id, editedTask)
      setIsEditing(false)
    }
  }

  const saveQuickNote = () => {
    if (task && contextNote.trim() && onSaveSnapshot) {
      onSaveSnapshot("quick_note", contextNote.trim(), {
        notes: contextNote.trim(),
      })
      setContextNote("")
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleDateString()
  }

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Context</CardTitle>
          <CardDescription>Select a task to view and edit details</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No task selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Task Context
            {currentSession && currentSession.taskId === task?.id && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick context note */}
        {task && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Quick context note..."
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && saveQuickNote()}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={saveQuickNote} disabled={!contextNote.trim()}>
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Time Tracking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time Tracking</span>
            <div className="text-sm text-muted-foreground">
              Total: {task ? formatTime(task.timeSpent + timeTracker.sessionTime) : "0s"}
            </div>
          </div>

          {timeTracker.isRunning && (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">{formatTime(timeTracker.sessionTime)}</div>
              <div className="text-xs text-muted-foreground">Current session</div>
            </div>
          )}

          <div className="flex gap-2">
            {!timeTracker.isRunning ? (
              <Button onClick={startTimer} size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <>
                <Button onClick={pauseTimer} variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button onClick={stopTimer} variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Square className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Recent Context */}
        {task && task.contextSnapshots && task.contextSnapshots.length > 0 && (
          <>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Context</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {task.contextSnapshots
                  .slice(-5)
                  .reverse()
                  .map((snapshot) => (
                    <div key={snapshot.id} className="text-xs p-2 bg-muted rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="text-xs" variant="outline">
                          {snapshot.action.replace("_", " ")}
                        </Badge>
                        <span className="text-muted-foreground">{formatTimeAgo(snapshot.timestamp)}</span>
                      </div>
                      <p className="text-muted-foreground">{snapshot.details}</p>
                      {snapshot.notes && <p className="text-foreground mt-1">{snapshot.notes}</p>}
                    </div>
                  ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Task Details */}
        <div className="space-y-3">
          {isEditing && editedTask ? (
            <>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(value: Task["status"]) => setEditedTask({ ...editedTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value: Task["priority"]) => setEditedTask({ ...editedTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={saveChanges} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-medium text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
                <Badge variant="outline">{task.priority}</Badge>
                <Badge variant="outline">{task.category}</Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Context Information */}
        {task.context && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Context</h4>

              {task.context.environment && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Environment:</span>
                  <p className="text-sm">{task.context.environment}</p>
                </div>
              )}

              {task.context.relatedSystems && task.context.relatedSystems.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Related Systems:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.context.relatedSystems.map((system) => (
                      <Badge key={system} variant="outline" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.context.dependencies && task.context.dependencies.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Dependencies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.context.dependencies.map((dep) => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.context.nextSteps && task.context.nextSteps.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Next Steps:</span>
                  <ul className="text-sm mt-1 space-y-1">
                    {task.context.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {task.createdAt.toLocaleString()}</div>
          <div>Updated: {task.updatedAt.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
