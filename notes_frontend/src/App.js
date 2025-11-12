import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNotes } from './hooks/useNotes';
import { loadTheme, saveTheme } from './storage/notesStorage';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';

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

  const counts = useMemo(() => ({ total: notes.length, filtered: filteredNotes.length }), [notes.length, filteredNotes.length]);

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', padding: 16 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 style={{ margin: 0, fontSize: 24 }}>Notes</h1>
        <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
          {counts.filtered} of {counts.total} notes shown
        </p>
        {featureFlags.length > 0 && (
          <p style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>Flags: {featureFlags.join(', ')}</p>
        )}
      </header>

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
