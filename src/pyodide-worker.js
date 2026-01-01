/**
 * Pyodide initialization and font management
 * @module pyodide-worker
 */

/* global loadPyodide */

import { PYODIDE_CONFIG, FONTS } from './constants.js';

// Import fonts as Vite assets (from src/assets, not public)
import allertaFont from './assets/AllertaStencil-Regular.ttf?url';
import sirinFont from './assets/SirinStencil-Regular.ttf?url';
import bigShouldersFont from './assets/BigShouldersStencil-Regular.ttf?url';
import emblemaFont from './assets/EmblemaOne-Regular.ttf?url';
import stardosFont from './assets/StardosStencil-Regular.ttf?url';
import blackOpsFont from './assets/BlackOpsOne-Regular.ttf?url';
import marshFont from './assets/Marsh-Regular.otf?url';

// Map font filenames to their imported URLs
const FONT_URLS = {
  'AllertaStencil-Regular.ttf': allertaFont,
  'SirinStencil-Regular.ttf': sirinFont,
  'BigShouldersStencil-Regular.ttf': bigShouldersFont,
  'EmblemaOne-Regular.ttf': emblemaFont,
  'StardosStencil-Regular.ttf': stardosFont,
  'BlackOpsOne-Regular.ttf': blackOpsFont,
  'Marsh-Regular.otf': marshFont,
};

let pyodide = null;

/**
 * Updates loading status message
 * @param {HTMLElement} statusElement - The status display element
 * @param {string} message - The message to display
 */
