# Velum

A premium, locally-installable Markdown viewer that renders `.md` files with breathtaking typographic beauty. Crafted with editorial luxury in mind.

## Features

- **Drag & Drop** — Drop any `.md` file onto the page for instant, stunning rendering
- **Zero Config** — No build step required. Open `index.html` or serve it
- **GitHub Pages Ready** — Works as a static site with automatic deployment
- **Editorial Typography** — Refined serif fonts, perfect typographic scale, breathing whitespace
- **Dark Mode** — Toggle between warm light and rich dark themes
- **Table of Contents** — Auto-generated floating TOC with scroll spy
- **Code Highlighting** — Beautiful syntax highlighting with copy-to-clipboard
- **Front Matter Support** — YAML front matter for title, author, date
- **Export to HTML** — Download your rendered document as standalone HTML
- **Print Styles** — Gorgeous typography in print
- **Responsive** — Adapts gracefully to any screen size
- **Accessible** — Keyboard navigation, proper contrast, screen reader support

## Quick Start

### Local Development

```bash
# Clone or download the repository
cd velum

# Start a local server (choose one)
npm start              # Uses serve
npm run dev            # Uses live-server with hot reload
npm run serve          # Uses http-server

# Or simply open index.html in your browser
```

### Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Enable GitHub Pages from the `main` branch
4. The site will be live at `https://yourusername.github.io/velum`

## Usage

1. **Open Velum** in your browser
2. **Drag and drop** a `.md` file onto the page, or press `⌘+O` (Mac) / `Ctrl+O` (Windows) to open a file
3. **Enjoy** your beautifully rendered markdown

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + O` | Open file picker |
| `Alt + T` | Toggle dark mode |

### Supported Markdown Features

- Headings (H1-H6)
- Paragraphs with **bold**, *italic*, ~~strikethrough~~, `inline code`
- Ordered and unordered lists (nested)
- Task lists / checkboxes
- Blockquotes (nested)
- Code blocks with syntax highlighting
- Tables with alignment
- Images with captions
- Horizontal rules
- Links (inline and reference style)
- YAML front matter

## Typography

Velum uses a carefully curated font stack:

- **Headings**: Instrument Serif — elegant, editorial headlines
- **Body**: Source Serif 4 — refined, readable body text
- **Code**: JetBrains Mono — crisp, ligature-enabled monospace

The typographic scale follows a 1.25 (Major Third) ratio with generous line heights for optimal readability.

## Customization

### Colors

Edit `css/themes.css` to customize the color palette. All colors use CSS custom properties for easy theming.

### Typography

Edit `css/typography.css` to modify fonts, sizes, and spacing.

### Code Theme

Edit `css/code-theme.css` to customize syntax highlighting colors.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

- [Marked](https://marked.js.org/) — Markdown parser
- [highlight.js](https://highlightjs.org/) — Syntax highlighting
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML parser
- [Google Fonts](https://fonts.google.com/) — Typography

## License

MIT License — Use freely, modify endlessly, create beautifully.

---

*Velum* — Because markdown deserves to be beautiful.
