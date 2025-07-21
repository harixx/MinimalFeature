import { useState, useEffect } from "react";
import { NotesSidebar } from "@/components/notes-sidebar";
import { NoteEditor } from "@/components/note-editor";
import { useNotes, useNote } from "@/hooks/use-notes";

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const { data: notes } = useNotes();
  const { data: selectedNote } = useNote(selectedNoteId);

  // Auto-select first note when notes are loaded
  useEffect(() => {
    if (notes && notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  return (
    <div className="flex h-screen font-inter bg-white text-gray-900 overflow-hidden">
      <NotesSidebar
        selectedNoteId={selectedNoteId}
        onNoteSelect={setSelectedNoteId}
      />
      <NoteEditor note={selectedNote || null} />
    </div>
  );
}
