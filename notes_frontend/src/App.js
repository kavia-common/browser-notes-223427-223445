import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { useNotes } from './hooks/useNotes';
import { loadTheme, saveTheme } from './storage/notesStorage';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import Topbar from './components/Topbar';
import { getNoteIdFromHash, setNoteHash, clearHash } from './routes';

// PUBLIC_INTERFACE
function App() {
  /** Root App component setting theme and rendering a two-panel layout (Sidebar + Editor) wired to useNotes hook.
   * Adds hash-based URL syncing for selected note:
   * - On mount: selects note by id from URL hash if present and exists; otherwise uses existing selection.
   * - On selection change: updates URL hash to #/note/:id; clears when no selection.
   * - Listens to hashchange events to update selection when users navigate browser history.
   */
  const {
    notes,
    filteredNotes,
    selectedNote,
    selectedNoteId,
    query,
    featureFlags,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    setQuery,
  } = useNotes();

  const [theme, setTheme] = useState(() => loadTheme());

  // Track initial sync to avoid double-pushing history
  const didInitialHashSyncRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // On mount: attempt to select note from hash; attach hashchange listener
  useEffect(() => {
    // Initial selection from hash
    const hashId = getNoteIdFromHash();
    if (hashId) {
      // Only select if the id exists in notes
      const exists = notes.some(n => n.id === hashId);
      if (exists) {
        selectNote(hashId);
        // Avoid adding a new history entry during initial sync
        setNoteHash(hashId, true /* replace */);
        didInitialHashSyncRef.current = true;
      }
    } else {
      // No note id in hash; if we have a current selection, reflect it in URL
      if (selectedNoteId) {
        setNoteHash(selectedNoteId, true /* replace */);
        didInitialHashSyncRef.current = true;
      } else {
        // No selection either; ensure hash cleared
        clearHash(true /* replace */);
        didInitialHashSyncRef.current = true;
      }
    }

    // Listen for manual hash changes/back-forward navigation
    const onHashChange = () => {
      const idFromUrl = getNoteIdFromHash();
      if (!idFromUrl) {
        // If hash cleared, clear selection gracefully (App/editor already handles null)
        // We won't force select a note here to honor user/back navigation.
        return;
      }
      // If note exists, select it; otherwise, keep current selection and normalize URL later
      const exists = notes.some(n => n.id === idFromUrl);
      if (exists) {
        selectNote(idFromUrl);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
    // We intentionally want this to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync when selectedNoteId changes
  useEffect(() => {
    if (!didInitialHashSyncRef.current) {
      // If initial sync hasn't happened yet (very early state), skip; the mount effect will handle.
      return;
    }
    if (selectedNoteId) {
      setNoteHash(selectedNoteId /* id */, false /* replace */);
    } else {
      clearHash(false /* replace */);
    }
  }, [selectedNoteId]);

  // If the URL points to a non-existent note, normalize the hash to current valid selection when notes list changes
  useEffect(() => {
    if (!didInitialHashSyncRef.current) return;
    const idFromUrl = getNoteIdFromHash();
    if (idFromUrl && !notes.some(n => n.id === idFromUrl)) {
      if (selectedNoteId) {
        setNoteHash(selectedNoteId, true /* replace */);
      } else {
        clearHash(true /* replace */);
      }
    }
  }, [notes, selectedNoteId]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const counts = useMemo(
    () => ({ total: notes.length, filtered: filteredNotes.length }),
    [notes.length, filteredNotes.length]
  );

  return (
    <div className="App">
      <Topbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNew={addNote}
        query={query}
        onQueryChange={setQuery}
        counts={counts}
      />

      {featureFlags.length > 0 && (
        <div style={{ padding: '6px 12px', fontSize: 12, opacity: 0.6 }}>
          Flags: {featureFlags.join(', ')}
        </div>
      )}

      <main
        role="main"
        aria-label="Notes application"
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1px',
          background: 'var(--border-color)',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        {/* Sidebar */}
        <Sidebar
          notes={filteredNotes}
          selectedId={selectedNoteId}
          onSelect={selectNote}
          onNew={addNote}
          query={query}
          onQueryChange={setQuery}
        />

        {/* Editor */}
        <section
          aria-label="Note editor"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <NoteEditor
            note={selectedNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
