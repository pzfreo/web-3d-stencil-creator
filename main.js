const loadingStatus = document.getElementById('loading-status');
const loadingOverlay = document.getElementById('loading');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const stencilText = document.getElementById('stencil-text');
const fontSizeInput = document.getElementById('font-size');
const paddingInput = document.getElementById('padding');
const fontFamilySelect = document.getElementById('font-family');
const textAlignSelect = document.getElementById('text-align');
const svgPreview = document.getElementById('svg-preview');
const dimensionsInfo = document.getElementById('dimensions-info');

let pyodide;
let currentSvgContent = '';

async function initPyodide() {
    try {
        loadingStatus.textContent = 'Loading Pyodide core...';
        pyodide = await loadPyodide();

        loadingStatus.textContent = 'Loading Matplotlib and dependencies...';
        await pyodide.loadPackage(['matplotlib']);

        loadingStatus.textContent = 'Mounting font files...';
        const fonts = [
            'AllertaStencil-Regular.ttf',
            'SirinStencil-Regular.ttf',
            'BigShouldersStencil-Regular.ttf',
            'EmblemaOne-Regular.ttf',
            'StardosStencil-Regular.ttf'
        ];

        for (const font of fonts) {
            loadingStatus.textContent = `Mounting ${font}...`;
            const fontResponse = await fetch(font);
            const fontBuffer = await fontResponse.arrayBuffer();
            pyodide.FS.writeFile(font, new Uint8Array(fontBuffer));
        }

        loadingStatus.textContent = 'Preparing Python environment...';
        await pyodide.runPythonAsync(`
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
    `);

        loadingOverlay.classList.add('hidden');
        generateBtn.disabled = false;

        // Initial generation
        generateSvg();
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        loadingStatus.textContent = 'Error: ' + error.message;
        loadingStatus.style.color = '#ef4444';
    }
}

async function generateSvg() {
    if (generateBtn.disabled && !loadingOverlay.classList.contains('hidden')) return;

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
        const text = stencilText.value;
        const size = parseFloat(fontSizeInput.value) || 10;
        const padding = parseFloat(paddingInput.value) || 0;
        const fontName = fontFamilySelect.value;
        const textAlign = textAlignSelect.value;

        const result = await pyodide.runPythonAsync(`
generate_svg_py(${JSON.stringify(text)}, ${size}, ${padding}, ${JSON.stringify(fontName)}, ${JSON.stringify(textAlign)})
    `);

        const [svg, width, height] = result.toJs();
        currentSvgContent = svg;
        svgPreview.innerHTML = svg;
        dimensionsInfo.textContent = `Dimensions: ${width.toFixed(1)}mm x ${height.toFixed(1)}mm`;
        downloadBtn.disabled = false;
    } catch (error) {
        console.error('Generation failed:', error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate SVG';
    }
}

function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const debouncedGenerate = debounce(generateSvg, 500);

stencilText.addEventListener('input', debouncedGenerate);
fontSizeInput.addEventListener('input', debouncedGenerate);
paddingInput.addEventListener('input', debouncedGenerate);
fontFamilySelect.addEventListener('change', generateSvg);
textAlignSelect.addEventListener('change', generateSvg);

function downloadSvg() {
    if (!currentSvgContent) return;
    const blob = new Blob([currentSvgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stencil.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

generateBtn.addEventListener('click', generateSvg);
downloadBtn.addEventListener('click', downloadSvg);

initPyodide();
