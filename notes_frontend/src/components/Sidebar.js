import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiSearch, FiFileText } from "react-icons/fi";

/**
 * PUBLIC_INTERFACE
 * Sidebar - Accessible notes sidebar with search, selection, filtering, and keyboard navigation.
 *
 * Props:
 * - notes: Array<{ id, title, content, updatedAt }>
 * - selectedId: string | null
 * - onSelect(noteId: string): void
 * - onNew(): void
 * - query: string
 * - onQueryChange(value: string): void
 *
 * Behavior:
 * - Renders notes sorted by updatedAt desc
 * - Highlights selected note (aria-selected + CSS modifier)
 * - Click to select
 * - Keyboard navigation (Up/Down) to move selection when list is focused
 * - On Enter while focused on search, focus moves to listbox
 * - Provides ARIA roles (listbox/option), focus outline is visible
 */
function Sidebar({
  notes = [],
  selectedId = null,
  onSelect,
  onNew,
  query,
  onQueryChange,
}) {
  const [internalQuery, setInternalQuery] = useState(query || "");
  const listRef = useRef(null);
  const searchRef = useRef(null);

  // Keep internal input in sync with external query prop
  useEffect(() => {
    setInternalQuery(query || "");
  }, [query]);

  // Sort by updatedAt descending
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [notes]);

  // Handle Enter on search: move focus to the listbox
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (listRef.current) {
        listRef.current.focus();
      }
    }
  };

  // Keyboard navigation on listbox: Up/Down changes selected item
  const onListKeyDown = (e) => {
    if (!sortedNotes.length) return;
    const currentIndex = Math.max(
      0,
      sortedNotes.findIndex((n) => n.id === selectedId)
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex =
        currentIndex === -1
          ? 0
          : Math.min(sortedNotes.length - 1, currentIndex + 1);
      const next = sortedNotes[nextIndex];
      if (next && onSelect) onSelect(next.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        currentIndex === -1 ? 0 : Math.max(0, currentIndex - 1);
      const prev = sortedNotes[prevIndex];
      if (prev && onSelect) onSelect(prev.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = sortedNotes[0];
      if (first && onSelect) onSelect(first.id);
    } else if (e.key === "End") {
      e.preventDefault();
      const last = sortedNotes[sortedNotes.length - 1];
      if (last && onSelect) onSelect(last.id);
    }
  };

  const handleItemClick = (id) => {
    if (onSelect) onSelect(id);
    // After click, keep keyboard users able to continue navigation in list
    if (listRef.current) {
      listRef.current.focus();
    }
  };

  const onChangeQuery = (value) => {
    setInternalQuery(value);
    if (onQueryChange) onQueryChange(value);
  };

  return (
    <section
      aria-label="Notes list sidebar"
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <button
          className="btn"
          onClick={onNew}
          aria-label="Add note"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px" }}
        >
          <FiPlus aria-hidden="true" size={18} color="#ffffff" />
          <span>New</span>
        </button>
        <div style={{ position: "relative", flex: 1 }}>
          <FiSearch
            aria-hidden="true"
            size={16}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-secondary)",
              opacity: 0.9
            }}
          />
          <input
            ref={searchRef}
            aria-label="Search notes"
            type="search"
            placeholder="Search..."
            value={internalQuery}
            onChange={(e) => onChangeQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            style={{
              width: "100%",
              padding: "8px 10px 8px 34px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              outlineColor: "var(--text-secondary)",
            }}
          />
        </div>
      </div>

      <div
        role="listbox"
        aria-label="Notes list"
        ref={listRef}
        tabIndex={0}
        onKeyDown={onListKeyDown}
        style={{
          overflowY: "auto",
          minHeight: 0,
          outlineColor: "var(--text-secondary)",
        }}
      >
        {sortedNotes.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.7 }}>No notes yet. Click “New”.</div>
        ) : (
          sortedNotes.map((n) => {
            const active = selectedId === n.id;
            const title = n.title || "Untitled";
            const content = n.content || "";
            return (
              <div
                key={n.id}
                role="option"
                aria-selected={active ? "true" : "false"}
                onClick={() => handleItemClick(n.id)}
                className={`note-item${active ? " note-item--active" : ""}`}
                title={title}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: active ? "color-mix(in srgb, var(--color-primary) 12%, var(--bg-primary))" : "var(--bg-primary)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  <FiFileText
                    aria-hidden="true"
                    size={16}
                    style={{ color: active ? "var(--color-primary)" : "var(--color-success)" }}
                  />
                  <span>{title}</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Sidebar;
