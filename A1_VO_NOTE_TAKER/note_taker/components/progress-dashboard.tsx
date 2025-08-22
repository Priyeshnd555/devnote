// "use client"

// import { useMemo } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import {
//   BarChart3,
//   Clock,
//   CheckCircle2,
//   AlertTriangle,
//   TrendingUp,
//   Target,
//   Activity,
//   Calendar,
//   Zap,
// } from "lucide-react"
// import type { Task, WorkSession, ContextSnapshot } from "@/app/page"

// interface ProgressDashboardProps {
//   tasks: Task[]
//   workSessions: WorkSession[]
//   contextHistory: ContextSnapshot[]
//   currentSession: WorkSession | null
// }

// export function ProgressDashboard({ tasks, workSessions, contextHistory, currentSession }: ProgressDashboardProps) {
//   const analytics = useMemo(() => {
//     const now = new Date()
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
//     const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

//     // Task status breakdown
//     const statusCounts = tasks.reduce(
//       (acc, task) => {
//         acc[task.status] = (acc[task.status] || 0) + 1
//         return acc
//       },
//       {} as Record<string, number>,
//     )

//     // Priority breakdown
//     const priorityCounts = tasks.reduce(
//       (acc, task) => {
//         acc[task.priority] = (acc[task.priority] || 0) + 1
//         return acc
//       },
//       {} as Record<string, number>,
//     )

//     // Category breakdown
//     const categoryCounts = tasks.reduce(
//       (acc, task) => {
//         acc[task.category] = (acc[task.category] || 0) + 1
//         return acc
//       },
//       {} as Record<string, number>,
//     )

//     // Time analytics
//     const totalTimeSpent = tasks.reduce((acc, task) => acc + task.timeSpent, 0)
//     const completedTasks = tasks.filter((task) => task.status === "completed")
//     const avgTimePerTask =
//       completedTasks.length > 0
//         ? completedTasks.reduce((acc, task) => acc + task.timeSpent, 0) / completedTasks.length
//         : 0

//     // Today's activity
//     const todaysSessions = workSessions.filter((session) => session.startTime >= today)
//     const todaysTimeSpent = todaysSessions.reduce((acc, session) => {
//       if (session.endTime) {
//         return acc + (session.endTime.getTime() - session.startTime.getTime())
//       } else if (session.isActive && currentSession?.id === session.id) {
//         return acc + (now.getTime() - session.startTime.getTime())
//       }
//       return acc
//     }, 0)

//     // Weekly progress
//     const weeklyTasks = tasks.filter((task) => task.createdAt >= thisWeek)
//     const weeklyCompleted = weeklyTasks.filter((task) => task.status === "completed")

//     // Context switches
//     const contextSwitches = contextHistory.filter(
//       (snapshot) => snapshot.action === "task_switch" && snapshot.timestamp >= today,
//     ).length

//     // Productivity insights
//     const blockedTasks = tasks.filter((task) => task.status === "blocked")
//     const highPriorityTasks = tasks.filter((task) => task.priority === "high" || task.priority === "critical")
//     const activeTasks = tasks.filter((task) => task.status === "active")

//     return {
//       statusCounts,
//       priorityCounts,
//       categoryCounts,
//       totalTimeSpent,
//       avgTimePerTask,
//       todaysTimeSpent,
//       weeklyTasks: weeklyTasks.length,
//       weeklyCompleted: weeklyCompleted.length,
//       contextSwitches,
//       blockedTasks: blockedTasks.length,
//       highPriorityTasks: highPriorityTasks.length,
//       activeTasks: activeTasks.length,
//       completionRate: tasks.length > 0 ? ((statusCounts.completed || 0) / tasks.length) * 100 : 0,
//     }
//   }, [tasks, workSessions, contextHistory, currentSession])

//   const formatTime = (ms: number) => {
//     const hours = Math.floor(ms / (1000 * 60 * 60))
//     const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

//     if (hours > 0) {
//       return `${hours}h ${minutes}m`
//     } else if (minutes > 0) {
//       return `${minutes}m`
//     } else {
//       return "<1m"
//     }
//   }

//   const getStatusColor = (status: string) => {
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

//   const getPriorityColor = (priority: string) => {
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

