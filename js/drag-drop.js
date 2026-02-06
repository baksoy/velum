/* ==========================================================================
   Velum Drag & Drop Handler
   File handling for markdown files
   ========================================================================== */

const VelumDragDrop = {
    dropZone: null,
    overlay: null,
    fileInput: null,
    dragCounter: 0,

    /**
     * Initialize drag and drop functionality
     */
    init() {
        this.dropZone = document.getElementById('drop-zone');
        this.overlay = document.getElementById('drag-overlay');
        this.fileInput = document.getElementById('file-input');

        this.setupDropZone();
        this.setupFileInput();
        this.setupGlobalDragDrop();
        this.setupKeyboardShortcuts();
        this.setupPasteHandler();
    },

    /**
     * Setup drop zone interactions
     */
    setupDropZone() {
        if (!this.dropZone) return;

        // Click to open file picker
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Keyboard accessibility
        this.dropZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.fileInput.click();
            }
        });
    },

    /**
     * Setup file input change handler
     */
    setupFileInput() {
        if (!this.fileInput) return;

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
            // Reset input so same file can be selected again
            this.fileInput.value = '';
        });
    },

    /**
     * Setup global drag and drop (works even after content is loaded)
     */
    setupGlobalDragDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Track drag enter/leave with counter (handles nested elements)
        document.body.addEventListener('dragenter', (e) => {
            this.dragCounter++;
            if (this.isValidDrag(e)) {
                this.showOverlay();
            }
        });

        document.body.addEventListener('dragleave', (e) => {
            this.dragCounter--;
            if (this.dragCounter === 0) {
                this.hideOverlay();
            }
        });

        // Handle drop
        document.body.addEventListener('drop', (e) => {
            this.dragCounter = 0;
            this.hideOverlay();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (this.isMarkdownFile(file)) {
                    this.handleFile(file);
                } else {
                    Velum.showToast('Please drop a Markdown file (.md, .markdown, or .txt)');
                }
            }
        });
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + O to open file
            if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
                e.preventDefault();
                this.fileInput.click();
            }
        });
    },

    /**
     * Setup global paste handler for clipboard markdown
     */
    setupPasteHandler() {
        document.addEventListener('paste', (e) => {
            // Skip if pasting into an input or textarea
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

            const text = e.clipboardData.getData('text/plain');
            if (!text || text.trim().length < 3) return;

            e.preventDefault();

            // Save to localStorage (matching existing pattern)
            localStorage.setItem('velum-content', text);
            localStorage.setItem('velum-filename', 'Pasted Document');

            // Render the content
            Velum.renderContent(text, 'Pasted Document');
            Velum.showToast('Pasted markdown rendered');
        });
    },

    /**
     * Check if drag event contains files
     * @param {DragEvent} e - Drag event
     * @returns {boolean}
     */
    isValidDrag(e) {
        if (!e.dataTransfer) return false;
        const types = e.dataTransfer.types;
        return types && (types.includes('Files') || types.includes('application/x-moz-file'));
    },

    /**
     * Check if file is a markdown file
     * @param {File} file - File object
     * @returns {boolean}
     */
    isMarkdownFile(file) {
        const validExtensions = ['.md', '.markdown', '.txt'];
        const validMimeTypes = ['text/markdown', 'text/x-markdown', 'text/plain'];

        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return validExtensions.includes(ext) || validMimeTypes.includes(file.type);
    },

    /**
     * Handle file reading and rendering
     * @param {File} file - File object
     */
    async handleFile(file) {
        try {
            const content = await this.readFile(file);

            // Save to localStorage
            localStorage.setItem('velum-content', content);
            localStorage.setItem('velum-filename', file.name);

            // Render the content
            Velum.renderContent(content, file.name);
        } catch (error) {
            console.error('Error reading file:', error);
            Velum.showToast('Failed to read file. Please try again.');
        }
    },

    /**
     * Read file as text
     * @param {File} file - File object
     * @returns {Promise<string>}
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },

    /**
     * Show drag overlay
     */
    showOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('active');
        }
    },

    /**
     * Hide drag overlay
     */
    hideOverlay() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }
};
