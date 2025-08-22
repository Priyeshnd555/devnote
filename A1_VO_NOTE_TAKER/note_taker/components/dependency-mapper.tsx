// "use client"

// import { useState, useMemo } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import { Network, AlertTriangle, Clock, ArrowRight, Plus, X, Target, GitBranch, Zap, Link } from "lucide-react"
// import type { Task, DependencyAnalysis } from "@/app/page"

// interface DependencyMapperProps {
//   tasks: Task[]
//   dependencyAnalysis: DependencyAnalysis
//   onSelectTask: (task: Task) => void
//   onAddDependency: (taskId: string, dependencyId: string, type: "dependsOn" | "blocks" | "relatedTasks") => void
//   onRemoveDependency: (taskId: string, dependencyId: string, type: "dependsOn" | "blocks" | "relatedTasks") => void
//   selectedTask: Task | null
// }

// export function DependencyMapper({
//   tasks,
//   dependencyAnalysis,
//   onSelectTask,
//   onAddDependency,
//   onRemoveDependency,
//   selectedTask,
// }: DependencyMapperProps) {
//   const [viewMode, setViewMode] = useState<"overview" | "graph" | "analysis">("overview")
//   const [newDependencyId, setNewDependencyId] = useState("")
//   const [dependencyType, setDependencyType] = useState<"dependsOn" | "blocks" | "relatedTasks">("dependsOn")

//   const getTaskById = (id: string) => tasks.find((t) => t.id === id)

//   const getStatusColor = (status: Task["status"]) => {
//     switch (status) {
//       case "completed":
//         return "text-green-600"
//       case "active":
//         return "text-blue-600"
//       case "paused":
//         return "text-yellow-600"
//       case "blocked":
//         return "text-red-600"
//       default:
//         return "text-gray-600"
//     }
//   }

//   const getPriorityColor = (priority: Task["priority"]) => {
//     switch (priority) {
//       case "critical":
//         return "bg-red-100 text-red-800"
//       case "high":
//         return "bg-orange-100 text-orange-800"
//       case "medium":
//         return "bg-blue-100 text-blue-800"
//       case "low":
//         return "bg-gray-100 text-gray-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   const getHealthColor = (health: string) => {
//     switch (health) {
//       case "healthy":
//         return "text-green-600"
//       case "warning":
//         return "text-yellow-600"
//       case "critical":
//         return "text-red-600"
//       default:
//         return "text-gray-600"
//     }
//   }

//   const availableTasksForDependency = useMemo(() => {
//     if (!selectedTask) return []
//     return tasks.filter(
//       (task) =>
//         task.id !== selectedTask.id &&
//         !(selectedTask.dependsOn || []).includes(task.id) &&
//         !(selectedTask.blocks || []).includes(task.id) &&
//         !(selectedTask.relatedTasks || []).includes(task.id),
//     )
//   }, [tasks, selectedTask])

//   const addDependency = () => {
//     if (selectedTask && newDependencyId) {
//       onAddDependency(selectedTask.id, newDependencyId, dependencyType)
//       setNewDependencyId("")
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header with controls */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold flex items-center gap-2">
//             <Network className="h-6 w-6" />
//             Dependency Mapping
//           </h2>
//           <p className="text-muted-foreground">Visualize and manage task relationships and dependencies</p>
//         </div>
//         <Select value={viewMode} onValueChange={(value: "overview" | "graph" | "analysis") => setViewMode(value)}>
//           <SelectTrigger className="w-32">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="overview">Overview</SelectItem>
//             <SelectItem value="graph">Graph</SelectItem>
//             <SelectItem value="analysis">Analysis</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Dependency Health Status */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Target className="h-5 w-5" />
//             Dependency Health
//             <Badge className={getHealthColor(dependencyAnalysis.dependencyHealth)}>
//               {dependencyAnalysis.dependencyHealth}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-red-600">{dependencyAnalysis.circularDependencies.length}</div>
//               <div className="text-sm text-muted-foreground">Circular Dependencies</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-yellow-600">{dependencyAnalysis.blockedChains.length}</div>
//               <div className="text-sm text-muted-foreground">Blocked Chains</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-blue-600">{dependencyAnalysis.criticalPath.length}</div>
//               <div className="text-sm text-muted-foreground">Critical Path Length</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-600">{dependencyAnalysis.orphanedTasks.length}</div>
//               <div className="text-sm text-muted-foreground">Orphaned Tasks</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Task Selection and Dependency Management */}
//         <div className="lg:col-span-1 space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Task Selection</CardTitle>
//               <CardDescription>Select a task to view and manage its dependencies</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ScrollArea className="h-64">
//                 <div className="space-y-2">
//                   {tasks.map((task) => (
//                     <div
//                       key={task.id}
//                       className={`p-2 border rounded cursor-pointer transition-colors hover:bg-accent ${
//                         selectedTask?.id === task.id ? "bg-accent border-primary" : ""
//                       }`}
//                       onClick={() => onSelectTask(task)}
//                     >
//                       <div className="flex items-center justify-between mb-1">
//                         <span className="text-sm font-medium truncate">{task.title}</span>
//                         <div className="flex items-center gap-1">
//                           {(task.dependsOn?.length || 0) > 0 && (
//                             <Badge variant="outline" className="text-xs">
//                               {task.dependsOn?.length} deps
//                             </Badge>
//                           )}
//                           {(task.blocks?.length || 0) > 0 && (
//                             <Badge variant="outline" className="text-xs">
//                               blocks {task.blocks?.length}
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
//                         <span className={`text-xs ${getStatusColor(task.status)}`}>{task.status}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </CardContent>
//           </Card>

