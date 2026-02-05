# Velum — Claude Code Starter Prompt

Copy and paste the prompt below into Claude Code to get started.

---

## The Prompt

````
Build "Velum" — a premium, locally-installable Markdown viewer that renders .md files with breathtaking typographic beauty. This should look like it was crafted by a world-class design studio. It must work as a static site deployable to GitHub Pages and also run locally via a simple `npx` or `npm start` command.

## Core Experience

1. **Drag & Drop**: User drags any .md file onto the page → it renders instantly with stunning typography and layout.
2. **Zero Config**: No build step for viewing. Open index.html or serve it — that's it.
3. **GitHub Pages Ready**: Works as a static site. No server-side rendering needed.

## Tech Stack

- Pure HTML/CSS/JS (single page app, no framework dependency for the viewer itself)
- Use `marked` (or `markdown-it`) for Markdown parsing
- Use `highlight.js` for syntax highlighting in code blocks
- Include a `package.json` with a `start` script using `serve` or `live-server` for local dev
- Include GitHub Actions workflow for GitHub Pages deployment

## Design Direction — "Editorial Luxury"

This is the most important part. The design must be UNFORGETTABLE. Think: the love child of a Monocle magazine layout, a Stripe documentation page, and a beautifully typeset O'Reilly book.

### Typography (THE SOUL OF THIS APP)
- **Body text**: Use a refined serif like `Newsreader`, `Literata`, `Source Serif 4`, or `Lora` from Google Fonts. NOT generic sans-serif. Markdown is about READING — honor that.
- **Headings**: Pair with a distinctive display font — something with personality like `Playfair Display`, `Fraunces`, `DM Serif Display`, or `Instrument Serif`. Headings should feel like editorial headlines.
- **Code/monospace**: Use `JetBrains Mono`, `Fira Code`, or `IBM Plex Mono` — with ligatures enabled.
- **Font sizing**: Use a perfect typographic scale (1.250 or 1.333 ratio). Body at 18-20px. Generous line-height (1.6-1.8 for body).
- **Paragraph spacing**: Elegant, breathing whitespace between paragraphs. Not cramped.
- **Max content width**: 680-720px for optimal reading measure (~65-75 characters per line).

### Color & Theme
- **Default: Warm Light Mode** — Not stark white. Think warm parchment/cream (#FDFAF6 or similar) with deep charcoal text (#1a1a1a). Accent color: a single sophisticated hue (deep terracotta, muted navy, or forest green).
- **Dark Mode**: Toggle-able. Rich dark background (#0d1117 or deep navy) with warm off-white text. NOT pure black and white.
- Use CSS custom properties for the entire color system.
- Subtle, tasteful use of color for links, blockquotes, and inline code.

### Layout & Composition
- **Centered content column** with generous margins.
- **Subtle page texture**: A barely-perceptible paper grain or noise overlay on the background for tactile warmth.
- **Blockquotes**: Styled as pull-quotes with a distinctive left border or typographic treatment — make them feel like magazine callouts.
- **Horizontal rules**: Not boring lines — use a decorative separator (ornamental flourish, three dots, a subtle SVG divider).
- **Tables**: Clean, elegant, with subtle alternating row shading and refined borders.
- **Images**: Rendered with subtle shadow/border treatment, optional caption styling for alt text.
- **Lists**: Custom bullet characters or styled markers, proper indentation hierarchy.

### Code Blocks
- Beautifully styled with a distinct background (slightly different from page).
- Rounded corners, subtle border, optional filename/language label in the top corner.
- Copy-to-clipboard button that appears on hover.
- Syntax highlighting theme that matches the overall aesthetic (create a custom one or adapt One Dark/GitHub theme).
- Inline code should have a subtle background pill treatment.

### Animations & Micro-interactions
- **Page load**: Content fades in with a subtle staggered reveal animation.
- **Drag & drop zone**: When dragging a file over the page, show an elegant overlay with visual feedback (border glow, icon animation).
- **Theme toggle**: Smooth color transition (not a jarring snap).
- **Scroll progress**: A thin, elegant progress bar at the top of the page showing reading progress.
- **Code copy button**: Subtle hover state, brief "Copied!" confirmation.
- **Links**: Elegant hover effect — underline animation or color shift.

### The Landing State (Before a File is Dropped)
This is the first impression. Make it count:
- Centered on the page: The "Velum" logo/wordmark in the display heading font.
- A brief tagline: something like "Drop a Markdown file. See it beautifully."
- A large, elegant drop zone — dashed border with rounded corners, subtle pulse animation.
- Maybe a tiny sample render below showing what the output looks like (a few lines of beautifully rendered markdown as a teaser).
- Keyboard shortcut hint: "or press ⌘+O to open a file"

### Additional Features
- **File open dialog**: Support clicking the drop zone or ⌘+O / Ctrl+O to open file picker.
- **Print styles**: Include @media print CSS so printing the rendered markdown looks gorgeous too.
- **Table of Contents**: Auto-generated floating/sidebar TOC for documents with multiple headings. Elegant, minimal, highlights current section on scroll.
- **Front matter handling**: If the .md file has YAML front matter, parse and optionally display title/author/date elegantly at the top.
- **Responsive**: Must look stunning on mobile too. The typography should adapt gracefully.
- **Remember last file**: Use localStorage to remember the last rendered content so refreshing doesn't lose it.
- **Export options**: Button to export rendered view as clean HTML file.

## File Structure

```
velum/
├── index.html
├── css/
│   ├── velum.css          # Main styles
│   ├── themes.css         # Light/dark theme variables
│   ├── typography.css     # Typographic scale & font imports
│   ├── code-theme.css     # Syntax highlighting theme
│   └── print.css          # Print styles
├── js/
│   ├── velum.js           # Main app logic
│   ├── renderer.js        # Markdown parsing & rendering
│   ├── toc.js             # Table of contents generation
│   └── drag-drop.js       # File handling
├── assets/
│   └── noise.svg          # Background texture
├── package.json           # With start script
├── README.md              # Project documentation (also serves as a demo file!)
├── SAMPLE.md              # A rich sample markdown file for testing all features
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Pages deployment
```

## Sample Markdown for Testing (SAMPLE.md)

Create a comprehensive sample markdown file that exercises EVERY markdown feature:
- H1 through H6 headings
- Paragraphs with emphasis, bold, strikethrough, inline code
- Ordered and unordered lists (nested)
- Blockquotes (including nested)
- Code blocks in multiple languages (JS, Python, CSS, bash, JSON, YAML)
- Tables (with alignment)
- Images (use placeholder URLs)
- Horizontal rules
- Links (inline and reference style)
- Task lists / checkboxes
- Footnotes (if supported)
- Math equations (bonus: KaTeX support)
- Mermaid diagrams (bonus)
- YAML front matter

## Quality Bar

- Lighthouse score: 95+ across all categories
- No layout shift on file load
- Smooth 60fps animations
- Accessible: proper contrast ratios, keyboard navigation, screen reader support
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- The README.md itself should render beautifully when dropped into Velum — dog-food it!

## Guiding Principle

Every pixel should feel intentional. When someone drops a markdown file into Velum, their reaction should be: "I didn't know markdown could look THIS good." This is not a utility — it's an experience.
````
