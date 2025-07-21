import { useState, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateNote } from "@/hooks/use-notes";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { Note } from "@shared/schema";

interface NoteEditorProps {
  note: Note | null;
}

function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const noteDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - noteDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  return noteDate.toLocaleDateString();
}

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const updateNoteMutation = useUpdateNote();

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note?.id]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (note && (debouncedTitle !== note.title || debouncedContent !== note.content)) {
      updateNoteMutation.mutate({
        id: note.id,
        note: {
          title: debouncedTitle,
          content: debouncedContent,
        },
      });
    }
  }, [debouncedTitle, debouncedContent, note?.id]);

  const getSaveStatus = () => {
    if (updateNoteMutation.isPending) return { status: "saving", text: "Saving..." };
    if (updateNoteMutation.isError) return { status: "error", text: "Error" };
    return { status: "saved", text: "Saved" };
  };

  const saveStatus = getSaveStatus();

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <h2 className="text-lg font-medium mb-2">No note selected</h2>
          <p className="text-sm">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        {/* Title Input */}
        <div className="px-6 py-4">
          <Input
            type="text"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-semibold bg-transparent border-none outline-none shadow-none focus-visible:ring-0 p-0 h-auto"
          />
        </div>

        {/* Formatting Toolbar */}
        <div className="px-6 py-2 flex items-center gap-1 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          {/* Auto-save indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  saveStatus.status === "saved" && "bg-green-500",
                  saveStatus.status === "saving" && "bg-yellow-500",
                  saveStatus.status === "error" && "bg-red-500"
                )}
              />
              <span>{saveStatus.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Textarea
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none border-none outline-none shadow-none focus-visible:ring-0 text-base leading-relaxed font-inter"
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{getWordCount(content)} words</span>
          <span>Last modified {formatTimeAgo(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
