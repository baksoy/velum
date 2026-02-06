/* ==========================================================================
   Velum In-Document Search (2.5)
   Cmd+F search overlay with highlight navigation
   ========================================================================== */

const VelumSearch = {
    isOpen: false,
    matches: [],
    currentIndex: -1,

    init() {
        this.searchBar = document.getElementById('search-bar');
        this.searchInput = document.getElementById('search-input');
        this.searchCounter = document.getElementById('search-counter');
        this.searchClose = document.getElementById('search-close');
        this.searchPrev = document.getElementById('search-prev');
        this.searchNext = document.getElementById('search-next');

        if (!this.searchBar) return;

        this.setupKeyboard();
        this.setupControls();
    },

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Intercept Cmd/Ctrl+F only when article is visible
            const article = document.getElementById('article');
            if (!article || article.style.display === 'none') return;

            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                this.open();
            }

            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    setupControls() {
        let debounceTimer;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.performSearch(), 150);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.navigatePrev();
                } else {
                    this.navigateNext();
                }
            }
        });

        this.searchClose.addEventListener('click', () => this.close());
        this.searchPrev.addEventListener('click', () => this.navigatePrev());
        this.searchNext.addEventListener('click', () => this.navigateNext());
    },

    open() {
        this.isOpen = true;
        this.searchBar.style.display = 'flex';
        this.searchInput.focus();
        this.searchInput.select();
    },

    close() {
        this.isOpen = false;
        this.searchBar.style.display = 'none';
        this.clearHighlights();
        this.searchInput.value = '';
        this.searchCounter.textContent = '';
        this.matches = [];
        this.currentIndex = -1;
    },

    performSearch() {
        this.clearHighlights();
        this.matches = [];
        this.currentIndex = -1;

        const query = this.searchInput.value.trim();
        if (!query) {
            this.searchCounter.textContent = '';
            return;
        }

        const content = document.getElementById('content');
        if (!content) return;

        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        const queryLower = query.toLowerCase();

        textNodes.forEach(node => {
            const text = node.textContent;
            const textLower = text.toLowerCase();
            let startIndex = 0;
            let index;

            const fragments = [];
            let lastEnd = 0;

            while ((index = textLower.indexOf(queryLower, startIndex)) !== -1) {
                // Text before match
                if (index > lastEnd) {
                    fragments.push(document.createTextNode(text.slice(lastEnd, index)));
                }
                // Highlighted match
                const mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = text.slice(index, index + query.length);
                fragments.push(mark);
                this.matches.push(mark);

                lastEnd = index + query.length;
                startIndex = lastEnd;
            }

            if (fragments.length > 0) {
                // Remaining text
                if (lastEnd < text.length) {
                    fragments.push(document.createTextNode(text.slice(lastEnd)));
                }
                const parent = node.parentNode;
                fragments.forEach(f => parent.insertBefore(f, node));
                parent.removeChild(node);
            }
        });

        if (this.matches.length > 0) {
            this.currentIndex = 0;
            this.highlightCurrent();
        }

        this.updateCounter();
    },

    highlightCurrent() {
        this.matches.forEach(m => m.classList.remove('active'));
        if (this.currentIndex >= 0 && this.currentIndex < this.matches.length) {
            const current = this.matches[this.currentIndex];
            current.classList.add('active');
            current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    },

    navigateNext() {
        if (this.matches.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.matches.length;
        this.highlightCurrent();
        this.updateCounter();
    },

    navigatePrev() {
        if (this.matches.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.matches.length) % this.matches.length;
        this.highlightCurrent();
        this.updateCounter();
    },

    updateCounter() {
        if (this.matches.length === 0) {
            this.searchCounter.textContent = this.searchInput.value ? '0/0' : '';
        } else {
            this.searchCounter.textContent = `${this.currentIndex + 1}/${this.matches.length}`;
        }
    },

    clearHighlights() {
        document.querySelectorAll('mark.search-highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }
};
