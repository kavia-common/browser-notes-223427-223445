import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNotes } from './hooks/useNotes';
import { loadTheme, saveTheme } from './storage/notesStorage';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import Topbar from './components/Topbar';

// PUBLIC_INTERFACE
function App() {
  /** Root App component setting theme and rendering a two-panel layout (Sidebar + Editor) wired to useNotes hook. */
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

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
