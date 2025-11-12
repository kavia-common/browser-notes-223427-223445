//
// Hash-based routing utilities for the Notes app.
// Route format: #/note/:id
//

// PUBLIC_INTERFACE
export function parseHash() {
  /** Parse window.location.hash and return a route object { name: 'note', params: { id } } or null if not matched. */
  try {
    const raw = (window.location.hash || "").trim();
    // Expected formats:
    // "" or "#": no route
    // "#/note/:id"
    if (!raw || raw === "#" || raw === "#/") {
      return null;
    }

    // Normalize: ensure starts with '#'
    const hash = raw.startsWith("#") ? raw.slice(1) : raw;
    const parts = hash.split("/").filter(Boolean); // e.g., ["note", ":id"]

    if (parts.length === 2 && parts[0] === "note") {
      const id = decodeURIComponent(parts[1] || "");
      if (id) {
        return { name: "note", params: { id } };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getNoteIdFromHash() {
  /** Convenience to extract note id from hash route or return null if not present/invalid. */
  const route = parseHash();
  if (route?.name === "note" && route.params?.id) {
    return route.params.id;
  }
  return null;
}

// PUBLIC_INTERFACE
export function setNoteHash(id, replace = false) {
  /**
   * Set the URL hash to #/note/:id. Uses history.replaceState when replace=true to avoid pushing new history entries.
   * Gracefully no-ops if id is falsy.
   */
  try {
    if (!id) return;
    const safe = encodeURIComponent(String(id));
    const nextHash = `#/note/${safe}`;
    if (replace) {
      // Avoid extra history entries when syncing initial selection
      if (window.location.hash !== nextHash) {
        // replaceState preserves scroll position and current URL minus hash
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    } else {
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
  } catch {
    // ignore errors writing location
  }
}

// PUBLIC_INTERFACE
export function clearHash(replace = false) {
  /** Clear the hash to "#" (no route). */
  try {
    const nextHash = "#";
    if (replace) {
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    } else {
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
  } catch {
    // ignore
  }
}
