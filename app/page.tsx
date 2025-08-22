"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Zap,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type ArticleStatus = "Open" | "Working" | "Done" | "Pending";

interface Article {
  id: string;
  title: string;
  content: string;
  snippet: string;
  notes: string; // Add this new field
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
  isDailyTitle?: boolean;
}

interface Reminder {
  id: string;
  articleId: string;
  articleTitle: string;
  dueDate: Date;
  isOverdue: boolean;
}

interface QuickNote {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusColors = {
  Open: "bg-blue-100 text-blue-800 border-blue-200",
  Working: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Done: "bg-green-100 text-green-800 border-green-200",
  Pending: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  Open: Circle,
  Working: Clock,
  Done: CheckCircle2,
  Pending: AlertCircle,
};

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  // const [dailyTitle, setDailyTitle] = useState("");
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleContent, setNewArticleContent] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [currentView, setCurrentView] = useState<
    "all" | "completed" | "reminders" | "dashboard" | "quick-notes"
  >("dashboard");

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  // const [editTitle, setEditTitle] = useState("")
  // const [editContent, setEditContent] = useState("")
  const [newArticleNotes, setNewArticleNotes] = useState("");

  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [newQuickNote, setNewQuickNote] = useState("");
  const [editingQuickNote, setEditingQuickNote] = useState<QuickNote | null>(
    null
  );
  const [notesSearchQuery, setNotesSearchQuery] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const savedArticles = localStorage.getItem("hn-articles");
    const savedReminders = localStorage.getItem("hn-reminders");

    if (savedArticles) {
      const parsedArticles = JSON.parse(savedArticles).map(
        (article: { createdAt: Date; updatedAt: Date }) => ({
          ...article,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt),
        })
      );
      setArticles(parsedArticles);
    }

    if (savedReminders) {
      const parsedReminders = JSON.parse(savedReminders).map(
        (reminder: { dueDate: Date }) => ({
          ...reminder,
          dueDate: new Date(reminder.dueDate),
          isOverdue: new Date(reminder.dueDate) < new Date(),
        })
      );
      setReminders(parsedReminders);
    }

    const savedQuickNotes = localStorage.getItem("hn-quick-notes");
    if (savedQuickNotes) {
      const parsedQuickNotes = JSON.parse(savedQuickNotes).map(
        (note: { createdAt: Date; updatedAt: Date }) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        })
      );
      setQuickNotes(parsedQuickNotes);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("hn-articles", JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem("hn-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("hn-quick-notes", JSON.stringify(quickNotes));
  }, [quickNotes]);

  // Update overdue reminders
  useEffect(() => {
    const interval = setInterval(() => {
      setReminders((prev) =>
        prev.map((reminder) => ({
          ...reminder,
          isOverdue: new Date(reminder.dueDate) < new Date(),
        }))
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const filteredArticles = useMemo(() => {
    const filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (currentView === "completed") {
        return matchesSearch && article.status === "Done";
      }
      if (currentView === "all") {
        return matchesSearch && article.status !== "Done";
      }
      return matchesSearch;
    });

    return filtered.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [articles, searchQuery, currentView]);

  // const addDailyTitle = () => {
  //   if (!dailyTitle.trim()) return

  //   const newArticle: Article = {
  //     id: Date.now().toString(),
  //     title: dailyTitle,
  //     content: `Daily Goal: ${dailyTitle}\n\nCreated on ${new Date().toLocaleDateString()}`,
  //     snippet: `Daily Goal: ${dailyTitle}`,
  //     notes: "",
  //     status: "Open",
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     isDailyTitle: true,
  //   }

  //   setArticles((prev) => [newArticle, ...prev])
  //   setDailyTitle("")
  // }

  const addArticle = () => {
    if (!newArticleTitle.trim() || !newArticleContent.trim()) return;

    if (editingArticle) {
      // Edit existing article
      const snippet =
        newArticleContent.split("\n").slice(-3).join(" ").substring(0, 150) +
        "...";
      setArticles((prev) =>
        prev.map((article) =>
          article.id === editingArticle.id
            ? {
                ...article,
                title: newArticleTitle,
                content: newArticleContent,
                notes: newArticleNotes,
                snippet,
                updatedAt: new Date(),
              }
            : article
        )
      );
      setEditingArticle(null);
    } else {
      // Add new article
      const snippet =
        newArticleContent.split("\n").slice(-3).join(" ").substring(0, 150) +
        "...";
      const newArticle: Article = {
        id: Date.now().toString(),
        title: newArticleTitle,
        content: newArticleContent,
        notes: newArticleNotes,
        snippet,
        status: "Open",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setArticles((prev) => [newArticle, ...prev]);
    }

    setNewArticleTitle("");
    setNewArticleContent("");
    setNewArticleNotes("");
  };

  const startEditArticle = (article: Article) => {
    setEditingArticle(article);
    setNewArticleTitle(article.title);
    setNewArticleContent(article.content);
    setNewArticleNotes(article.notes || "");
    setSelectedArticle(null);
  };

  const updateArticleStatus = (articleId: string, status: ArticleStatus) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? { ...article, status, updatedAt: new Date() }
          : article
      )
    );
  };

  const addReminder = (articleId: string, articleTitle: string) => {
    if (!reminderDate) return;

    const dueDate = new Date(reminderDate);
    const newReminder: Reminder = {
      id: Date.now().toString(),
      articleId,
      articleTitle,
      dueDate,
      isOverdue: dueDate < new Date(),
    };

    setReminders((prev) => [...prev, newReminder]);
    setReminderDate("");
  };

  const removeReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const statusCounts = useMemo(() => {
    return articles.reduce((acc, article) => {
      acc[article.status] = (acc[article.status] || 0) + 1;
      return acc;
    }, {} as Record<ArticleStatus, number>);
  }, [articles]);

  const overdueReminders = reminders.filter((r) => r.isOverdue);
  const upcomingReminders = reminders.filter((r) => !r.isOverdue);

  const addQuickNote = useCallback(() => {
    if (!newQuickNote.trim()) return;

    if (editingQuickNote) {
      // Edit existing note
      setQuickNotes((prev) =>
        prev.map((note) =>
          note.id === editingQuickNote.id
            ? { ...note, content: newQuickNote, updatedAt: new Date() }
            : note
        )
      );
      setEditingQuickNote(null);
    } else {
      // Add new note
      const newNote: QuickNote = {
        id: Date.now().toString(),
        content: newQuickNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setQuickNotes((prev) => [newNote, ...prev]);
    }

    setNewQuickNote("");
  },[editingQuickNote,newQuickNote]);

  const startEditQuickNote = (note: QuickNote) => {
    setEditingQuickNote(note);
    setNewQuickNote(note.content);
  };

  const deleteQuickNote = (noteId: string) => {
    setQuickNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const filteredQuickNotes = useMemo(() => {
    return quickNotes
      .filter((note) =>
        note.content.toLowerCase().includes(notesSearchQuery.toLowerCase())
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [quickNotes, notesSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.key === "Enter" &&
        (newQuickNote || editingQuickNote)
      ) {
        e.preventDefault();
        addQuickNote();
      }
      if (e.key === "Escape" && (newQuickNote || editingQuickNote)) {
        e.preventDefault();
        setEditingQuickNote(null);
        setNewQuickNote("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newQuickNote, editingQuickNote, currentView, addQuickNote]);

  return (
    <SidebarProvider>
      <div className="flex justify-center rounded border border-red-900 py-3">
        <p className="font-lato h-[19px] min-w-[100px] text-center text-base font-bold leading-5 text-[#DA0F0F]"></p>
      </div>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold">PUSLE NOTE</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("dashboard")}
                    isActive={currentView === "dashboard"}
                  >
                    <Zap className="w-4 h-4" />
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("all")}
                    isActive={currentView === "all"}
                  >
                    <Circle className="w-4 h-4" />
                    Active Articles
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("completed")}
                    isActive={currentView === "completed"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("reminders")}
                    isActive={currentView === "reminders"}
                  >
                    <Calendar className="w-4 h-4" />
                    Reminders
                    {overdueReminders.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {overdueReminders.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("quick-notes")}
                    isActive={currentView === "quick-notes"}
                  >
                    <Edit className="w-4 h-4" />
                    Quick Notes
                    <Badge variant="secondary" className="ml-auto">
                      {quickNotes.length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Status Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const Icon = statusIcons[status as ArticleStatus];
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        {status}
                      </div>
                      <Badge variant="secondary">{count || 0}</Badge>
                    </div>
                  );
                })}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">PUSLE NOTE</h1>
          </div>
        </header>

        <div className="flex-1 p-4 pb-24">
          {currentView === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

                {/* Status Cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const Icon = statusIcons[status as ArticleStatus]
                    return (
                      <Card key={status}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{status}</CardTitle>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{count || 0}</div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Articles */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {articles.slice(0, 5).map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {article.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {article.snippet}
                              </p>
                            </div>
                            <Badge className={statusColors[article.status]}>
                              {article.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Quick Notes */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Recent Notes</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentView("quick-notes")}
                          className="text-xs"
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {quickNotes.slice(0, 4).map((note) => (
                          <div
                            key={note.id}
                            className="p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => {
                              setCurrentView("quick-notes");
                              startEditQuickNote(note);
                            }}
                          >
                            <p className="text-sm line-clamp-2 mb-1">
                              {note.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {note.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {quickNotes.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              No notes yet
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentView("quick-notes");
                                setNewQuickNote(" ");
                              }}
                              className="text-xs mt-2"
                            >
                              Create your first note
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Reminders */}
                {reminders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Reminders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reminders.slice(0, 5).map((reminder) => (
                          <div
                            key={reminder.id}
                            className={`flex items-center justify-between p-2 rounded-md ${
                              reminder.isOverdue
                                ? "bg-red-50 border border-red-200"
                                : "bg-blue-50 border border-blue-200"
                            }`}
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {reminder.articleTitle}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due: {reminder.dueDate.toLocaleDateString()}
                              </p>
                            </div>
                            {reminder.isOverdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {currentView === "reminders" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Reminders</h1>

              {overdueReminders.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">
                      Overdue Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {overdueReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium">
                              {reminder.articleTitle}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {reminder.dueDate.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeReminder(reminder.id)}
                          >
                            Complete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {upcomingReminders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Reminders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {upcomingReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium">
                              {reminder.articleTitle}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {reminder.dueDate.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeReminder(reminder.id)}
                          >
                            Complete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {reminders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reminders set</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === "quick-notes" && (
            <div className="h-full flex flex-col">
              {/* Full Screen Note Editor */}
              {newQuickNote || editingQuickNote ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="text-sm text-muted-foreground">
                      {editingQuickNote ? "Editing note" : "New quick note"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingQuickNote(null);
                          setNewQuickNote("");
                        }}
                      >
                        Cancel
                      </Button>

                      {/* Convert to Article Dropdown */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!newQuickNote.trim()}
                          >
                            Convert to Article
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Convert Note to Article</DialogTitle>
                            <DialogDescription>
                              Transform this note into a structured article or
                              add it to an existing one
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded border">
                              <p className="text-sm font-medium mb-2">
                                Note Content:
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {newQuickNote}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <Label>Choose Action:</Label>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    // Create new article from note
                                    const lines = newQuickNote
                                      .trim()
                                      .split("\n");
                                    const title =
                                      lines[0].length > 50
                                        ? lines[0].substring(0, 50) + "..."
                                        : lines[0];
                                    setNewArticleTitle(title);
                                    setNewArticleContent(newQuickNote);
                                    setNewArticleNotes("");

                                    // Delete the note and close dialogs
                                    if (editingQuickNote) {
                                      deleteQuickNote(editingQuickNote.id);
                                    }
                                    setEditingQuickNote(null);
                                    setNewQuickNote("");
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New Article
                                </Button>

                                {articles.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                      Or add to existing article:
                                    </p>
                                    <ScrollArea className="h-32 border rounded p-2">
                                      {articles.slice(0, 10).map((article) => (
                                        <Button
                                          key={article.id}
                                          variant="ghost"
                                          className="w-full justify-start text-left h-auto p-2"
                                          onClick={() => {
                                            // Append note to existing article
                                            const updatedContent =
                                              article.content +
                                              "\n\n---\n\n" +
                                              newQuickNote;
                                            const snippet =
                                              updatedContent
                                                .split("\n")
                                                .slice(-3)
                                                .join(" ")
                                                .substring(0, 150) + "...";

                                            setArticles((prev) =>
                                              prev.map((a) =>
                                                a.id === article.id
                                                  ? {
                                                      ...a,
                                                      content: updatedContent,
                                                      snippet,
                                                      updatedAt: new Date(),
                                                    }
                                                  : a
                                              )
                                            );

                                            // Delete the note and close dialogs
                                            if (editingQuickNote) {
                                              deleteQuickNote(
                                                editingQuickNote.id
                                              );
                                            }
                                            setEditingQuickNote(null);
                                            setNewQuickNote("");
                                          }}
                                        >
                                          <div className="text-left">
                                            <p className="font-medium text-sm">
                                              {article.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {article.snippet}
                                            </p>
                                          </div>
                                        </Button>
                                      ))}
                                    </ScrollArea>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        onClick={addQuickNote}
                        disabled={!newQuickNote.trim()}
                      >
                        {editingQuickNote ? "Update" : "Save Note"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-8">
                    <Textarea
                      placeholder="Start writing your thoughts..."
                      value={newQuickNote}
                      onChange={(e) => setNewQuickNote(e.target.value)}
                      className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent text-base leading-relaxed p-0"
                      autoFocus
                    />
                  </div>
                  <div className="p-4 border-t bg-muted/30">
                    <div className="text-xs text-muted-foreground text-center">
                      Press Ctrl+Enter to save • ESC to cancel • Convert to turn
                      into an article
                    </div>
                  </div>
                </div>
              ) : (
                /* Notes List View */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quick Notes</h1>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {filteredQuickNotes.length} notes
                      </div>
                      <Button
                        onClick={() => setNewQuickNote(" ")}
                        className="rounded-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Note
                      </Button>
                    </div>
                  </div>

                  {/* Search Notes */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your notes..."
                      value={notesSearchQuery}
                      onChange={(e) => setNotesSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {filteredQuickNotes.map((note) => (
                      <Card
                        key={note.id}
                        className="hover:shadow-sm transition-shadow group"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div
                              className="text-sm leading-relaxed line-clamp-3 cursor-pointer"
                              onClick={() => startEditQuickNote(note)}
                            >
                              {note.content}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {note.createdAt.toLocaleDateString()} at{" "}
                                {note.createdAt.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {note.updatedAt.getTime() !==
                                  note.createdAt.getTime() && (
                                  <span>
                                    {" "}
                                    • Updated{" "}
                                    {note.updatedAt.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-7 w-7 p-0"
                                      title="Convert to Article"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Convert Note to Article
                                      </DialogTitle>
                                      <DialogDescription>
                                        Transform this note into a structured
                                        article or add it to an existing one
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="p-3 bg-muted rounded border">
                                        <p className="text-sm font-medium mb-2">
                                          Note Content:
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                          {note.content}
                                        </p>
                                      </div>

                                      <div className="space-y-3">
                                        <Label>Choose Action:</Label>
                                        <div className="space-y-2">
                                          <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                              // Create new article from note
                                              const lines = note.content
                                                .trim()
                                                .split("\n");
                                              const title =
                                                lines[0].length > 50
                                                  ? lines[0].substring(0, 50) +
                                                    "..."
                                                  : lines[0];
                                              setNewArticleTitle(title);
                                              setNewArticleContent(
                                                note.content
                                              );
                                              setNewArticleNotes("");

                                              // Delete the note
                                              deleteQuickNote(note.id);
                                            }}
                                          >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create New Article
                                          </Button>

                                          {articles.length > 0 && (
                                            <div className="space-y-2">
                                              <p className="text-sm font-medium">
                                                Or add to existing article:
                                              </p>
                                              <ScrollArea className="h-32 border rounded p-2">
                                                {articles
                                                  .slice(0, 10)
                                                  .map((article) => (
                                                    <Button
                                                      key={article.id}
                                                      variant="ghost"
                                                      className="w-full justify-start text-left h-auto p-2"
                                                      onClick={() => {
                                                        // Append note to existing article
                                                        const updatedContent =
                                                          article.content +
                                                          "\n\n---\n\n" +
                                                          note.content;
                                                        const snippet =
                                                          updatedContent
                                                            .split("\n")
                                                            .slice(-3)
                                                            .join(" ")
                                                            .substring(0, 150) +
                                                          "...";

                                                        setArticles((prev) =>
                                                          prev.map((a) =>
                                                            a.id === article.id
                                                              ? {
                                                                  ...a,
                                                                  content:
                                                                    updatedContent,
                                                                  snippet,
                                                                  updatedAt:
                                                                    new Date(),
                                                                }
                                                              : a
                                                          )
                                                        );

                                                        // Delete the note
                                                        deleteQuickNote(
                                                          note.id
                                                        );
                                                      }}
                                                    >
                                                      <div className="text-left">
                                                        <p className="font-medium text-sm">
                                                          {article.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                          {article.snippet}
                                                        </p>
                                                      </div>
                                                    </Button>
                                                  ))}
                                              </ScrollArea>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditQuickNote(note);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteQuickNote(note.id);
                                  }}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredQuickNotes.length === 0 && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Edit className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            {notesSearchQuery
                              ? "No notes match your search"
                              : "No quick notes yet"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Perfect for random thoughts, ideas, and daily notes
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {(currentView === "all" || currentView === "completed") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {currentView === "completed"
                    ? "Completed Articles"
                    : "Active Articles"}
                </h1>
                <div className="text-sm text-muted-foreground">
                  {filteredArticles.length} articles
                </div>
              </div>

              {/* Article List */}
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                            {article.isDailyTitle && (
                              <Badge variant="secondary">Daily Goal</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            {article.snippet}
                          </p>
                          {article.notes && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-blue-600 mb-1">
                                Next Steps:
                              </p>
                              <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                                {article.notes}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {article.createdAt.toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>
                              Updated {article.updatedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={article.status}
                            onValueChange={(value: ArticleStatus) =>
                              updateArticleStatus(article.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="Working">Working</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditArticle(article)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Set Reminder</DialogTitle>
                                <DialogDescription>
                                  Set a reminder for {article.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reminder-date">
                                    Due Date
                                  </Label>
                                  <Input
                                    id="reminder-date"
                                    type="datetime-local"
                                    value={reminderDate}
                                    onChange={(e) =>
                                      setReminderDate(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() =>
                                    addReminder(article.id, article.title)
                                  }
                                >
                                  Set Reminder
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredArticles.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Circle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No articles match your search"
                          : "No articles yet"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Smart Input Bar - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 md:left-64">
            <div className="max-w-2xl mx-auto">
              <div className="bg-background border rounded-2xl shadow-lg p-3">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={
                      searchQuery
                        ? "Searching..."
                        : "Search articles, add daily goal, or create article..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        if (searchQuery.trim()) {
                          // If it looks like a daily goal (short, no newlines)
                          if (
                            searchQuery.length < 100 &&
                            !searchQuery.includes("\n")
                          ) {
                            const newArticle: Article = {
                              id: Date.now().toString(),
                              title: searchQuery,
                              content: `Daily Goal: ${searchQuery}\n\nCreated on ${new Date().toLocaleDateString()}`,
                              snippet: `Daily Goal: ${searchQuery}`,
                              notes: "",
                              status: "Open",
                              createdAt: new Date(),
                              updatedAt: new Date(),
                              isDailyTitle: true,
                            };
                            setArticles((prev) => [newArticle, ...prev]);
                            setSearchQuery("");
                          } else {
                            // Open create article dialog with pre-filled title
                            setNewArticleTitle(searchQuery);
                            setSearchQuery("");
                          }
                        }
                      }
                    }}
                    className="border-0 focus-visible:ring-0 bg-transparent text-base"
                  />
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className="rounded-full h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full h-8 w-8 p-0">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Article</DialogTitle>
                        <DialogDescription>
                          Add a new article to your collection
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newArticleTitle}
                            onChange={(e) => setNewArticleTitle(e.target.value)}
                            placeholder="Article title..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newArticleContent}
                            onChange={(e) =>
                              setNewArticleContent(e.target.value)
                            }
                            placeholder="Article content..."
                            rows={10}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes & Next Steps</Label>
                          <Textarea
                            id="notes"
                            value={newArticleNotes}
                            onChange={(e) => setNewArticleNotes(e.target.value)}
                            placeholder="Brief notes, important points, or next immediate steps..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addArticle}>Create Article</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Detail Dialog */}
        <Dialog
          open={!!selectedArticle}
          onOpenChange={() => setSelectedArticle(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh]">
            {selectedArticle && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl">
                      {selectedArticle.title}
                    </DialogTitle>
                    <Badge className={statusColors[selectedArticle.status]}>
                      {selectedArticle.status}
                    </Badge>
                  </div>
                  <DialogDescription>
                    Created {selectedArticle.createdAt.toLocaleDateString()} •
                    Updated {selectedArticle.updatedAt.toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="prose prose-sm max-w-none space-y-4">
                    <div className="whitespace-pre-wrap">
                      {selectedArticle.content}
                    </div>
                    {selectedArticle.notes && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm text-blue-600 mb-2">
                          Notes & Next Steps:
                        </h4>
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedArticle.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedArticle.status}
                      onValueChange={(value: ArticleStatus) => {
                        updateArticleStatus(selectedArticle.id, value);
                        setSelectedArticle((prev) =>
                          prev
                            ? { ...prev, status: value as ArticleStatus }
                            : null
                        );
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => startEditArticle(selectedArticle)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedArticle(null)}
                    >
                      Close
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={
            !!editingArticle ||
            newArticleTitle !== "" ||
            newArticleContent !== ""
          }
          onOpenChange={(open) => {
            if (!open) {
              setEditingArticle(null);
              setNewArticleTitle("");
              setNewArticleContent("");
              setNewArticleNotes("");
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? "Update your article"
                  : "Add a new article to your collection"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newArticleTitle}
                  onChange={(e) => setNewArticleTitle(e.target.value)}
                  placeholder="Article title..."
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newArticleContent}
                  onChange={(e) => setNewArticleContent(e.target.value)}
                  placeholder="Article content..."
                  rows={10}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes & Next Steps</Label>
                <Textarea
                  id="notes"
                  value={newArticleNotes}
                  onChange={(e) => setNewArticleNotes(e.target.value)}
                  placeholder="Brief notes, important points, or next immediate steps..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addArticle}>
                {editingArticle ? "Update Article" : "Create Article"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
