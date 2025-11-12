//
// Storage utilities for the Notes app.
// Handles safe load/save to localStorage for notes and theme without leaking content to logs.
//

const STORAGE_KEY = "notes.v1";
const THEME_KEY = "theme";

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes from localStorage, returning an array of notes with shape {id, title, content, updatedAt}. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // sanitize items to ensure correct shape
    return parsed
      .filter(Boolean)
      .map((n) => {
        const id = typeof n.id === "string" ? n.id : String(n.id || "");
        const title = typeof n.title === "string" ? n.title : "";
        const content = typeof n.content === "string" ? n.content : "";
        const updatedAt = typeof n.updatedAt === "number" ? n.updatedAt : Date.now();
        return { id, title, content, updatedAt };
      });
  } catch (e) {
    // Avoid logging content; only a minimal message
    // eslint-disable-next-line no-console
    console.warn("Notes load failed, resetting to empty.");
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Save notes array to localStorage. Ensures only serializable fields are stored. */
  try {
    if (!Array.isArray(notes)) return;
    const toStore = notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      updatedAt: n.updatedAt,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Notes save failed.");
  }
}

// PUBLIC_INTERFACE
export function loadTheme() {
  /** Load theme string ('light' or 'dark') from localStorage. Defaults to 'light'. */
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    if (!v) return "light";
    return v === "dark" ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

// PUBLIC_INTERFACE
export function saveTheme(theme) {
  /** Persist the selected theme string. */
  try {
    const t = theme === "dark" ? "dark" : "light";
    window.localStorage.setItem(THEME_KEY, t);
  } catch (e) {
    // ignore
  }
}

export const __INTERNAL_KEYS__ = { STORAGE_KEY, THEME_KEY };
