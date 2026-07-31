import { marked } from 'marked';
import TurndownService from 'turndown';

// ---------------------------------------------------------------------------
// Markdown → HTML  (used when loading an existing post into TipTap)
// ---------------------------------------------------------------------------
marked.setOptions({
  gfm: true,  // GitHub-flavoured markdown (tables, strikethrough, task lists)
  breaks: true, // Treat single \n as <br>
});

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  // marked.parse is synchronous when no async tokens are involved
  return marked.parse(markdown) as string;
}

// ---------------------------------------------------------------------------
// HTML → Markdown  (used when saving from TipTap to backend)
// ---------------------------------------------------------------------------
const td = new TurndownService({
  headingStyle: 'atx',         // # H1  ## H2
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  hr: '---',
  strongDelimiter: '**',
  emDelimiter: '*',
});

// Keep <br> as a markdown line break
td.addRule('lineBreak', {
  filter: 'br',
  replacement: () => '  \n',
});

// GFM table support -- keep table HTML as-is since turndown doesn't handle tables
// well by default; we convert them to a simple pipe-table representation
td.addRule('table', {
  filter: ['table'],
  replacement: (_content, node) => {
    const el = node as HTMLElement;
    const rows = Array.from(el.querySelectorAll('tr'));
    if (!rows.length) return '';

    const lines: string[] = [];
    rows.forEach((row, rowIdx) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const line = '| ' + cells.map(c => c.textContent?.trim() ?? '').join(' | ') + ' |';
      lines.push(line);
      // Insert separator after header row
      if (rowIdx === 0) {
        const sep = '| ' + cells.map(() => '---').join(' | ') + ' |';
        lines.push(sep);
      }
    });

    return '\n\n' + lines.join('\n') + '\n\n';
  },
});

// Preserve YouTube iframes as markdown-style embed comment (no standard MD syntax)
td.addRule('iframe', {
  filter: 'iframe',
  replacement: (_content, node) => {
    const src = (node as HTMLElement).getAttribute('src') ?? '';
    const ytMatch = src.match(/youtube\.com\/embed\/([^?]+)/);
    if (ytMatch) {
      return `\n\n[YouTube Video](https://www.youtube.com/watch?v=${ytMatch[1]})\n\n`;
    }
    return '';
  },
});

export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return td.turndown(html);
}
