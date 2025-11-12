import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * NoteEditor - Controlled editor for a single note with debounced update propagation.
 *
 * Props:
 * - note: { id: string, title: string, content: string, updatedAt: number } | null
 * - onUpdate: (id: string, patch: Partial<{ title: string; content: string }>) => void
 * - onDelete: (id: string) => void
 *
 * Behavior:
 * - Renders title input and content textarea controlled by internal state.
 * - Syncs internal state when the note prop changes.
 * - Debounces calls to onUpdate by 300ms on title/content edits.
 * - Provides a delete button with user confirmation.
 * - Shows "Updated <date>" with locale-aware formatting.
 */
function NoteEditor({ note, onUpdate, onDelete }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [noteId, setNoteId] = useState(note?.id || null);

  const debouncedTimerRef = useRef(null);

  // Sync local state when the selected note changes
  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setNoteId(note?.id || null);
  }, [note?.id, note?.title, note?.content]);

  // Debounce updates for title/content changes
  useEffect(() => {
    if (!noteId) return;

    // Clear previous timer
    if (debouncedTimerRef.current) {
      clearTimeout(debouncedTimerRef.current);
    }

    debouncedTimerRef.current = setTimeout(() => {
      if (!note) return;
      // Only send patch of changed fields compared to incoming note prop
      const patch = {};
      if (title !== (note.title || "")) patch.title = title;
      if (content !== (note.content || "")) patch.content = content;

      if (Object.keys(patch).length > 0) {
        onUpdate(noteId, patch);
      }
    }, 300);

    return () => {
      if (debouncedTimerRef.current) {
        clearTimeout(debouncedTimerRef.current);
      }
    };
  }, [title, content, noteId, note, onUpdate]);

  const updatedText = useMemo(() => {
    if (!note?.updatedAt) return "";
    try {
      return new Date(note.updatedAt).toLocaleString();
    } catch {
      return "";
    }
  }, [note?.updatedAt]);

  if (!note) {
    return <div style={{ opacity: 0.7 }}>Select a note to start editing.</div>;
  }

  const handleDelete = () => {
    const ok = window.confirm("Delete this note? This cannot be undone.");
    if (!ok) return;
    onDelete(note.id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
      <input
        aria-label="Note title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{
          fontSize: 18,
          fontWeight: 700,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          outlineColor: "var(--text-secondary)",
        }}
      />
      <textarea
        aria-label="Note content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        style={{
          flex: 1,
          resize: "none",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontFamily: "inherit",
          outlineColor: "var(--text-secondary)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <small style={{ opacity: 0.7 }}>
          {updatedText ? `Updated ${updatedText}` : ""}
        </small>
        <button
          className="btn"
          onClick={handleDelete}
          aria-label="Delete note"
          style={{ padding: "8px 12px" }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default NoteEditor;
