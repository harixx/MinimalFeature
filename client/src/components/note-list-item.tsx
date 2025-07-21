import { Note } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const noteDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - noteDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return noteDate.toLocaleDateString();
}

function getPreview(content: string): string {
  return content.replace(/[#*_\-`]/g, '').substring(0, 120);
}

export function NoteListItem({ note, isSelected, onClick, onDelete }: NoteListItemProps) {
  return (
    <div
      className={cn(
        "p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 group",
        isSelected && "bg-white border-l-4 border-l-blue-500"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {note.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatTimeAgo(note.updatedAt)}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {getPreview(note.content)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
