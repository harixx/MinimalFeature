import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/use-notes";
import { NoteListItem } from "./note-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@shared/schema";

interface NotesSidebarProps {
  selectedNoteId: number | null;
  onNoteSelect: (noteId: number) => void;
}

export function NotesSidebar({ selectedNoteId, onNoteSelect }: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: notes, isLoading } = useNotes();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const { toast } = useToast();

  const filteredNotes = notes?.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreateNote = async () => {
    try {
      const newNote = await createNoteMutation.mutateAsync({
        title: "Untitled Note",
        content: "",
      });
      onNoteSelect(newNote.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      if (selectedNoteId === noteId) {
        const remainingNotes = filteredNotes.filter(note => note.id !== noteId);
        if (remainingNotes.length > 0) {
          onNoteSelect(remainingNotes[0].id);
        } else {
          onNoteSelect(null);
        }
      }
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">Notes</h1>
          <Button
            size="sm"
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0"
            onClick={handleCreateNote}
            disabled={createNoteMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onClick={() => onNoteSelect(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {notes?.length || 0} notes
        </p>
      </div>
    </div>
  );
}
