"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Brain } from "lucide-react"
import type { Task } from "@/app/page"

interface TaskCaptureProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "timeSpent">) => void
}

export function TaskCapture({ onAddTask }: TaskCaptureProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [environment, setEnvironment] = useState("")
  const [relatedSystems, setRelatedSystems] = useState("")
  const [dependencies, setDependencies] = useState("")
  const [nextSteps, setNextSteps] = useState("")

  const commonCategories = [
    "Bug Fix",
    "Feature Development",
    "Infrastructure",
    "Security",
    "Database",
    "API",
    "Frontend",
    "Backend",
    "DevOps",
    "Documentation",
    "Code Review",
    "Testing",
    "Deployment",
    "Monitoring",
    "Research",
  ]

  const smartSuggestions = [
    "server-issue",
    "database-migration",
    "api-integration",
    "security-patch",
    "performance-optimization",
    "code-refactor",
    "deployment-fix",
    "monitoring-setup",
    "user-reported",
    "critical-bug",
    "feature-request",
    "technical-debt",
  ]

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "timeSpent"> = {
      title: title.trim(),
      description: description.trim(),
      status: "active",
      priority,
      category: category || "General",
      tags,
      context: {
        environment: environment.trim() || undefined,
        relatedSystems: relatedSystems.trim() ? relatedSystems.split(",").map((s) => s.trim()) : undefined,
        dependencies: dependencies.trim() ? dependencies.split(",").map((s) => s.trim()) : undefined,
        nextSteps: nextSteps.trim()
          ? nextSteps
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      },
      estimatedTime: undefined,
    }

    onAddTask(taskData)

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setCategory("")
    setTags([])
    setEnvironment("")
    setRelatedSystems("")
    setDependencies("")
    setNextSteps("")
  }

  const autoDetectContext = () => {
    // Simple context detection based on title/description
    const text = (title + " " + description).toLowerCase()

    if (text.includes("server") || text.includes("deploy")) {
      setEnvironment("Production")
      if (!tags.includes("server-issue")) addTag("server-issue")
    }

    if (text.includes("database") || text.includes("sql")) {
      if (!tags.includes("database")) addTag("database")
      setCategory("Database")
    }

    if (text.includes("api") || text.includes("endpoint")) {
      if (!tags.includes("api-integration")) addTag("api-integration")
      setCategory("API")
    }

    if (text.includes("bug") || text.includes("error") || text.includes("fix")) {
      setCategory("Bug Fix")
      if (!tags.includes("critical-bug")) addTag("critical-bug")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Capture
        </CardTitle>
        <CardDescription>Capture tasks instantly with smart context detection</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
              autoFocus
            />
          </div>

          <div>
            <Textarea
              placeholder="Additional context, error messages, or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Select value={priority} onValueChange={(value: Task["priority"]) => setPriority(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoDetectContext}
              className="flex items-center gap-1 bg-transparent"
            >
              <Brain className="h-4 w-4" />
              Auto-detect
            </Button>
          </div>

          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {commonCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addTag(newTag)}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mb-2">Quick tags:</div>
            <div className="flex flex-wrap gap-1">
              {smartSuggestions
                .filter((s) => !tags.includes(s))
                .slice(0, 6)
                .map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => addTag(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Context Fields */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-sm font-medium text-muted-foreground">Context (Optional)</div>

            <Input
              placeholder="Environment (e.g., Production, Staging, Local)"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            />

            <Input
              placeholder="Related systems (comma-separated)"
              value={relatedSystems}
              onChange={(e) => setRelatedSystems(e.target.value)}
            />

            <Input
              placeholder="Dependencies (comma-separated)"
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
            />

            <Textarea
              placeholder="Next steps (one per line)"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Capture Task
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
