/* ==========================================================================
   Velum Markdown Renderer
   Handles markdown parsing, front matter extraction, and code enhancement
   ========================================================================== */

const VelumRenderer = {
    /**
     * Parse YAML front matter from markdown content
     * @param {string} content - Raw markdown content
     * @returns {Object} - { frontMatter: object|null, content: string }
     */
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const match = content.match(frontMatterRegex);

        if (match) {
            try {
                const frontMatter = jsyaml.load(match[1]);
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
     * Configure marked with custom renderer options
     */
    configureMarked() {
        // Custom renderer for enhanced output
        const renderer = new marked.Renderer();

        // Enhanced heading with IDs for TOC linking
        renderer.heading = function(text, level) {
            // Handle both old API (text, level) and new API (token object)
            let headingText, headingLevel;

            if (typeof text === 'object' && text !== null) {
                // New API: text is a token object
                headingText = text.text;
                headingLevel = text.depth;
            } else {
                // Old API: separate parameters
                headingText = text;
                headingLevel = level;
            }

            const slug = VelumRenderer.slugify(headingText);
            return `<h${headingLevel} id="${slug}">${headingText}</h${headingLevel}>`;
        };

        // Enhanced code blocks with language labels and copy buttons
        renderer.code = function(code, language) {
            // Handle both old API (code, language) and new API (token object)
            let codeContent, codeLang;

            if (typeof code === 'object' && code !== null) {
                // New API: code is a token object
                codeContent = code.text;
                codeLang = code.lang || 'plaintext';
            } else {
                // Old API: separate parameters
                codeContent = code;
                codeLang = language || 'plaintext';
            }

            const validLang = hljs.getLanguage(codeLang) ? codeLang : 'plaintext';
            let highlighted;

            try {
                highlighted = hljs.highlight(codeContent, { language: validLang }).value;
            } catch (e) {
                highlighted = hljs.highlightAuto(codeContent).value;
            }

            return `<pre data-language="${codeLang}">
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

        // Enhanced images with figure wrapper for captions
        renderer.image = function(href, title, text) {
            // Handle both old API (href, title, text) and new API (token object)
            let imgHref, imgTitle, imgText;

            if (typeof href === 'object' && href !== null) {
                // New API: href is a token object
                imgHref = href.href;
                imgTitle = href.title || '';
                imgText = href.text || '';
            } else {
                // Old API: separate parameters
                imgHref = href;
                imgTitle = title || '';
                imgText = text || '';
            }

            const titleAttr = imgTitle ? ` title="${imgTitle}"` : '';
            return `<img src="${imgHref}" alt="${imgText}"${titleAttr} loading="lazy">`;
        };

        // Enhanced blockquotes
        renderer.blockquote = function(quote) {
            // Handle both old API (quote string) and new API (token object)
            let quoteContent;

            if (typeof quote === 'object' && quote !== null) {
                // New API: quote is a token object with tokens array
                // We need to parse the tokens back to HTML
                quoteContent = this.parser ? this.parser.parse(quote.tokens) : quote.text || '';
            } else {
                // Old API: quote is already HTML string
                quoteContent = quote;
            }

            return `<blockquote>${quoteContent}</blockquote>`;
        };

        // Task list support
        renderer.listitem = function(text, task, checked) {
            // Handle both old API (text, task, checked) and new API (token object)
            let itemText, isTask, isChecked;

            if (typeof text === 'object' && text !== null) {
                // New API: text is a token object
                isTask = text.task;
                isChecked = text.checked;
                // Parse the tokens to get the text content
                itemText = this.parser ? this.parser.parse(text.tokens) : text.text || '';
            } else {
                // Old API: separate parameters
                itemText = text;
                isTask = task;
                isChecked = checked;
            }

            if (isTask) {
                const checkedAttr = isChecked ? ' checked' : '';
                return `<li><input type="checkbox"${checkedAttr} disabled>${itemText}</li>`;
            }
            return `<li>${itemText}</li>`;
        };

        renderer.list = function(body, ordered, start) {
            // Handle both old API (body, ordered, start) and new API (token object)
            let listBody, isOrdered, startNum;

            if (typeof body === 'object' && body !== null) {
                // New API: body is a token object
                isOrdered = body.ordered;
                startNum = body.start;
                // Parse the items
                listBody = body.items.map(item => {
                    return this.listitem(item);
                }).join('\n');
            } else {
                // Old API: separate parameters
                listBody = body;
                isOrdered = ordered;
                startNum = start;
            }

            const tag = isOrdered ? 'ol' : 'ul';
            const startAttr = isOrdered && startNum !== 1 ? ` start="${startNum}"` : '';
            const taskClass = listBody.includes('type="checkbox"') ? ' class="task-list"' : '';
            return `<${tag}${startAttr}${taskClass}>${listBody}</${tag}>`;
        };

        // Configure marked options
        marked.setOptions({
            renderer: renderer,
            gfm: true,
            breaks: false,
            pedantic: false,
            smartLists: true,
            smartypants: true
        });
    },

    /**
     * Generate a URL-friendly slug from text
     * @param {string} text - Text to slugify
     * @returns {string} - URL-friendly slug
     */
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .replace(/-+/g, '-') // Remove consecutive dashes
            .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    },

    /**
     * Render markdown content to HTML
     * @param {string} markdown - Raw markdown content
     * @returns {Object} - { html: string, frontMatter: object|null }
     */
    render(markdown) {
        // Parse front matter
        const { frontMatter, content } = this.parseFrontMatter(markdown);

        // Render markdown
        const html = marked.parse(content);

        return { html, frontMatter };
    },

    /**
     * Setup copy buttons for code blocks
     */
    setupCopyButtons() {
        document.querySelectorAll('.code-copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
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

        // Meta info
        const metaParts = [];

        if (frontMatter.author) {
            metaParts.push(`<span>By ${frontMatter.author}</span>`);
        }

        if (frontMatter.date) {
            const date = new Date(frontMatter.date);
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            metaParts.push(`<span>${formatted}</span>`);
        }

        if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
            const tags = frontMatter.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            metaParts.push(tags);
        }

        if (metaParts.length > 0) {
            metaEl.innerHTML = metaParts.join(' · ');
            hasContent = true;
        }

        header.style.display = hasContent ? 'block' : 'none';
    }
};

// Initialize marked configuration on load
VelumRenderer.configureMarked();
