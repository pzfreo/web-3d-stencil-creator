/**
 * Application constants and configuration
 */

export const FONTS = [
  { value: 'AllertaStencil-Regular.ttf', label: 'Allerta Stencil' },
  { value: 'SirinStencil-Regular.ttf', label: 'Sirin Stencil' },
  { value: 'BigShouldersStencil-Regular.ttf', label: 'Big Shoulders' },
  { value: 'EmblemaOne-Regular.ttf', label: 'Emblema One' },
  { value: 'StardosStencil-Regular.ttf', label: 'Stardos Stencil' },
];

export const PYODIDE_CONFIG = {
  packages: ['matplotlib'],
};

export const VALIDATION_RULES = {
  fontSize: { min: 5, max: 200, default: 40 },
  padding: { min: 0, max: 100, default: 10 },
  textMaxLength: 1000,
};

export const DEBOUNCE_DELAY = 500;

export const ELEMENT_IDS = {
  loadingStatus: 'loading-status',
  loadingOverlay: 'loading',
  generateBtn: 'generate-btn',
  downloadBtn: 'download-btn',
  stencilText: 'stencil-text',
  fontSizeInput: 'font-size',
  paddingInput: 'padding',
  fontFamilySelect: 'font-family',
  textAlignSelect: 'text-align',
  svgPreview: 'svg-preview',
  dimensionsInfo: 'dimensions-info',
};
