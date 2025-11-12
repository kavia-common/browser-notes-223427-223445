//
// Simple ID generator using timestamp + random suffix
//

// PUBLIC_INTERFACE
export function generateId(prefix = "note") {
  /** Generate a unique-ish ID string suitable for client-side use. */
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rnd}`;
}
