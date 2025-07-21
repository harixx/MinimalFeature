import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Note, InsertNote, UpdateNote } from "@shared/schema";

export function useNotes() {
  return useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });
}

export function useNote(id: number | null) {
  return useQuery<Note>({
    queryKey: ["/api/notes", id],
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (note: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", note);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, note }: { id: number; note: UpdateNote }) => {
      const response = await apiRequest("PATCH", `/api/notes/${id}`, note);
      return response.json();
    },
    onSuccess: (updatedNote: Note) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.setQueryData(["/api/notes", updatedNote.id], updatedNote);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
}