//   return (
//     <div className="space-y-6">
//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
//             <Target className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{tasks.length}</div>
//             <p className="text-xs text-muted-foreground">{analytics.completionRate.toFixed(1)}% completed</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Time Today</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatTime(analytics.todaysTimeSpent)}</div>
//             <p className="text-xs text-muted-foreground">{analytics.contextSwitches} context switches</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{analytics.activeTasks}</div>
//             <p className="text-xs text-muted-foreground">{analytics.highPriorityTasks} high priority</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {analytics.weeklyCompleted}/{analytics.weeklyTasks}
//             </div>
//             <p className="text-xs text-muted-foreground">tasks completed this week</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Task Status Overview */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5" />
//               Task Status Overview
//             </CardTitle>
//             <CardDescription>Current distribution of task statuses</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {Object.entries(analytics.statusCounts).map(([status, count]) => (
//               <div key={status} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     {status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
//                     {status === "active" && <Clock className="h-4 w-4 text-blue-500" />}
//                     {status === "paused" && <Clock className="h-4 w-4 text-yellow-500" />}
//                     {status === "blocked" && <AlertTriangle className="h-4 w-4 text-red-500" />}
//                     <span className={`text-sm font-medium capitalize ${getStatusColor(status)}`}>{status}</span>
//                   </div>
//                   <span className="text-sm font-bold">{count}</span>
//                 </div>
//                 <Progress value={(count / tasks.length) * 100} className="h-2" />
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* Priority Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Zap className="h-5 w-5" />
//               Priority Distribution
//             </CardTitle>
//             <CardDescription>Task breakdown by priority level</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {Object.entries(analytics.priorityCounts).map(([priority, count]) => (
//               <div key={priority} className="flex items-center justify-between">
//                 <Badge className={getPriorityColor(priority)}>{priority}</Badge>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm">{count} tasks</span>
//                   <div className="w-16 bg-muted rounded-full h-2">
//                     <div
//                       className="bg-primary h-2 rounded-full"
//                       style={{ width: `${(count / tasks.length) * 100}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* Category Breakdown */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Category Breakdown</CardTitle>
//             <CardDescription>Tasks organized by category</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {Object.entries(analytics.categoryCounts)
//                 .sort(([, a], [, b]) => b - a)
//                 .slice(0, 6)
//                 .map(([category, count]) => (
//                   <div key={category} className="flex items-center justify-between">
//                     <span className="text-sm">{category}</span>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-medium">{count}</span>
//                       <div className="w-12 bg-muted rounded-full h-1.5">
//                         <div
//                           className="bg-primary h-1.5 rounded-full"
//                           style={{ width: `${(count / tasks.length) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Productivity Insights */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Activity className="h-5 w-5" />
//               Productivity Insights
//             </CardTitle>
//             <CardDescription>Key metrics and recommendations</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
//                 <div>
//                   <p className="text-sm font-medium">Average Task Time</p>
//                   <p className="text-xs text-muted-foreground">Per completed task</p>
//                 </div>
//                 <span className="text-lg font-bold">{formatTime(analytics.avgTimePerTask)}</span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
//                 <div>
//                   <p className="text-sm font-medium">Total Time Invested</p>
//                   <p className="text-xs text-muted-foreground">Across all tasks</p>
//                 </div>
//                 <span className="text-lg font-bold">{formatTime(analytics.totalTimeSpent)}</span>
//               </div>

//               {analytics.blockedTasks > 0 && (
//                 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <AlertTriangle className="h-4 w-4 text-red-500" />
//                   <div>
//                     <p className="text-sm font-medium text-red-800">
//                       {analytics.blockedTasks} blocked task{analytics.blockedTasks > 1 ? "s" : ""}
//                     </p>
//                     <p className="text-xs text-red-600">Consider reviewing dependencies</p>
//                   </div>
//                 </div>
//               )}

//               {analytics.contextSwitches > 10 && (
//                 <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <Calendar className="h-4 w-4 text-yellow-600" />
//                   <div>
//                     <p className="text-sm font-medium text-yellow-800">High context switching today</p>
//                     <p className="text-xs text-yellow-600">
//                       {analytics.contextSwitches} switches - consider focusing on fewer tasks
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {analytics.completionRate > 80 && (
//                 <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                   <CheckCircle2 className="h-4 w-4 text-green-600" />
//                   <div>
//                     <p className="text-sm font-medium text-green-800">Great progress!</p>
//                     <p className="text-xs text-green-600">{analytics.completionRate.toFixed(1)}% completion rate</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
