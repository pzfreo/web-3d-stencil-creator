/**
 * UI event handlers and DOM manipulation
 * @module ui-controller
 */

import { generateSVG } from './svg-generator.js';
import { debounce, safelyInsertSVG, downloadFile, formatDimensions } from './utils.js';
import { ELEMENT_IDS, DEBOUNCE_DELAY } from './constants.js';

let currentSvgContent = '';

/**
 * Generates SVG and updates UI
 */
async function handleGenerate() {
  const generateBtn = document.getElementById(ELEMENT_IDS.generateBtn);
  const downloadBtn = document.getElementById(ELEMENT_IDS.downloadBtn);
  const svgPreview = document.getElementById(ELEMENT_IDS.svgPreview);
  const dimensionsInfo = document.getElementById(ELEMENT_IDS.dimensionsInfo);
  const stencilText = document.getElementById(ELEMENT_IDS.stencilText);
  const fontSizeInput = document.getElementById(ELEMENT_IDS.fontSizeInput);
  const paddingInput = document.getElementById(ELEMENT_IDS.paddingInput);
  const fontFamilySelect = document.getElementById(ELEMENT_IDS.fontFamilySelect);
  const textAlignSelect = document.getElementById(ELEMENT_IDS.textAlignSelect);
  const loadingOverlay = document.getElementById(ELEMENT_IDS.loadingOverlay);

  // Don't generate if still loading
  if (generateBtn.disabled && !loadingOverlay.classList.contains('hidden')) return;

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const result = await generateSVG({
      text: stencilText.value,
      fontSize: parseFloat(fontSizeInput.value),
      padding: parseFloat(paddingInput.value),
      fontName: fontFamilySelect.value,
      alignment: textAlignSelect.value,
    });

    currentSvgContent = result.svg;

    // Use safe SVG insertion (fixes XSS vulnerability)
    const success = safelyInsertSVG(result.svg, svgPreview);

    if (success) {
      dimensionsInfo.textContent = formatDimensions(result.width, result.height);
      dimensionsInfo.style.color = '';
      downloadBtn.disabled = false;
      downloadBtn.setAttribute('aria-label', 'Download SVG stencil file');
    } else {
      dimensionsInfo.textContent = 'Error: Invalid SVG generated';
      dimensionsInfo.style.color = '#ef4444';
    }
  } catch (error) {
    console.error('Generation failed:', error);
    dimensionsInfo.textContent = `Error: ${error.message}`;
    dimensionsInfo.style.color = '#ef4444';
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate SVG';
  }
}

/**
 * Downloads the current SVG
 */
function handleDownload() {
  if (!currentSvgContent) {
    console.warn('No SVG content to download');
    return;
  }

  downloadFile(currentSvgContent, 'stencil.svg', 'image/svg+xml');
}

/**
 * Sets up all UI event listeners
 */
export function initializeUI() {
  const stencilText = document.getElementById(ELEMENT_IDS.stencilText);
  const fontSizeInput = document.getElementById(ELEMENT_IDS.fontSizeInput);
  const paddingInput = document.getElementById(ELEMENT_IDS.paddingInput);
  const fontFamilySelect = document.getElementById(ELEMENT_IDS.fontFamilySelect);
  const textAlignSelect = document.getElementById(ELEMENT_IDS.textAlignSelect);
  const generateBtn = document.getElementById(ELEMENT_IDS.generateBtn);
  const downloadBtn = document.getElementById(ELEMENT_IDS.downloadBtn);

  // Create debounced version of generate function
  const debouncedGenerate = debounce(handleGenerate, DEBOUNCE_DELAY);

  // Attach event listeners
  stencilText.addEventListener('input', debouncedGenerate);
  fontSizeInput.addEventListener('input', debouncedGenerate);
  paddingInput.addEventListener('input', debouncedGenerate);
  fontFamilySelect.addEventListener('change', handleGenerate);
  textAlignSelect.addEventListener('change', handleGenerate);
  generateBtn.addEventListener('click', handleGenerate);
  downloadBtn.addEventListener('click', handleDownload);

  // Set up accessibility
  generateBtn.setAttribute('aria-label', 'Generate SVG stencil');
  downloadBtn.setAttribute('aria-label', 'Download SVG stencil file');
}

/**
 * Performs initial SVG generation
 */
export function generateInitialSVG() {
  handleGenerate();
}
