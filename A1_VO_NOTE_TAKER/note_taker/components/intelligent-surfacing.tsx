// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Switch } from "@/components/ui/switch"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Brain, AlertTriangle, Clock, Zap, Eye, EyeOff, Target, Timer, Activity } from "lucide-react"
// import type { Task } from "@/app/page"

// interface TaskRisk {
//   taskId: string
//   type: string
//   message: string
//   severity: "high" | "medium" | "low"
// }

// interface IntelligentSurfacingProps {
//   taskRisks: TaskRisk[]
//   surfacingEnabled: boolean
//   surfacingMode: "smart" | "priority" | "urgency"
//   onToggleSurfacing: () => void
//   onChangeSurfacingMode: (mode: "smart" | "priority" | "urgency") => void
//   onSelectTask: (task: Task) => void
//   tasks: Task[]
// }

// export function IntelligentSurfacing({
//   taskRisks,
//   surfacingEnabled,
//   surfacingMode,
//   onToggleSurfacing,
//   onChangeSurfacingMode,
//   onSelectTask,
//   tasks,
// }: IntelligentSurfacingProps) {
//   const [isExpanded, setIsExpanded] = useState(true)

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case "high":
//         return "bg-red-100 text-red-800 border-red-200"
//       case "medium":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "low":
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200"
//     }
//   }

//   const getSeverityIcon = (severity: string) => {
//     switch (severity) {
//       case "high":
//         return <AlertTriangle className="h-4 w-4" />
//       case "medium":
//         return <Clock className="h-4 w-4" />
//       case "low":
//         return <Activity className="h-4 w-4" />
//       default:
//         return <Target className="h-4 w-4" />
//     }
//   }

//   const getModeIcon = (mode: string) => {
//     switch (mode) {
//       case "smart":
//         return <Brain className="h-4 w-4" />
//       case "priority":
//         return <Zap className="h-4 w-4" />
//       case "urgency":
//         return <Timer className="h-4 w-4" />
//       default:
//         return <Target className="h-4 w-4" />
//     }
//   }

//   const getModeDescription = (mode: string) => {
//     switch (mode) {
//       case "smart":
//         return "AI-powered ranking considering priority, staleness, and context"
//       case "priority":
//         return "Sort by task priority level (Critical → Low)"
//       case "urgency":
//         return "Sort by status urgency (Blocked → Completed)"
//       default:
//         return "Default sorting"
//     }
//   }

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2 text-sm">
//             <Brain className="h-4 w-4" />
//             Intelligent Surfacing
//           </CardTitle>
//           <div className="flex items-center gap-2">
//             <Switch checked={surfacingEnabled} onCheckedChange={onToggleSurfacing} size="sm" />
//             <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
//               {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </Button>
//           </div>
//         </div>
//         <CardDescription className="text-xs">
//           {surfacingEnabled ? getModeDescription(surfacingMode) : "Smart task prioritization disabled"}
//         </CardDescription>
//       </CardHeader>

//       {isExpanded && (
//         <CardContent className="pt-0 space-y-4">
//           {/* Surfacing Mode Controls */}
//           {surfacingEnabled && (
//             <div className="space-y-2">
//               <div className="text-xs font-medium text-muted-foreground">Surfacing Mode</div>
//               <div className="flex gap-1">
//                 {(["smart", "priority", "urgency"] as const).map((mode) => (
//                   <Button
//                     key={mode}
//                     variant={surfacingMode === mode ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => onChangeSurfacingMode(mode)}
//                     className="flex items-center gap-1 text-xs"
//                   >
//                     {getModeIcon(mode)}
//                     {mode.charAt(0).toUpperCase() + mode.slice(1)}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Task Risks */}
//           {taskRisks.length > 0 && (
//             <div className="space-y-2">
//               <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
//                 <AlertTriangle className="h-3 w-3" />
//                 Task Risks ({taskRisks.length})
//               </div>
//               <ScrollArea className="h-32">
//                 <div className="space-y-2">
//                   {taskRisks.map((risk, index) => {
//                     const task = tasks.find((t) => t.id === risk.taskId)
//                     return (
//                       <div
//                         key={`${risk.taskId}-${index}`}
//                         className={`p-2 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${getSeverityColor(risk.severity)}`}
//                         onClick={() => task && onSelectTask(task)}
//                       >
//                         <div className="flex items-start gap-2">
//                           {getSeverityIcon(risk.severity)}
//                           <div className="flex-1 min-w-0">
//                             <p className="text-xs font-medium leading-tight">{risk.message}</p>
//                             <div className="flex items-center gap-1 mt-1">
//                               <Badge variant="outline" className="text-xs">
//                                 {risk.type.replace("_", " ")}
//                               </Badge>
//                               <Badge variant="outline" className="text-xs">
//                                 {risk.severity}
//                               </Badge>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </ScrollArea>
//             </div>
//           )}

//           {/* Surfacing Stats */}
//           {surfacingEnabled && (
//             <div className="space-y-2">
//               <div className="text-xs font-medium text-muted-foreground">Surfacing Impact</div>
//               <div className="grid grid-cols-2 gap-2">
//                 <div className="p-2 bg-muted rounded-lg">
//                   <div className="text-xs text-muted-foreground">Top 3 Tasks</div>
//                   <div className="text-sm font-medium">Prioritized</div>
//                 </div>
//                 <div className="p-2 bg-muted rounded-lg">
//                   <div className="text-xs text-muted-foreground">Risks Found</div>
//                   <div className="text-sm font-medium">{taskRisks.length}</div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Quick Actions */}
//           <div className="space-y-2">
//             <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
//             <div className="flex gap-1">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="text-xs bg-transparent"
//                 onClick={() => {
//                   const blockedTasks = tasks.filter((t) => t.status === "blocked")
//                   if (blockedTasks.length > 0) {
//                     onSelectTask(blockedTasks[0])
//                   }
//                 }}
//               >
//                 <AlertTriangle className="h-3 w-3 mr-1" />
//                 Review Blocked
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="text-xs bg-transparent"
//                 onClick={() => {
//                   const staleTasks = tasks.filter((t) => {
//                     const daysSinceUpdate = (Date.now() - t.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
//                     return daysSinceUpdate > 3 && t.status !== "completed"
//                   })
//                   if (staleTasks.length > 0) {
//                     onSelectTask(staleTasks[0])
//                   }
//                 }}
//               >
//                 <Clock className="h-3 w-3 mr-1" />
//                 Check Stale
//               </Button>
//             </div>
//           </div>

//           {!surfacingEnabled && (
//             <div className="text-center py-4">
//               <p className="text-xs text-muted-foreground mb-2">
//                 Enable intelligent surfacing to automatically prioritize your most important tasks
//               </p>
//               <Button size="sm" onClick={onToggleSurfacing}>
//                 <Brain className="h-4 w-4 mr-1" />
//                 Enable Smart Surfacing
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       )}
//     </Card>
//   )
// }
