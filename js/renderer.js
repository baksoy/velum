/* ==========================================================================
   Velum Markdown Renderer
   Handles markdown parsing, front matter extraction, and code enhancement
   Uses markdown-it with footnote, deflist, abbr, and task-lists plugins
   ========================================================================== */

const VelumRenderer = {
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Parse YAML front matter from markdown content
     * Uses JSON_SCHEMA for safe parsing (prevents prototype pollution)
     * @param {string} content - Raw markdown content
     * @returns {Object} - { frontMatter: object|null, content: string }
     */
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const match = content.match(frontMatterRegex);

        if (match) {
            try {
                // Use JSON_SCHEMA for safe parsing (prevents prototype pollution)
                const frontMatter = jsyaml.load(match[1], { schema: jsyaml.JSON_SCHEMA });
                const cleanContent = content.slice(match[0].length);
                return { frontMatter, content: cleanContent };
            } catch (e) {
                console.warn('Failed to parse front matter:', e);
                return { frontMatter: null, content };
            }
        }

        return { frontMatter: null, content };
    },

    /**
     * Generate a URL-friendly slug from text (strips markdown formatting)
     * @param {string} text - Text to slugify
     * @returns {string} - URL-friendly slug
     */
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\*+|\_+|`+/g, '') // Remove markdown emphasis
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .replace(/-+/g, '-') // Remove consecutive dashes
            .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    },

    /**
     * Configure markdown-it with custom renderer rules
     */
    configureMarkdownIt() {
        const md = window.VelumMarkdownIt;
        if (!md) return;

        const self = this;
        const proxy = (tokens, idx, options, env, slf) => slf.renderToken(tokens, idx, options);

        // Enhanced heading with IDs for TOC linking
        const defaultHeadingOpen = md.renderer.rules.heading_open || proxy;
        md.renderer.rules.heading_open = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            // Next token is inline with the heading text
            const inlineToken = tokens[idx + 1];
            const text = inlineToken ? (inlineToken.content || '') : '';
            const slug = self.slugify(text) || 'heading';
            token.attrSet('id', slug);
            return defaultHeadingOpen(tokens, idx, options, env, slf);
        };

        // Enhanced code blocks: mermaid, Highlight.js, copy button
        md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            const info = token.info ? token.info.trim() : '';
            const lang = info.split(/\s+/)[0] || 'plaintext';
            const code = token.content;

            // Mermaid diagram support
            if (lang === 'mermaid') {
                return `<div class="mermaid">${self.escapeHtml(code)}</div>`;
            }

            // Syntax highlighting with Highlight.js
            const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
            let highlighted;
            try {
                highlighted = hljs.highlight(code, { language: validLang }).value;
            } catch (e) {
                highlighted = hljs.highlightAuto(code).value;
            }

            return `<pre data-language="${lang}">
                <button class="code-copy-btn" aria-label="Copy code">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                </button>
                <code class="hljs language-${validLang}">${highlighted}</code>
            </pre>`;
        };

        // Enhanced images with figure wrapper for captions (title = caption)
        md.renderer.rules.image = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            const src = token.attrGet('src') || '';
            const title = token.attrGet('title') || '';
            const altText = slf.renderInlineAsText(token.children || [], options, env);

            const titleAttr = title ? ` title="${self.escapeHtml(title)}"` : '';
            const imgTag = `<img src="${self.escapeHtml(src)}" alt="${self.escapeHtml(altText)}"${titleAttr} loading="lazy">`;

            if (title) {
                return `<figure>${imgTag}<figcaption>${self.escapeHtml(title)}</figcaption></figure>`;
            }
            return imgTag;
        };

        // Map contains-task-list to task-list for our CSS
        const defaultBulletListOpen = md.renderer.rules.bullet_list_open || proxy;
        md.renderer.rules.bullet_list_open = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            const cls = token.attrGet('class') || '';
            if (cls.includes('contains-task-list')) {
                token.attrSet('class', 'task-list');
            }
            return defaultBulletListOpen(tokens, idx, options, env, slf);
        };
    },

    /**
     * Post-process HTML for GFM alert blockquotes
     * @param {string} html - Rendered HTML
     * @returns {string} - HTML with alert blockquotes enhanced
     */
    processGfmAlerts(html) {
        const alertRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/gi;
        return html.replace(alertRegex, (match, type) => {
            const alertType = type.toLowerCase();
            return `<blockquote class="alert-${alertType}"><div class="alert-title">${type}</div><p>`;
        });
    },

    /**
     * Render markdown content to HTML
     * @param {string} markdown - Raw markdown content
     * @returns {Object} - { html: string, frontMatter: object|null }
     */
    render(markdown) {
        // Parse front matter
        const { frontMatter, content } = this.parseFrontMatter(markdown);

        // Render markdown with markdown-it
        const md = window.VelumMarkdownIt;
        if (!md) {
            console.error('VelumMarkdownIt not loaded');
            return { html: '', frontMatter };
        }

        let html = md.render(content);

        // Post-process GFM alert blockquotes
        html = this.processGfmAlerts(html);

        // Sanitize HTML with DOMPurify to prevent XSS
        if (typeof DOMPurify !== 'undefined') {
            html = DOMPurify.sanitize(html, {
                USE_PROFILES: { html: true },
                ADD_ATTR: ['target', 'loading', 'id'],
                ADD_TAGS: ['section'],
                ALLOW_DATA_ATTR: false
            });
        }

        return { html, frontMatter };
    },

    /**
     * Setup copy buttons for code blocks with ripple effect (1.9)
     */
    setupCopyButtons() {
        document.querySelectorAll('.code-copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                // 1.9 Ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove(), { once: true });

                const pre = btn.closest('pre');
                const code = pre.querySelector('code');
                const text = code.textContent;

                try {
                    await navigator.clipboard.writeText(text);
                    btn.classList.add('copied');
                    btn.querySelector('span').textContent = 'Copied!';

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.querySelector('span').textContent = 'Copy';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);

                    btn.classList.add('copied');
                    btn.querySelector('span').textContent = 'Copied!';

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.querySelector('span').textContent = 'Copy';
                    }, 2000);
                }
            });
        });
    },

    /**
     * 1.8 Setup collapsible code blocks (auto-collapse > 15 lines)
     */
    setupCodeCollapse() {
        document.querySelectorAll('pre code').forEach(code => {
            const lineCount = code.textContent.split('\n').length;
            if (lineCount <= 15) return;

            const pre = code.closest('pre');
            pre.classList.add('code-collapsed');

            const btn = document.createElement('button');
            btn.className = 'code-expand-btn';
            btn.textContent = `Show all ${lineCount} lines`;
            btn.addEventListener('click', () => {
                const isCollapsed = pre.classList.toggle('code-collapsed');
                btn.textContent = isCollapsed ? `Show all ${lineCount} lines` : 'Collapse';
            });

            pre.appendChild(btn);
        });
    },

    /**
     * Display front matter as article header
     * @param {Object} frontMatter - Parsed front matter object
     */
    displayFrontMatter(frontMatter) {
        const header = document.getElementById('article-header');
        const titleEl = document.getElementById('article-title');
        const metaEl = document.getElementById('article-meta');

        if (!frontMatter) {
            header.style.display = 'none';
            return;
        }

        let hasContent = false;

        // Title
        if (frontMatter.title) {
            titleEl.textContent = frontMatter.title;
            hasContent = true;
        } else {
            titleEl.style.display = 'none';
        }

        // Meta info (escaped to prevent XSS)
        const metaParts = [];

        if (frontMatter.author) {
            metaParts.push(`<span>By ${this.escapeHtml(frontMatter.author)}</span>`);
        }

        if (frontMatter.date) {
            const date = new Date(frontMatter.date);
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            metaParts.push(`<span>${this.escapeHtml(formatted)}</span>`);
        }

        if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
            const tags = frontMatter.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('');
            metaParts.push(tags);
        }

        if (metaParts.length > 0) {
            metaEl.innerHTML = metaParts.join(' · ');
            hasContent = true;
        }

        header.style.display = hasContent ? 'block' : 'none';
    }
};

// Initialize markdown-it configuration on load (after bundle)
VelumRenderer.configureMarkdownIt();
