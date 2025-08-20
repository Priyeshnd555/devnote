"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, RotateCcw, Clock, ChevronRight } from "lucide-react"
import type { ContextSnapshot, Task } from "@/app/page"

interface ContextBreadcrumbsProps {
  contextHistory: ContextSnapshot[]
  currentTask: Task | null
  onRestoreContext: (snapshot: ContextSnapshot) => void
}

export function ContextBreadcrumbs({ contextHistory, currentTask, onRestoreContext }: ContextBreadcrumbsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const recentSnapshots = contextHistory.slice(0, 5)
  const currentTaskSnapshots = currentTask?.contextSnapshots?.slice(-3) || []

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "task_switch":
        return "bg-blue-100 text-blue-800"
      case "status_change":
        return "bg-green-100 text-green-800"
      case "context_restored":
        return "bg-purple-100 text-purple-800"
      case "session_end":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Context Trail
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </CardTitle>
        <CardDescription className="text-xs">Your recent context switches and actions</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Current Task Context */}
        {currentTask && currentTaskSnapshots.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Current Task Context</div>
            <div className="space-y-2">
              {currentTaskSnapshots.map((snapshot, index) => (
                <div key={snapshot.id} className="flex items-center gap-2 text-xs">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <Badge className={`text-xs ${getActionColor(snapshot.action)}`}>
                    {snapshot.action.replace("_", " ")}
                  </Badge>
                  <span className="text-muted-foreground truncate flex-1">{snapshot.details}</span>
                  <span className="text-muted-foreground">{formatTimeAgo(snapshot.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Context History */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Recent Activity</div>
          <ScrollArea className={isExpanded ? "h-48" : "h-24"}>
            <div className="space-y-2">
              {recentSnapshots.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No context history yet</p>
              ) : (
                recentSnapshots.map((snapshot, index) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer group"
                    onClick={() => onRestoreContext(snapshot)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <Badge className={`text-xs ${getActionColor(snapshot.action)}`}>
                        {snapshot.action.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">{snapshot.details}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(snapshot.timestamp)}</span>
                      <RotateCcw className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Context Breadcrumb Trail */}
        {recentSnapshots.length > 1 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">Context Trail</div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {recentSnapshots
                .slice(0, 4)
                .reverse()
                .map((snapshot, index, array) => (
                  <div key={snapshot.id} className="flex items-center gap-1 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-accent"
                      onClick={() => onRestoreContext(snapshot)}
                    >
                      {snapshot.action.replace("_", " ")}
                    </Badge>
                    {index < array.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
