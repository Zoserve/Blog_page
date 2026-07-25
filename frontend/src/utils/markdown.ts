export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // 1. Escape basic HTML tags to prevent XSS injection, while keeping our custom parser tags
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Code blocks (```lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // 4. Images (![alt](url))
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    return `<img src="${url}" alt="${alt}" class="rounded-2xl shadow-sm my-6 max-h-[450px] object-cover mx-auto" />`;
  });

  // 5. Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    // Check if it's a YouTube video link to embed
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) {
        return `<div class="aspect-video w-full rounded-2xl overflow-hidden my-6 shadow-sm"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="w-full h-full"></iframe></div>`;
      }
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // 6. Blockquotes (> quote)
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

  // 7. Headings (# h1, ## h2, ### h3)
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // 8. Bullet points (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');
  // Group list items
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  // Fix nested double list wrapper bug
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // 9. Numbered lists (1. item)
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  // 10. Tables (markdown headers | cell)
  // Simple table parsing
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse text-sm"><thead>';
        // Header Row
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        tableHtml += '<tr>' + cols.map(c => `<th class="px-4 py-2 border bg-slate-100 font-bold">${c}</th>`).join('') + '</tr></thead><tbody>';
        // Skip next line if it is separator (e.g. |---|---|)
        if (i + 1 < lines.length && lines[i + 1].includes('-|')) {
          i++;
        }
      } else {
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        tableHtml += '<tr>' + cols.map(c => `<td class="px-4 py-2 border">${c}</td>`).join('') + '</tr>';
      }
      lines[i] = ''; // clear line
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        lines[i] = tableHtml + '\n' + lines[i];
      }
    }
  }
  html = lines.join('\n');

  // 11. Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 12. Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 13. Paragraph double breaks
  html = html.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    // Skip wrapping if it is already heading, list, pre, blockquote, table
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<pre') || trimmed.startsWith('<block') || trimmed.startsWith('<div')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n\n');

  return html;
}
