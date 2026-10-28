/**
 * Strips AsciiDoc NOTE blocks from behavior text.
 *
 * Returns an empty string for non-string or whitespace-only input.
 * Removes NOTE markers and their content while preserving surrounding text:
 * - Block-style notes (delimited by `====`) are removed entirely
 * - Inline-style notes are removed up to the next paragraph break
 * - Text after NOTE sections is preserved when present
 *
 * Pure — takes a string, returns a cleaned string.
 */
export function cleanBehaviorText(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }
  return value
    .replace(/\n?\[NOTE\]\n?={4,}\n[\s\S]*?={4,}/g, '')
    .replace(/\n?\[NOTE\]\n(?:(?!\n\n)[\s\S])*(\n\n|$)/g, '$1')
    .trim();
}

/**
 * Explains when an extension has no instruction encodings in the catalogue.
 *
 * Returns a short explanatory string when the extension's `instructions` map
 * is empty, or null when it has instructions (so the caller can render the
 * normal instruction list instead).
 *
 * The explanation is derived from fields the catalogue already carries —
 * `csrs`, `behavior`, and the extension id — so nothing new needs to be
 * maintained. Catalogue entries without instruction encodings mapped include:
 * umbrellas, VLEN parameters, behavioural guarantees, CSR-only extensions,
 * and draft or unmodeled sets (such as RV128I). Silence in the detail panel
 * reads as absent data; a short note clarifies that no instruction encodings
 * are currently available in this catalogue, noting known characteristics where
 * catalogue metadata provides them.
 *
 * Ratified extensions get definitive wording ("This extension adds no
 * instructions; …") because the spec is final and their instruction set is
 * known. Draft, development, frozen, and unclassified extensions get hedged
 * wording ("No instruction encodings are listed for this extension yet.")
 * because the catalogue may simply not have mapped them yet.
 *
 * Pure — takes the catalogue entry, returns a string. No React, no data
 * import. Callers pass the entry.
 */
export function noInstructionReason(ext) {
  if (!ext || Object.keys(ext.instructions || {}).length > 0) return null;

  const isRatified = ext.state === 'ratified';

  if (!isRatified) {
    return 'No instruction encodings are listed for this extension yet.';
  }

  // ── Ratified: definitive wording ──────────────────────────────────────────

  const csrCount = Object.keys(ext.csrs || {}).length;
  const hasBehavior = typeof ext.behavior === 'string' && ext.behavior.trim().length > 0;
  const isVlenParam = /^Zvl\d+b$/.test(ext.id);

  if (isVlenParam) {
    return 'This extension adds no instructions; it defines a vector length (VLEN) parameter.';
  }
  if (csrCount > 0 && hasBehavior) {
    const s = csrCount === 1 ? '' : 's';
    return `This extension adds no instructions; it touches ${csrCount} control/status register${s} (listed below) and its behavior is described below.`;
  }
  if (csrCount > 0) {
    const s = csrCount === 1 ? '' : 's';
    return `This extension adds no instructions; it touches ${csrCount} control/status register${s} (listed below).`;
  }
  if (hasBehavior) {
    return 'This extension adds no instructions; its behavior is described below.';
  }
  return 'This extension adds no instructions.';
}
