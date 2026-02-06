/* ==========================================================================
   Velum Main Application
   Core app logic, theme management, and initialization
   ========================================================================== */

const Velum = {
    revealObserver: null,
    presentationMode: false,
    presentationSlides: [],
    presentationIndex: 0,

    /**
     * Initialize the application
     */
    init() {
        // Prevent transitions on page load
        document.body.classList.add('no-transition');

        // Initialize components
        VelumTOC.init();
        VelumDragDrop.init();
        VelumSearch.init();

        // Setup theme
        this.initTheme();
        this.setupThemeToggle();

        // Setup reading progress
        this.setupReadingProgress();

        // Setup export button
        this.setupExport();

        // Setup clear/close button
        this.setupClearButton();

        // Setup zen mode (1.6)
        this.setupZenMode();

        // Setup lightbox (2.2)
        this.setupLightbox();

        // Setup URL loading (2.6)
        this.setupURLLoading();

        // Setup presentation mode (3.1)
        this.setupPresentationMode();

        // Check for ?url= parameter
        this.checkURLParameter();

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

        // Validate theme value (only allow 'light' or 'dark')
        if (savedTheme === 'light' || savedTheme === 'dark') {
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

        // Alt+T keyboard shortcut (use e.code for macOS compatibility)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyT') {
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

        // Re-render mermaid diagrams with new theme
        this.renderMermaid();
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
            this.showToast('Exported as HTML');
        });
    },

    /**
     * Setup clear/close document button
     */
    setupClearButton() {
        const clearBtn = document.getElementById('clear-btn');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', () => {
            this.reset();
            this.showToast('Document closed');
        });
    },

    /**
     * Render mermaid diagrams in content
     */
    renderMermaid() {
        if (typeof mermaid === 'undefined') return;

        const diagrams = document.querySelectorAll('.mermaid');
        if (diagrams.length === 0) return;

        // Detect current theme for mermaid
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'strict',
            fontFamily: 'var(--font-body)'
        });

        mermaid.run({ nodes: diagrams });
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
    <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #FDFAF6;
            --text-primary: #2d2d2d;
            --text-secondary: #4a4a4a;
            --text-muted: #8b8b8b;
            --accent: #B85C38;
            --link: #2D5A7B;
            --border-light: rgba(0, 0, 0, 0.06);
            --bg-code: #F3EDE5;
            --font-heading: 'Spectral', Georgia, serif;
            --font-body: 'Spectral', Georgia, serif;
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
     * 1.4 Toast notification system
     */
    showToast(message, duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    },

    /**
     * 1.5 Calculate and display reading time
     */
    displayReadingTime(content) {
        const readingTimeEl = document.getElementById('article-reading-time');
        if (!readingTimeEl || !content) return;

        const text = content.textContent || content.innerText;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 238);
        const formattedWords = words.toLocaleString();
        readingTimeEl.textContent = `${formattedWords} words \u00B7 ${minutes} min read`;
    },

    /**
     * 1.6 Setup zen/focus mode
     */
    setupZenMode() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyZ') {
                e.preventDefault();
                this.toggleZenMode();
            }
        });
    },

    toggleZenMode() {
        const isZen = document.body.classList.toggle('zen-mode');
        this.showToast(isZen ? 'Zen mode on \u2014 Alt+Z to exit' : 'Zen mode off');
    },

    /**
     * 2.1 Setup scroll-triggered content reveal
     */
    setupScrollReveal() {
        if (this.revealObserver) {
            this.revealObserver.disconnect();
        }

        const content = document.getElementById('content');
        if (!content) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const targets = content.querySelectorAll('h2, h3, blockquote, pre, table');
        targets.forEach(el => el.classList.add('reveal-target'));

        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        targets.forEach(el => this.revealObserver.observe(el));
    },

    /**
     * 2.2 Setup image lightbox
     */
    setupLightbox() {
        const overlay = document.getElementById('lightbox-overlay');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.getElementById('lightbox-close');

        if (!overlay || !lightboxImg) return;

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target === closeBtn) {
                this.closeLightbox();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeLightbox();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeLightbox());
        }
    },

    openLightbox(src, alt) {
        const overlay = document.getElementById('lightbox-overlay');
        const lightboxImg = document.getElementById('lightbox-img');
        if (!overlay || !lightboxImg) return;

        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    },

    closeLightbox() {
        const overlay = document.getElementById('lightbox-overlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    },

    /**
     * Setup click handlers for content images and mermaid diagrams (called after render)
     */
    setupImageLightbox() {
        const content = document.getElementById('content');
        if (!content) return;

        content.querySelectorAll('img').forEach(img => {
            img.addEventListener('click', () => {
                this.openLightbox(img.src, img.alt);
            });
        });

        // Mermaid diagram click-to-zoom
        content.querySelectorAll('.mermaid').forEach(diagram => {
            diagram.style.cursor = 'zoom-in';
            diagram.addEventListener('click', () => {
                const svg = diagram.querySelector('svg');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
                this.openLightbox(dataUrl, 'Mermaid diagram');
            });
        });
    },

    /**
     * 2.6 Setup URL-based markdown loading
     */
    setupURLLoading() {
        const urlInput = document.getElementById('url-input');
        const loadBtn = document.getElementById('url-load-btn');

        if (!urlInput || !loadBtn) return;

        const doLoad = () => {
            const url = urlInput.value.trim();
            if (!url) return;
            this.loadFromURL(url);
        };

        loadBtn.addEventListener('click', doLoad);
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doLoad();
            }
        });
    },

    /**
     * Check for ?url= query parameter on page load
     */
    checkURLParameter() {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('url');
        if (url) {
            this.loadFromURL(url);
        }
    },

    /**
     * Load markdown from a URL
     */
    async loadFromURL(url) {
        try {
            // Auto-convert GitHub blob URLs to raw
            let fetchUrl = url;
            const githubBlobRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;
            const match = url.match(githubBlobRegex);
            if (match) {
                fetchUrl = `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`;
            }

            this.showToast('Loading...');

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();

            // Extract filename from URL
            const filename = fetchUrl.split('/').pop() || 'Remote Document';

            localStorage.setItem('velum-content', content);
            localStorage.setItem('velum-filename', filename);

            this.renderContent(content, filename);
            this.showToast(`Loaded: ${filename}`);
        } catch (error) {
            console.error('Error loading URL:', error);
            this.showToast(`Failed to load: ${error.message}`);
        }
    },

    /**
     * 3.1 Setup presentation mode (Alt+P)
     */
    setupPresentationMode() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyP') {
                e.preventDefault();
                this.togglePresentationMode();
            }
        });
    },

    togglePresentationMode() {
        if (this.presentationMode) {
            this.exitPresentationMode();
        } else {
            this.enterPresentationMode();
        }
    },

    enterPresentationMode() {
        const content = document.getElementById('content');
        if (!content) return;

        // Split content by h1 and h2 headings into slides
        const children = Array.from(content.children);
        this.presentationSlides = [];
        let currentSlide = [];

        children.forEach(child => {
            const tag = child.tagName;
            if ((tag === 'H1' || tag === 'H2') && currentSlide.length > 0) {
                this.presentationSlides.push(currentSlide);
                currentSlide = [];
            }
            // Strip reveal-target class so content is visible in slides
            const html = child.outerHTML.replace(/ class="reveal-target"/g, '').replace(/ class="reveal-target revealed"/g, '');
            currentSlide.push(html);
        });
        if (currentSlide.length > 0) {
            this.presentationSlides.push(currentSlide);
        }

        // Filter out slides that are effectively empty
        this.presentationSlides = this.presentationSlides.filter(slide => {
            const combined = slide.join('');
            const tmp = document.createElement('div');
            tmp.innerHTML = combined;
            return tmp.textContent.trim().length > 0;
        });

        if (this.presentationSlides.length <= 1) {
            this.showToast('No slides found (need ## headings to split)');
            return;
        }

        this.presentationMode = true;
        this.presentationIndex = 0;
        document.body.classList.add('presentation-mode');

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'presentation-overlay';
        overlay.id = 'presentation-overlay';
        overlay.innerHTML = `
            <div class="presentation-slide" id="presentation-slide"></div>
            <div class="presentation-controls">
                <button id="pres-prev" aria-label="Previous slide">\u2190</button>
                <span class="presentation-counter" id="pres-counter"></span>
                <button id="pres-next" aria-label="Next slide">\u2192</button>
                <button id="pres-exit" aria-label="Exit presentation">ESC</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Setup controls
        document.getElementById('pres-prev').addEventListener('click', () => this.presNavigate(-1));
        document.getElementById('pres-next').addEventListener('click', () => this.presNavigate(1));
        document.getElementById('pres-exit').addEventListener('click', () => this.exitPresentationMode());

        this.presKeyHandler = (e) => {
            if (e.key === 'ArrowLeft') this.presNavigate(-1);
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this.presNavigate(1); }
            if (e.key === 'Escape') this.exitPresentationMode();
        };
        document.addEventListener('keydown', this.presKeyHandler);

        this.renderSlide();
        this.showToast('Presentation mode \u2014 Esc to exit');
    },

    presNavigate(delta) {
        const newIndex = this.presentationIndex + delta;
        if (newIndex >= 0 && newIndex < this.presentationSlides.length) {
            this.presentationIndex = newIndex;
            this.renderSlide();
        }
    },

    renderSlide() {
        const slide = document.getElementById('presentation-slide');
        const counter = document.getElementById('pres-counter');
        if (!slide) return;

        slide.innerHTML = `<div class="presentation-slide-content">${this.presentationSlides[this.presentationIndex].join('')}</div>`;
        if (counter) {
            counter.textContent = `${this.presentationIndex + 1} / ${this.presentationSlides.length}`;
        }
    },

    exitPresentationMode() {
        this.presentationMode = false;
        document.body.classList.remove('presentation-mode');

        const overlay = document.getElementById('presentation-overlay');
        if (overlay) overlay.remove();

        if (this.presKeyHandler) {
            document.removeEventListener('keydown', this.presKeyHandler);
            this.presKeyHandler = null;
        }
    },

    /**
     * Render markdown content with animated page transition (1.2)
     * @param {string} markdown - Raw markdown content
     * @param {string} filename - Original filename
     */
    renderContent(markdown, filename) {
        const landing = document.getElementById('landing');
        const article = document.getElementById('article');
        const content = document.getElementById('content');
        const exportBtn = document.getElementById('export-btn');
        const clearBtn = document.getElementById('clear-btn');

        if (!content) return;

        // Render markdown
        const { html, frontMatter } = VelumRenderer.render(markdown);

        // Display front matter
        VelumRenderer.displayFrontMatter(frontMatter);

        // Update content
        content.innerHTML = html;

        // 1.2 Animated page transition
        if (landing && landing.style.display !== 'none') {
            landing.classList.add('exit-animation');
            landing.addEventListener('animationend', () => {
                landing.style.display = 'none';
                landing.classList.remove('exit-animation');
            }, { once: true });
        } else if (landing) {
            landing.style.display = 'none';
        }

        if (article) {
            article.style.display = 'block';
            article.classList.add('enter-animation');
            article.addEventListener('animationend', () => {
                article.classList.remove('enter-animation');
            }, { once: true });
        }

        if (exportBtn) exportBtn.style.display = 'flex';
        if (clearBtn) clearBtn.style.display = 'flex';

        // Render mermaid diagrams
        this.renderMermaid();

        // Setup code copy buttons
        VelumRenderer.setupCopyButtons();

        // 1.8 Setup collapsible code blocks
        VelumRenderer.setupCodeCollapse();

        // Generate TOC
        VelumTOC.generate();

        // 1.5 Display reading time
        this.displayReadingTime(content);

        // 2.1 Setup scroll reveal
        this.setupScrollReveal();

        // 2.2 Setup image lightbox clicks
        this.setupImageLightbox();

        // Update document title
        if (frontMatter && frontMatter.title) {
            document.title = `${frontMatter.title} \u2014 Velum`;
        } else if (filename) {
            document.title = `${filename} \u2014 Velum`;
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
        const clearBtn = document.getElementById('clear-btn');

        if (landing) landing.style.display = 'flex';
        if (article) article.style.display = 'none';
        if (content) content.innerHTML = '';
        if (exportBtn) exportBtn.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';

        VelumTOC.destroy();

        if (this.revealObserver) {
            this.revealObserver.disconnect();
        }

        localStorage.removeItem('velum-content');
        localStorage.removeItem('velum-filename');

        document.title = 'Velum \u2014 Beautiful Markdown';
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Velum.init();
});
