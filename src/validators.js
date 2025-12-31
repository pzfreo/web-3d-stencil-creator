/**
 * Input validation utilities
 * @module validators
 */

import { VALIDATION_RULES } from './constants.js';

/**
 * Validates and sanitizes font size input
 * @param {number|string} value - The font size value to validate
 * @returns {{valid: boolean, value: number, error?: string}}
 */
export function validateFontSize(value) {
  const num = parseFloat(value);
  const { min, max, default: defaultValue } = VALIDATION_RULES.fontSize;

  if (isNaN(num)) {
    return { valid: false, value: defaultValue, error: 'Font size must be a number' };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      value: Math.max(min, Math.min(max, num)),
      error: `Font size must be between ${min} and ${max}`,
    };
  }

  return { valid: true, value: num };
}

/**
 * Validates and sanitizes padding input
 * @param {number|string} value - The padding value to validate
 * @returns {{valid: boolean, value: number, error?: string}}
 */
export function validatePadding(value) {
  const num = parseFloat(value);
  const { min, max, default: defaultValue } = VALIDATION_RULES.padding;

  if (isNaN(num)) {
    return { valid: false, value: defaultValue, error: 'Padding must be a number' };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      value: Math.max(min, Math.min(max, num)),
      error: `Padding must be between ${min} and ${max}`,
    };
  }

  return { valid: true, value: num };
}

/**
 * Validates text input
 * @param {string} text - The text to validate
 * @returns {{valid: boolean, value: string, error?: string}}
 */
export function validateText(text) {
  if (typeof text !== 'string') {
    return { valid: false, value: '', error: 'Text must be a string' };
  }

  if (text.length > VALIDATION_RULES.textMaxLength) {
    return {
      valid: false,
      value: text.substring(0, VALIDATION_RULES.textMaxLength),
      error: `Text exceeds maximum length of ${VALIDATION_RULES.textMaxLength}`,
    };
  }

  return { valid: true, value: text };
}

/**
 * Validates font selection
 * @param {string} fontName - The font filename to validate
 * @param {string[]} validFonts - Array of valid font filenames
 * @returns {{valid: boolean, value: string, error?: string}}
 */
export function validateFont(fontName, validFonts) {
  if (!validFonts.includes(fontName)) {
    return {
      valid: false,
      value: validFonts[0] || '',
      error: 'Invalid font selected',
    };
  }

  return { valid: true, value: fontName };
}

/**
 * Validates text alignment
 * @param {string} align - The alignment value to validate
 * @returns {{valid: boolean, value: string, error?: string}}
 */
export function validateAlignment(align) {
  const validAlignments = ['left', 'center', 'right'];

  if (!validAlignments.includes(align)) {
    return { valid: false, value: 'center', error: 'Invalid alignment' };
  }

  return { valid: true, value: align };
}
