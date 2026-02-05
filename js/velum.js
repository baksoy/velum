/* ==========================================================================
   Velum Main Application
   Core app logic, theme management, and initialization
   ========================================================================== */

const Velum = {
    /**
     * Initialize the application
     */
    init() {
        // Prevent transitions on page load
        document.body.classList.add('no-transition');

        // Initialize components
        VelumTOC.init();
        VelumDragDrop.init();

        // Setup theme
        this.initTheme();
        this.setupThemeToggle();

        // Setup font
        this.initFont();
        this.setupFontToggle();

        // Setup reading progress
        this.setupReadingProgress();

        // Setup export button
        this.setupExport();

        // Check for saved content
        this.loadSavedContent();

        // Remove no-transition class after a tick
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('no-transition');
            });
        });
    },

    /**
     * Initialize theme from localStorage or system preference
     */
    initTheme() {
        const savedTheme = localStorage.getItem('velum-theme');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('velum-theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    },

    /**
     * Setup theme toggle button
     */
    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Alt+T keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('velum-theme', newTheme);
    },

    /**
     * Initialize font from localStorage
     */
    initFont() {
        const savedFont = localStorage.getItem('velum-font');

        if (savedFont) {
            document.documentElement.setAttribute('data-font', savedFont);
        }
        // Default is "a" (no attribute needed, CSS defaults apply)
    },

    /**
     * Setup font toggle button
     */
    setupFontToggle() {
        const toggle = document.getElementById('font-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            this.toggleFont();
        });

        // Alt+F keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                this.toggleFont();
            }
        });
    },

    /**
     * Toggle between font pairings A and B
     */
    toggleFont() {
        const currentFont = document.documentElement.getAttribute('data-font');
        const newFont = currentFont === 'b' ? 'a' : 'b';

        if (newFont === 'a') {
            document.documentElement.removeAttribute('data-font');
        } else {
            document.documentElement.setAttribute('data-font', newFont);
        }
        localStorage.setItem('velum-font', newFont);
    },

    /**
     * Setup reading progress indicator
     */
    setupReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                    progressBar.style.width = `${Math.min(progress, 100)}%`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    /**
     * Setup export functionality
     */
    setupExport() {
        const exportBtn = document.getElementById('export-btn');
        if (!exportBtn) return;

        exportBtn.addEventListener('click', () => {
            this.exportHTML();
        });
    },

    /**
     * Export rendered content as HTML file
     */
    exportHTML() {
        const content = document.getElementById('content');
        const header = document.getElementById('article-header');

        if (!content) return;

        // Build standalone HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported from Velum</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #FDFAF6;
            --text-primary: #1a1a1a;
            --text-secondary: #4a4a4a;
            --text-muted: #8b8b8b;
            --accent: #B85C38;
            --link: #2D5A7B;
            --border-light: rgba(0, 0, 0, 0.06);
            --bg-code: #F3EDE5;
            --font-heading: 'Instrument Serif', Georgia, serif;
            --font-body: 'Source Serif 4', Georgia, serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: var(--font-body);
            font-size: 18px;
            line-height: 1.7;
            color: var(--text-primary);
            background: var(--bg-primary);
            max-width: 42rem;
            margin: 0 auto;
            padding: 4rem 1.5rem;
        }
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: 400; line-height: 1.2; margin-top: 2rem; margin-bottom: 1rem; }
        h1 { font-size: 2.5rem; font-style: italic; }
        h2 { font-size: 2rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; }
        h3 { font-size: 1.5rem; }
        p { margin-bottom: 1.5rem; }
        a { color: var(--link); }
        pre { background: var(--bg-code); padding: 1.5rem; border-radius: 8px; overflow-x: auto; margin: 1.5rem 0; }
        code { font-family: var(--font-mono); font-size: 0.875em; }
        blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; margin: 1.5rem 0; font-style: italic; color: var(--text-secondary); }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        th, td { border: 1px solid var(--border-light); padding: 0.75rem 1rem; text-align: left; }
        ul, ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; }
        hr { border: none; height: 1px; background: var(--border-light); margin: 3rem auto; max-width: 6rem; }
    </style>
</head>
<body>
    ${header && header.style.display !== 'none' ? header.outerHTML : ''}
    ${content.innerHTML}
</body>
</html>`;

        // Create and download file
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'velum-export.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Load saved content from localStorage
     */
    loadSavedContent() {
        const savedContent = localStorage.getItem('velum-content');
        const savedFilename = localStorage.getItem('velum-filename');

        if (savedContent) {
            this.renderContent(savedContent, savedFilename || 'Saved Document');
        }
    },

    /**
     * Render markdown content
     * @param {string} markdown - Raw markdown content
     * @param {string} filename - Original filename
     */
    renderContent(markdown, filename) {
        const landing = document.getElementById('landing');
        const article = document.getElementById('article');
        const content = document.getElementById('content');
        const exportBtn = document.getElementById('export-btn');

        if (!content) return;

        // Render markdown
        const { html, frontMatter } = VelumRenderer.render(markdown);

        // Display front matter
        VelumRenderer.displayFrontMatter(frontMatter);

        // Update content
        content.innerHTML = html;

        // Hide landing, show article
        if (landing) landing.style.display = 'none';
        if (article) article.style.display = 'block';
        if (exportBtn) exportBtn.style.display = 'flex';

        // Setup code copy buttons
        VelumRenderer.setupCopyButtons();

        // Generate TOC
        VelumTOC.generate();

        // Update document title
        if (frontMatter && frontMatter.title) {
            document.title = `${frontMatter.title} — Velum`;
        } else if (filename) {
            document.title = `${filename} — Velum`;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Handle hash links
        if (window.location.hash) {
            setTimeout(() => {
                const id = window.location.hash.slice(1);
                VelumTOC.scrollToHeading(id);
            }, 100);
        }
    },

    /**
     * Reset to landing state
     */
    reset() {
        const landing = document.getElementById('landing');
        const article = document.getElementById('article');
        const content = document.getElementById('content');
        const exportBtn = document.getElementById('export-btn');

        if (landing) landing.style.display = 'flex';
        if (article) article.style.display = 'none';
        if (content) content.innerHTML = '';
        if (exportBtn) exportBtn.style.display = 'none';

        VelumTOC.destroy();

        localStorage.removeItem('velum-content');
        localStorage.removeItem('velum-filename');

        document.title = 'Velum — Beautiful Markdown';
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Velum.init();
});