//           {/* Add Dependencies */}
//           {selectedTask && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-sm">Add Dependency</CardTitle>
//                 <CardDescription>Create relationships between tasks</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Select
//                   value={dependencyType}
//                   onValueChange={(value: "dependsOn" | "blocks" | "relatedTasks") => setDependencyType(value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="dependsOn">Depends On</SelectItem>
//                     <SelectItem value="blocks">Blocks</SelectItem>
//                     <SelectItem value="relatedTasks">Related To</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select value={newDependencyId} onValueChange={setNewDependencyId}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select task..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {availableTasksForDependency.map((task) => (
//                       <SelectItem key={task.id} value={task.id}>
//                         {task.title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Button onClick={addDependency} disabled={!newDependencyId} className="w-full" size="sm">
//                   <Plus className="h-4 w-4 mr-1" />
//                   Add Dependency
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Main Content Area */}
//         <div className="lg:col-span-2">
//           {viewMode === "overview" && selectedTask && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <GitBranch className="h-5 w-5" />
//                   Task Dependencies: {selectedTask.title}
//                 </CardTitle>
//                 <CardDescription>Manage relationships for the selected task</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Dependencies (What this task depends on) */}
//                 <div>
//                   <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
//                     <ArrowRight className="h-4 w-4" />
//                     Depends On ({(selectedTask.dependsOn || []).length})
//                   </h4>
//                   <div className="space-y-2">
//                     {(selectedTask.dependsOn || []).length === 0 ? (
//                       <p className="text-sm text-muted-foreground">No dependencies</p>
//                     ) : (
//                       (selectedTask.dependsOn || []).map((depId) => {
//                         const depTask = getTaskById(depId)
//                         if (!depTask) return null
//                         return (
//                           <div key={depId} className="flex items-center justify-between p-2 bg-muted rounded">
//                             <div className="flex items-center gap-2">
//                               <span className="text-sm font-medium">{depTask.title}</span>
//                               <Badge className={`text-xs ${getPriorityColor(depTask.priority)}`}>
//                                 {depTask.priority}
//                               </Badge>
//                               <span className={`text-xs ${getStatusColor(depTask.status)}`}>{depTask.status}</span>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => onRemoveDependency(selectedTask.id, depId, "dependsOn")}
//                             >
//                               <X className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         )
//                       })
//                     )}
//                   </div>
//                 </div>

//                 <Separator />

//                 {/* Blocks (What this task blocks) */}
//                 <div>
//                   <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
//                     <Zap className="h-4 w-4" />
//                     Blocks ({(selectedTask.blocks || []).length})
//                   </h4>
//                   <div className="space-y-2">
//                     {(selectedTask.blocks || []).length === 0 ? (
//                       <p className="text-sm text-muted-foreground">Doesn't block any tasks</p>
//                     ) : (
//                       (selectedTask.blocks || []).map((blockId) => {
//                         const blockedTask = getTaskById(blockId)
//                         if (!blockedTask) return null
//                         return (
//                           <div key={blockId} className="flex items-center justify-between p-2 bg-muted rounded">
//                             <div className="flex items-center gap-2">
//                               <span className="text-sm font-medium">{blockedTask.title}</span>
//                               <Badge className={`text-xs ${getPriorityColor(blockedTask.priority)}`}>
//                                 {blockedTask.priority}
//                               </Badge>
//                               <span className={`text-xs ${getStatusColor(blockedTask.status)}`}>
//                                 {blockedTask.status}
//                               </span>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => onRemoveDependency(selectedTask.id, blockId, "blocks")}
//                             >
//                               <X className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         )
//                       })
//                     )}
//                   </div>
//                 </div>

