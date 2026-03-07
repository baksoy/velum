/**
 * Markdown-it bundle entry point.
 * Bundled with esbuild for browser use. Exports to window.VelumMarkdownIt.
 */
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import taskLists from 'markdown-it-task-lists';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
})
    .use(footnote)
    .use(deflist)
    .use(abbr)
    .use(taskLists, { enabled: false }); // disabled = non-interactive checkboxes

window.VelumMarkdownIt = md;
