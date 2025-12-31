/**
 * SVG generation logic
 * @module svg-generator
 */

import { getPyodide } from './pyodide-worker.js';
import {
  validateFontSize,
  validatePadding,
  validateText,
  validateFont,
  validateAlignment,
} from './validators.js';
import { FONTS } from './constants.js';

/**
 * Generates SVG stencil using Python/Matplotlib
 * @param {Object} params - Generation parameters
 * @param {string} params.text - The text to render
 * @param {number} params.fontSize - Font size in mm
 * @param {number} params.padding - Padding in mm
 * @param {string} params.fontName - Font filename
 * @param {string} params.alignment - Text alignment
 * @returns {Promise<{svg: string, width: number, height: number}>}
 * @throws {Error} If generation fails
 */
export async function generateSVG({ text, fontSize, padding, fontName, alignment }) {
  const pyodide = getPyodide();

  if (!pyodide) {
    throw new Error('Pyodide not initialized');
  }

  // Validate all inputs
  const validatedText = validateText(text);
  const validatedFontSize = validateFontSize(fontSize);
  const validatedPadding = validatePadding(padding);
  const validatedFont = validateFont(
    fontName,
    FONTS.map((f) => f.value)
  );
  const validatedAlignment = validateAlignment(alignment);

  // Log validation warnings
  const validations = [
    validatedText,
    validatedFontSize,
    validatedPadding,
    validatedFont,
    validatedAlignment,
  ];
  validations.forEach((v) => {
    if (!v.valid && v.error) {
      console.warn(v.error);
    }
  });

  try {
    // Execute Python function with validated values
    const result = await pyodide.runPythonAsync(`
generate_svg_py(
  ${JSON.stringify(validatedText.value)},
  ${validatedFontSize.value},
  ${validatedPadding.value},
  ${JSON.stringify(validatedFont.value)},
  ${JSON.stringify(validatedAlignment.value)}
)
    `);

    const [svg, width, height] = result.toJs();

    return {
      svg,
      width,
      height,
    };
  } catch (error) {
    console.error('SVG generation error:', error);
    throw new Error(`Failed to generate SVG: ${error.message}`);
  }
}