//                 <Separator />

//                 {/* Related Tasks */}
//                 <div>
//                   <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
//                     <Link className="h-4 w-4" />
//                     Related Tasks ({(selectedTask.relatedTasks || []).length})
//                   </h4>
//                   <div className="space-y-2">
//                     {(selectedTask.relatedTasks || []).length === 0 ? (
//                       <p className="text-sm text-muted-foreground">No related tasks</p>
//                     ) : (
//                       (selectedTask.relatedTasks || []).map((relatedId) => {
//                         const relatedTask = getTaskById(relatedId)
//                         if (!relatedTask) return null
//                         return (
//                           <div key={relatedId} className="flex items-center justify-between p-2 bg-muted rounded">
//                             <div className="flex items-center gap-2">
//                               <span className="text-sm font-medium">{relatedTask.title}</span>
//                               <Badge className={`text-xs ${getPriorityColor(relatedTask.priority)}`}>
//                                 {relatedTask.priority}
//                               </Badge>
//                               <span className={`text-xs ${getStatusColor(relatedTask.status)}`}>
//                                 {relatedTask.status}
//                               </span>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => onRemoveDependency(selectedTask.id, relatedId, "relatedTasks")}
//                             >
//                               <X className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         )
//                       })
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {viewMode === "analysis" && (
//             <div className="space-y-4">
//               {/* Circular Dependencies */}
//               {dependencyAnalysis.circularDependencies.length > 0 && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-red-600">
//                       <AlertTriangle className="h-5 w-5" />
//                       Circular Dependencies
//                     </CardTitle>
//                     <CardDescription>These dependency cycles need to be resolved</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       {dependencyAnalysis.circularDependencies.map((cycle, index) => (
//                         <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                           <div className="flex items-center gap-2 flex-wrap">
//                             {cycle.map((taskId, i) => {
//                               const task = getTaskById(taskId)
//                               return (
//                                 <div key={taskId} className="flex items-center gap-1">
//                                   <Badge
//                                     variant="outline"
//                                     className="cursor-pointer hover:bg-accent"
//                                     onClick={() => task && onSelectTask(task)}
//                                   >
//                                     {task?.title || "Unknown"}
//                                   </Badge>
//                                   {i < cycle.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
//                                 </div>
//                               )
//                             })}
//                             <ArrowRight className="h-3 w-3 text-red-500" />
//                             <span className="text-sm text-red-600 font-medium">CYCLE</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Blocked Chains */}
//               {dependencyAnalysis.blockedChains.length > 0 && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-yellow-600">
//                       <Clock className="h-5 w-5" />
//                       Blocked Task Chains
//                     </CardTitle>
//                     <CardDescription>Tasks with complex blocking dependencies</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       {dependencyAnalysis.blockedChains.slice(0, 5).map((chain, index) => {
//                         const task = getTaskById(chain.taskId)
//                         return (
//                           <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                             <div className="flex items-center justify-between mb-2">
//                               <Badge
//                                 variant="outline"
//                                 className="cursor-pointer hover:bg-accent"
//                                 onClick={() => task && onSelectTask(task)}
//                               >
//                                 {task?.title || "Unknown"}
//                               </Badge>
//                               <span className="text-sm text-yellow-600">
//                                 Blocked by {chain.blockedBy.length} task{chain.blockedBy.length > 1 ? "s" : ""}
//                               </span>
//                             </div>
//                             <div className="text-xs text-muted-foreground">Chain depth: {chain.depth}</div>
//                           </div>
//                         )
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Critical Path */}
//               {dependencyAnalysis.criticalPath.length > 0 && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-blue-600">
//                       <Target className="h-5 w-5" />
//                       Critical Path
//                     </CardTitle>
//                     <CardDescription>Longest dependency chain in your project</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       {dependencyAnalysis.criticalPath.map((taskId, index) => {
//                         const task = getTaskById(taskId)
//                         return (
//                           <div key={taskId} className="flex items-center gap-1">
//                             <Badge
//                               variant="outline"
//                               className="cursor-pointer hover:bg-accent"
//                               onClick={() => task && onSelectTask(task)}
//                             >
//                               {task?.title || "Unknown"}
//                             </Badge>
//                             {index < dependencyAnalysis.criticalPath.length - 1 && (
//                               <ArrowRight className="h-3 w-3 text-muted-foreground" />
//                             )}
//                           </div>
//                         )
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>
//           )}

//           {!selectedTask && viewMode === "overview" && (
//             <Card>
//               <CardContent className="text-center py-12">
//                 <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">Select a task to view and manage its dependencies</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