function updateStatus(statusElement, message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

/**
 * Loads font files into Pyodide filesystem
 * @param {Object} pyodideInstance - The Pyodide instance
 * @param {HTMLElement} statusElement - Status display element
 */
async function loadFonts(pyodideInstance, statusElement) {
  const errors = [];

  for (const font of FONTS) {
    // Get the Vite-resolved URL for this font
    const fontPath = FONT_URLS[font.value];

    if (!fontPath) {
      console.error(`Font URL not found for: ${font.value}`);
      errors.push(`${font.value}: URL not resolved by Vite`);
      continue;
    }

    updateStatus(statusElement, `Mounting ${font.label}...`);

    try {
      console.log(`Loading font from: ${fontPath}`);
      const fontResponse = await fetch(fontPath);
      if (!fontResponse.ok) {
        throw new Error(`HTTP ${fontResponse.status}`);
      }
      const fontBuffer = await fontResponse.arrayBuffer();
      pyodideInstance.FS.writeFile(font.value, new Uint8Array(fontBuffer));
      console.log(`✓ Loaded ${font.value}`);
    } catch (error) {
      console.error(`✗ Error loading font ${font.value}:`, error);
      errors.push(`${font.value}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.warn(`Failed to load ${errors.length} fonts:`, errors);
    // Don't throw - allow app to continue with available fonts
  }
}

/**
 * Loads the Python stencil generation code
 * @param {Object} pyodideInstance - The Pyodide instance
 */
async function loadPythonCode(pyodideInstance) {
  // Python code for SVG stencil generation
  const pythonCode = `
import matplotlib.pyplot as plt
from matplotlib.text import TextPath
from matplotlib.font_manager import FontProperties

def generate_svg_py(text_to_print, font_size, padding, font_name="AllertaStencil-Regular.ttf", align="center"):
    fp = FontProperties(fname=font_name)

    lines = text_to_print.split('\\n')
    line_paths = []
    line_bboxes = []

    current_y = 0
    line_height_factor = 1.2

    # We stack lines. Note that Matplotlib Y is UP.
    # To have lines appear Top-to-Bottom in the output,
    # we can either reverse them here or handle it in the coordinate transform.
    # Let's keep them as is and transform carefully.
    for line in reversed(lines):
        if not line.strip():
            current_y += font_size * line_height_factor
            continue
        # Initial path to get width
        temp_p = TextPath((0, 0), line, size=font_size, prop=fp)
        line_bboxes.append(temp_p.get_extents())
        line_paths.append((line, current_y)) # Store line and y for later processing
        current_y += font_size * line_height_factor

    if not line_paths:
        return "", 0, 0

    # Calculate overall width and full vertical range
    xmin = min(b.xmin for b in line_bboxes)
    xmax = max(b.xmax for b in line_bboxes)
    width = xmax - xmin

    # The actual vertical range:
    # y_min is the ymin of the first line (at y_pos=0)
    # y_max is the ymax of the last line (at y_pos=last_y)
    # Since we stack lines upwards starting from y=0:
    first_line_bbox = line_bboxes[0]
    last_line_bbox = line_bboxes[-1]
    last_y = line_paths[-1][1]

    ymin_total = first_line_bbox.ymin
    ymax_total = last_y + last_line_bbox.ymax

    total_text_height = ymax_total - ymin_total

    rect_width = width + (padding * 2)
    rect_height = total_text_height + (padding * 2)

    # Rectangle path (SVG coordinates: 0,0 is top-left)
    rect_path_d = f"M 0 0 L {rect_width} 0 L {rect_width} {rect_height} L 0 {rect_height} Z"

    def transform(vx, vy):
        tx = vx + padding
        # Matplotlib vy maps to SVG y.
        # Matplotlib vy=ymin_total should map to SVG y = rect_height - padding
        # Matplotlib vy=ymax_total should map to SVG y = padding
        ty = rect_height - (vy - ymin_total + padding)
        return f"{tx:.2f} {ty:.2f}"

    text_d_parts = []
    for line_text, y_pos in line_paths:
        # Calculate x_offset based on alignment
        line_bbox = TextPath((0, 0), line_text, size=font_size, prop=fp).get_extents()
        line_width = line_bbox.width

        if align == "center":
            x_offset = (width - line_width) / 2 - line_bbox.xmin
        elif align == "right":
            x_offset = (width - line_width) - line_bbox.xmin
        else: # left
            x_offset = -line_bbox.xmin

        path = TextPath((x_offset, y_pos), line_text, size=font_size, prop=fp)

        for vertices, code in path.iter_segments():
            if code == path.MOVETO:
                text_d_parts.append(f"M {transform(vertices[0], vertices[1])}")
            elif code == path.LINETO:
                text_d_parts.append(f"L {transform(vertices[0], vertices[1])}")
            elif code == path.CURVE3:
                p1 = transform(vertices[0], vertices[1])
                p2 = transform(vertices[2], vertices[3])
                text_d_parts.append(f"Q {p1} {p2}")
            elif code == path.CURVE4:
                p1 = transform(vertices[0], vertices[1])
                p2 = transform(vertices[2], vertices[3])
                p3 = transform(vertices[4], vertices[5])
                text_d_parts.append(f"C {p1} {p2} {p3}")
            elif code == path.CLOSEPOLY:
                text_d_parts.append("Z")

    text_d_string = " ".join(text_d_parts)

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {rect_width} {rect_height}" width="{rect_width}mm" height="{rect_height}mm">
    <path fill="black" stroke="none" fill-rule="evenodd" d="
        {rect_path_d}
        {text_d_string}
    " />
    </svg>"""

    return svg_content, rect_width, rect_height
`;

  await pyodideInstance.runPythonAsync(pythonCode);
}

/**
 * Initializes Pyodide with all dependencies
 * @param {HTMLElement} statusElement - Status display element
 * @returns {Promise<Object>} The initialized Pyodide instance
 */
export async function initPyodide(statusElement) {
  if (pyodide) {
    return pyodide;
  }

  try {
    updateStatus(statusElement, 'Loading Pyodide core...');
    pyodide = await loadPyodide();

    updateStatus(statusElement, 'Loading Matplotlib and dependencies...');
    await pyodide.loadPackage(PYODIDE_CONFIG.packages);

    updateStatus(statusElement, 'Mounting font files...');
    await loadFonts(pyodide, statusElement);

    updateStatus(statusElement, 'Preparing Python environment...');
    await loadPythonCode(pyodide);

    return pyodide;
  } catch (error) {
    console.error('Failed to initialize Pyodide:', error);
    throw error;
  }
}

/**
 * Gets the current Pyodide instance
 * @returns {Object|null} The Pyodide instance or null if not initialized
 */
export function getPyodide() {
  return pyodide;
}
