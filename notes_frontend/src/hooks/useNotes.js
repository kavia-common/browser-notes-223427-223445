import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadNotes, saveNotes } from "../storage/notesStorage";
import { generateId } from "../utils/id";

/**
 * PUBLIC_INTERFACE
 * useNotes - Hook providing notes CRUD, selection, filtering, and debounced persistence.
 *
 * State:
 * - notes: Array<{id, title, content, updatedAt}>
 * - selectedNoteId: string | null
 * - query: string
 *
 * Derived:
 * - filteredNotes: notes filtered by query across title and content (case-insensitive)
 * - selectedNote: currently selected note object or null
 *
 * API:
 * - addNote()
 * - updateNote(id, patch)
 * - deleteNote(id)
 * - selectNote(id)
 * - setQuery(query)
 */
export function useNotes() {
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedNoteId, setSelectedNoteId] = useState(
    () => (Array.isArray(notes) && notes[0] && notes[0].id) || null
  );
  const [query, setQuery] = useState("");

  const debouncedTimerRef = useRef(null);

  // Debounced persistence whenever notes change
  useEffect(() => {
    if (debouncedTimerRef.current) {
      clearTimeout(debouncedTimerRef.current);
    }
    debouncedTimerRef.current = setTimeout(() => {
      saveNotes(notes);
    }, 300);
    return () => {
      if (debouncedTimerRef.current) {
        clearTimeout(debouncedTimerRef.current);
      }
    };
  }, [notes]);

  const addNote = useCallback(() => {
    const now = Date.now();
    const newNote = {
      id: generateId(),
      title: "Untitled",
      content: "",
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    return newNote.id;
  }, []);

  const updateNote = useCallback((id, patch) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const updated = {
          ...n,
          ...patch,
          updatedAt: Date.now(),
        };
        return updated;
      })
    );
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedNoteId((curr) => (curr === id ? null : curr));
  }, []);

  const selectNote = useCallback((id) => {
    setSelectedNoteId(id);
  }, []);

  const filteredNotes = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    if (!q) return notes;
    return notes.filter((n) => {
      const t = (n.title || "").toLowerCase();
      const c = (n.content || "").toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notes, query]);

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Feature flags (reserved for future)
  const featureFlags = (process.env.REACT_APP_FEATURE_FLAGS || "").split(",").map((s) => s.trim()).filter(Boolean);

  return {
    notes,
    selectedNoteId,
    query,
    filteredNotes,
    selectedNote,
    featureFlags,

    addNote,
    updateNote,
    deleteNote,
    selectNote,
    setQuery,
  };
}
