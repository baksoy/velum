/* ==========================================================================
   Velum Table of Contents
   Auto-generated floating TOC with scroll spy
   ========================================================================== */

const VelumTOC = {
    headings: [],
    tocList: null,
    toc: null,
    activeId: null,
    observer: null,

    /**
     * Initialize the table of contents
     */
    init() {
        this.toc = document.getElementById('toc');
        this.tocList = document.getElementById('toc-list');
    },

    /**
     * Generate TOC from content headings
     */
    generate() {
        if (!this.tocList) return;

        // Clear existing TOC
        this.tocList.innerHTML = '';
        this.headings = [];

        // Find all headings in the content
        const content = document.getElementById('content');
        if (!content) return;

        const headingElements = content.querySelectorAll('h2, h3, h4');

        if (headingElements.length < 2) {
            this.hide();
            return;
        }

        headingElements.forEach(heading => {
            const id = heading.id || VelumRenderer.slugify(heading.textContent);
            heading.id = id;

            this.headings.push({
                id,
                text: heading.textContent,
                level: parseInt(heading.tagName.charAt(1))
            });

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.className = `toc-${heading.tagName.toLowerCase()}`;
            a.dataset.id = id;

            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToHeading(id);
            });

            li.appendChild(a);
            this.tocList.appendChild(li);
        });

        this.show();
        this.setupScrollSpy();
    },

    /**
     * Scroll to a heading smoothly
     * @param {string} id - Heading ID
     */
    scrollToHeading(id) {
        const heading = document.getElementById(id);
        if (heading) {
            const offset = 80; // Account for fixed elements
            const top = heading.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top,
                behavior: 'smooth'
            });

            // Update URL without jumping
            history.pushState(null, null, `#${id}`);
        }
    },

    /**
     * Setup Intersection Observer for scroll spy
     */
    setupScrollSpy() {
        // Disconnect previous observer if exists
        if (this.observer) {
            this.observer.disconnect();
        }

        const options = {
            rootMargin: '-80px 0px -80% 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActive(entry.target.id);
                }
            });
        }, options);

        // Observe all headings
        this.headings.forEach(heading => {
            const el = document.getElementById(heading.id);
            if (el) {
                this.observer.observe(el);
            }
        });
    },

    /**
     * Set active TOC item
     * @param {string} id - Active heading ID
     */
    setActive(id) {
        if (this.activeId === id) return;
        this.activeId = id;

        // Remove active class from all
        this.tocList.querySelectorAll('a').forEach(a => {
            a.classList.remove('active');
        });

        // Add active class to current
        const activeLink = this.tocList.querySelector(`a[data-id="${id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');

            // Scroll TOC to keep active item visible
            const tocRect = this.toc.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
                activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    },

    /**
     * Show the TOC
     */
    show() {
        if (this.toc) {
            this.toc.classList.add('visible');
        }
    },

    /**
     * Hide the TOC
     */
    hide() {
        if (this.toc) {
            this.toc.classList.remove('visible');
        }
        if (this.observer) {
            this.observer.disconnect();
        }
    },

    /**
     * Destroy the TOC
     */
    destroy() {
        this.hide();
        if (this.tocList) {
            this.tocList.innerHTML = '';
        }
        this.headings = [];
        this.activeId = null;
    }
};
