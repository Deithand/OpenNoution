/**
 * Markdown Converter Utility
 * Converts between OpenNoution format and Markdown
 */

// Convert OpenNoution page to Markdown
export const pageToMarkdown = (page, blocks) => {
  let markdown = `# ${page.title}\n\n`;

  blocks.forEach(block => {
    switch (block.type) {
      case 'text':
        markdown += `${block.content}\n\n`;
        break;
      case 'h1':
        markdown += `# ${block.content}\n\n`;
        break;
      case 'h2':
        markdown += `## ${block.content}\n\n`;
        break;
      case 'h3':
        markdown += `### ${block.content}\n\n`;
        break;
      case 'list':
        markdown += `- ${block.content}\n`;
        break;
      case 'checklist':
        const checked = block.checked ? 'x' : ' ';
        markdown += `- [${checked}] ${block.content}\n`;
        break;
      case 'quote':
        markdown += `> ${block.content}\n\n`;
        break;
      case 'code':
        markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
        break;
      default:
        markdown += `${block.content}\n\n`;
    }
  });

  return markdown;
};

// Convert all pages to Markdown (for full export)
export const allPagesToMarkdown = (pages, blocksMap) => {
  let markdown = `# OpenNoution Export\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `---\n\n`;

  pages.forEach((page, index) => {
    if (index > 0) markdown += '\n\n---\n\n';
    const blocks = blocksMap[page.id] || [];
    markdown += pageToMarkdown(page, blocks);
  });

  return markdown;
};

// Convert Markdown to OpenNoution blocks
export const markdownToBlocks = (markdown) => {
  const lines = markdown.split('\n');
  const blocks = [];
  let codeBlockContent = [];
  let inCodeBlock = false;

  lines.forEach(line => {
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          type: 'code',
          content: codeBlockContent.join('\n'),
          checked: false,
        });
        codeBlockContent = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Skip empty lines
    if (!line.trim()) return;

    // Headers
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.slice(2).trim(), checked: false });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.slice(3).trim(), checked: false });
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.slice(4).trim(), checked: false });
    }
    // Checklist
    else if (line.match(/^- \[(x| )\]/)) {
      const checked = line.includes('[x]');
      const content = line.replace(/^- \[(x| )\] /, '').trim();
      blocks.push({ type: 'checklist', content, checked });
    }
    // List
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'list', content: line.slice(2).trim(), checked: false });
    }
    // Quote
    else if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', content: line.slice(2).trim(), checked: false });
    }
    // Regular text
    else {
      blocks.push({ type: 'text', content: line.trim(), checked: false });
    }
  });

  return blocks;
};

// Parse multiple pages from markdown (for import)
export const parseMarkdownPages = (markdown) => {
  const sections = markdown.split(/\n---\n/);
  const pages = [];

  sections.forEach(section => {
    const lines = section.trim().split('\n');
    if (lines.length === 0) return;

    // First H1 becomes the page title
    let title = 'Импортированная страница';
    let contentLines = lines;

    if (lines[0].startsWith('# ')) {
      title = lines[0].slice(2).trim();
      contentLines = lines.slice(1);
    }

    const blocks = markdownToBlocks(contentLines.join('\n'));

    if (blocks.length > 0 || title !== 'Импортированная страница') {
      pages.push({ title, blocks });
    }
  });

  return pages;
};
