import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes input strings to prevent XSS and normalize Unicode characters.
 * Follows @/data-protection workflow requirements.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // 1. Normalize Unicode characters (NFC is standard for web)
  const normalized = input.normalize('NFC');

  // 2. Remove/encode HTML tags
  // We use a strict configuration by default. No tags allowed for basic text.
  return sanitizeHtml(normalized, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape'
  }).trim();
};

/**
 * A more relaxed sanitizer for content that might allow some formatting (e.g. bold, italic)
 * Use only where explicitly needed.
 */
export const sanitizeRichText = (input: string): string => {
  if (!input) return '';

  const normalized = input.normalize('NFC');

  return sanitizeHtml(normalized, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard'
  }).trim();
};
