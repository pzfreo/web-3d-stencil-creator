/**
 * Utility functions
 * @module utils
 */

/**
 * Creates a debounced function that delays invoking func
 * @param {Function} func - The function to debounce
 * @param {number} timeout - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Safely parses SVG string and inserts into DOM
 * @param {string} svgString - The SVG markup string
 * @param {HTMLElement} container - The container element
 * @returns {boolean} Success status
 */
export function safelyInsertSVG(svgString, container) {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');

    // Check for parsing errors
    const parserError = svgDoc.querySelector('parsererror');
    if (parserError) {
      console.error('SVG parsing error:', parserError);
      return false;
    }

    // Clear container and insert parsed SVG
    container.replaceChildren(svgDoc.documentElement);
    return true;
  } catch (error) {
    console.error('Error inserting SVG:', error);
    return false;
  }
}

/**
 * Creates a downloadable blob from content
 * @param {string} content - The file content
 * @param {string} filename - The desired filename
 * @param {string} mimeType - The MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gets an element by ID with type checking
 * @param {string} id - The element ID
 * @returns {HTMLElement|null}
 */
export function getElementByIdSafe(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
  }
  return element;
}

/**
 * Formats dimensions for display
 * @param {number} width - Width in mm
 * @param {number} height - Height in mm
 * @returns {string} Formatted string
 */
export function formatDimensions(width, height) {
  return `Dimensions: ${width.toFixed(1)}mm x ${height.toFixed(1)}mm`;
}
