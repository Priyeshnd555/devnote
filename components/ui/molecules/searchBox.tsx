

const detectIntent = (input: string, articles: Article[]): 'search' | 'note' | 'article' => {
  if (!input.trim()) return 'search';

  const cleanedInput = input.trim();
  const words = cleanedInput.split(/\s+/);
  const wordCount = words.length;

  const hasSentenceStructure = /[.?!]/.test(cleanedInput);
  const isSearchCommand = /^(find|search|look for)\b/i.test(cleanedInput);

  const matchesArticle = articles.some(
    (article) =>
      article.title.toLowerCase().includes(cleanedInput.toLowerCase()) ||
      (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(cleanedInput.toLowerCase())))
  );

  if (isSearchCommand || matchesArticle) return 'search';
  if (wordCount <= 5 && !hasSentenceStructure) return 'note';
  if (wordCount >= 6 || hasSentenceStructure) return 'article';

  return 'note'; // Fallback
};


import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";

type Article = {
  id: string;
  title: string;
  content: string;
  snippet: string;
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isDailyTitle: boolean;
  tags?: string[];
};

type Props = {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  addArticle: () => void;
};

export default function SmartInputBar({ articles, setArticles, addArticle }: Props) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<'search' | 'note' | 'article'>('search');
  const [newArticleTitle, setNewArticleTitle] = useState<string>("");
  const [newArticleContent, setNewArticleContent] = useState<string>("");
  const [newArticleNotes, setNewArticleNotes] = useState<string>("");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 md:left-64">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background border rounded-2xl shadow-lg p-3">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={searchQuery ? "Processing..." : "Search articles, add note, or create article..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const detected = detectIntent(e.target.value, articles);
                setCurrentMode(detected);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  const intent = detectIntent(searchQuery, articles);

                  if (intent === 'search') {
                    console.log('Performing search:', searchQuery);
                    // Add your search function here
                    setSearchQuery('');
                  } else if (intent === 'note') {
                    const newArticle: Article = {
                      id: Date.now().toString(),
                      title: searchQuery,
                      content: `Note: ${searchQuery}\n\nCreated on ${new Date().toLocaleDateString()}`,
                      snippet: `Note: ${searchQuery}`,
                      notes: "",
                      status: "Open",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      isDailyTitle: true,
                    };
                    setArticles((prev) => [newArticle, ...prev]);
                    setSearchQuery('');
                  } else if (intent === 'article') {
                    setNewArticleTitle(searchQuery);
                    setSearchQuery('');
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
            {searchQuery && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground">Mode: {currentMode}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const modes: ('search' | 'note' | 'article')[] = ['search', 'note', 'article'];
                    const currentIndex = modes.indexOf(currentMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    setCurrentMode(nextMode);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Switch Mode
                </Button>
              </div>
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
                  <DialogDescription>Add a new article to your collection</DialogDescription>
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
                  <Button onClick={addArticle}>Create Article</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
