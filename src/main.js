/**
 * Main application entry point
 */

import { initPyodide } from './pyodide-worker.js';
import { initializeUI, generateInitialSVG } from './ui-controller.js';
import { ELEMENT_IDS } from './constants.js';

/**
 * Application initialization
 */
async function init() {
  const loadingStatus = document.getElementById(ELEMENT_IDS.loadingStatus);
  const loadingOverlay = document.getElementById(ELEMENT_IDS.loadingOverlay);
  const generateBtn = document.getElementById(ELEMENT_IDS.generateBtn);

  try {
    // Initialize Pyodide
    await initPyodide(loadingStatus);

    // Hide loading overlay
    loadingOverlay.classList.add('hidden');

    // Enable generate button
    generateBtn.disabled = false;

    // Set up UI event handlers
    initializeUI();

    // Generate initial SVG
    generateInitialSVG();

    // Register PWA service worker if available
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.warn('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.warn('Service Worker registration failed:', error);
          });
      });
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    loadingStatus.textContent = `Error: ${error.message}`;
    loadingStatus.style.color = '#ef4444';
  }
}

// Start the application
init();
