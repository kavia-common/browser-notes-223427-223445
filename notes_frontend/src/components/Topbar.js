import React from "react";
import { loadTheme, saveTheme } from "../storage/notesStorage";
import { FiPlus, FiSearch } from "react-icons/fi";

/**
 * PUBLIC_INTERFACE
 * Topbar - Application top bar with New Note button, search input, and theme toggle.
 *
 * Props:
 * - theme: "light" | "dark"
 * - onToggleTheme(): void
 * - onNew(): void
 * - query: string
 * - onQueryChange(value: string): void
 * - counts?: { total: number, filtered: number }
 *
 * Behavior:
 * - "New" button invokes onNew to create a note.
 * - Search input is controlled by query and calls onQueryChange as user types.
 * - Theme toggle switches between light/dark and persists via notesStorage helpers.
 */
function Topbar({ theme, onToggleTheme, onNew, query, onQueryChange, counts }) {
  const nextTheme = theme === "light" ? "dark" : "light";

  const handleToggle = () => {
    // Call parent first to update state
    if (onToggleTheme) onToggleTheme();
    // Persist immediately to storage to survive refresh
    const current = loadTheme();
    const toSave = current === "light" ? "dark" : "light";
    saveTheme(toSave);
  };

  return (
    <header
      className="App-header"
      style={{
        minHeight: "auto",
        padding: 12,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
      aria-label="Application top bar"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 260, flex: "1 1 260px" }}>
        <button
          className="btn"
          onClick={onNew}
          aria-label="Create new note"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px" }}
        >
          <FiPlus aria-hidden="true" size={18} color="#ffffff" />
          <span>New</span>
        </button>
        <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
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
            aria-label="Search notes"
            type="search"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQueryChange && onQueryChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px 8px 34px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              outlineColor: "var(--text-secondary)"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {counts ? (
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
            {counts.filtered} of {counts.total} shown
          </p>
        ) : null}
        <button
          className="theme-toggle"
          onClick={handleToggle}
          aria-label={`Switch to ${nextTheme} mode`}
          style={{ position: "static", padding: "8px 12px" }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </header>
  );
}

export default Topbar;
