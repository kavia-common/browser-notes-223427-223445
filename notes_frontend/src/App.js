import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNotes } from './hooks/useNotes';
import { loadTheme, saveTheme } from './storage/notesStorage';
import Sidebar from './components/Sidebar';

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

        {/* Editor Placeholder */}
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
          {/* Placeholder for future NoteEditor component, wired via props */}
          {!selectedNote ? (
            <div style={{ opacity: 0.7 }}>Select a note to start editing.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
              <input
                aria-label="Note title"
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Title"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
              <textarea
                aria-label="Note content"
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Start typing..."
                style={{
                  flex: 1,
                  resize: 'none',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ opacity: 0.7 }}>
                  Updated {new Date(selectedNote.updatedAt).toLocaleString()}
                </small>
                <button
                  className="btn"
                  onClick={() => deleteNote(selectedNote.id)}
                  aria-label="Delete note"
                  style={{ padding: '8px 12px' }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
