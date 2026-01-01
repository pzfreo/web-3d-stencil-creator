# Stencillator

Generate SVG stencils for 3D printing with ease. Create custom text stencils with various fonts, sizes, and alignments - perfect for use in slicers like Bambu Studio, PrusaSlicer, and Cura.

## Features

- **Real-time SVG Preview** - See your stencil design as you type
- **Multiple Stencil Fonts** - Choose from 5 professional stencil fonts
- **Customizable Settings** - Adjust font size, padding, and alignment
- **Multi-line Support** - Create stencils with multiple lines of text
- **Progressive Web App** - Install on desktop and mobile devices
- **Offline Capable** - Works without internet after first load
- **Download as SVG** - Get production-ready SVG files for your slicer

## Usage

### Online
Visit the live application at: [https://yourusername.github.io/stencillator](https://yourusername.github.io/stencillator)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/stencillator.git
   cd stencillator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## How It Works

Stencillator uses cutting-edge web technologies to generate high-quality SVG stencils directly in your browser:

- **Pyodide** - Runs Python in the browser via WebAssembly
- **Matplotlib** - Generates text paths for accurate SVG rendering
- **Vite** - Fast build tooling and development server
- **PWA (Progressive Web App)** - Offline functionality via service workers
- **Modern JavaScript** - Modular ES6+ code for maintainability

## Project Structure

```
stencillator/
├── public/              # Static assets served as-is
│   └── fonts/          # Stencil font files (.ttf)
├── src/                # Source code
│   ├── main.js         # Application entry point
│   ├── constants.js    # Configuration constants
│   ├── validators.js   # Input validation
│   ├── utils.js        # Utility functions
│   ├── pyodide-worker.js   # Pyodide initialization
│   ├── svg-generator.js    # SVG generation logic
│   ├── ui-controller.js    # UI event handlers
│   └── python/
│       └── testtemplate.py  # Python stencil template
├── tests/              # Test files (Vitest)
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Type check with TypeScript

### Code Quality

This project uses:
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **JSDoc** - Type checking via TypeScript
- **Vitest** - Unit and integration testing

### Adding New Fonts

1. Add the `.ttf` file to `public/fonts/`
2. Update the `FONTS` array in `src/constants.js`:
   ```javascript
   { value: 'YourFont-Regular.ttf', label: 'Your Font Name' }
   ```
3. The font will automatically be loaded by Pyodide on startup

## PWA Features

Stencillator is a fully-featured Progressive Web App:

- **Installable** - Add to home screen on mobile/desktop
- **Offline Support** - Works without internet connection
- **Fast Loading** - Service worker caches all assets
- **Responsive** - Optimized for all screen sizes

### Installing the PWA

**On Desktop (Chrome/Edge):**
1. Visit the app in your browser
2. Click the install icon in the address bar
3. Follow the prompts to install

**On Mobile (iOS/Android):**
1. Open the app in Safari/Chrome
2. Tap the share button
3. Select "Add to Home Screen"

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

**Note:** Pyodide requires modern browsers with WebAssembly support.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

- XSS protection via safe SVG insertion
- Input validation on all user inputs
- No server-side code - runs entirely in browser
- No data collection or tracking

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Fonts from [Google Fonts](https://fonts.google.com/)
- Powered by [Pyodide](https://pyodide.org/)
- Built with [Vite](https://vitejs.dev/)
- Icons would be nice (Note: PWA icons need to be created)

## Roadmap

Future enhancements:
- [ ] Export to PNG/PDF formats
- [ ] Save/load preset configurations
- [ ] Undo/redo functionality
- [ ] Dark/light mode toggle
- [ ] Additional font options
- [ ] Custom font upload
- [ ] QR code generation for stencils

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/yourusername/stencillator/issues)
- Check existing documentation
- Review the code for implementation details

---

Made with ❤️ for the 3D printing community
