import { concat } from './actions/concat.js';
import { replace } from './actions/replace.js';
import { split } from './actions/split.js';
import { find } from './actions/find.js';
import { markdownToHtml } from './actions/markdown-to-html.js';
import { htmlToMarkdown } from './actions/html-to-markdown.js';
import { stripHtml } from './actions/strip-html.js';
import { slugify } from './actions/slugify.js';
import { defaultValue } from './actions/default-value.js';

const textParserPlugin = {
    name: "Text Parser",
    icon: "📝",
    description: "Tools for text processing and manipulation",
    id: "text-parser",
    runner: "node",
    documentation: "https://mintflow.com/docs/plugins/text-parser",
    actions: [
        concat,
        replace,
        split,
        find,
        markdownToHtml,
        htmlToMarkdown,
        stripHtml,
        slugify,
        defaultValue
    ]
};

export default textParserPlugin;
