// ============================================================================
// IDEATOR — Text Document Processor (BE-2.2)
// Extracts text from PDF, DOCX, TXT, RTF, EPUB, MD, HTML, LaTeX, patents
// ============================================================================

/** Extracted text with location metadata */
export interface ExtractedText {
  /** Full text content */
  text: string;
  /** Sections with location references */
  sections: TextSection[];
  /** Total page/section count */
  totalPages: number;
}

export interface TextSection {
  /** Section text */
  text: string;
  /** Page number, section number, etc. */
  location: string;
  /** Heading (if detected) */
  heading?: string;
}

export class TextDocumentProcessor {
  /** Extract text from a document file */
  async process(file: File): Promise<ExtractedText> {
    const extension = this.getExtension(file.name);

    switch (extension) {
      case '.txt':
      case '.md':
        return this.processPlainText(file, extension);
      case '.html':
      case '.htm':
        return this.processHTML(file);
      case '.rtf':
        return this.processRTF(file);
      case '.tex':
        return this.processLaTeX(file);
      case '.pdf':
        return this.processPDF(file);
      case '.docx':
      case '.doc':
        return this.processDOCX(file);
      case '.epub':
        return this.processEPUB(file);
      default:
        return this.processPlainText(file, extension);
    }
  }

  private async processPlainText(file: File, extension: string): Promise<ExtractedText> {
    const text = await file.text();
    const sections = this.splitIntoSections(text, extension === '.md');

    return {
      text,
      sections,
      totalPages: sections.length,
    };
  }

  private async processHTML(file: File): Promise<ExtractedText> {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Remove scripts, styles, nav, footer
    for (const tag of ['script', 'style', 'nav', 'footer', 'header']) {
      doc.querySelectorAll(tag).forEach((el) => el.remove());
    }

    const sections: TextSection[] = [];
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    if (headings.length > 0) {
      headings.forEach((heading, i) => {
        let sectionText = heading.textContent?.trim() ?? '';
        // Gather text until next heading
        let sibling = heading.nextElementSibling;
        while (sibling && !sibling.matches('h1, h2, h3, h4, h5, h6')) {
          sectionText += '\n' + (sibling.textContent?.trim() ?? '');
          sibling = sibling.nextElementSibling;
        }
        sections.push({
          text: sectionText,
          location: `Section ${i + 1}`,
          heading: heading.textContent?.trim(),
        });
      });
    } else {
      const bodyText = doc.body?.textContent?.trim() ?? '';
      sections.push({ text: bodyText, location: 'Page 1' });
    }

    const text = sections.map((s) => s.text).join('\n\n');
    return { text, sections, totalPages: sections.length };
  }

  private async processRTF(file: File): Promise<ExtractedText> {
    const raw = await file.text();
    // Strip RTF control words and groups
    const text = raw
      .replace(/\{\\[^{}]*\}/g, '') // Remove nested groups like {\fonttbl...}
      .replace(/\\[a-z]+(-?\d+)? ?/gi, '') // Remove control words
      .replace(/[{}]/g, '') // Remove remaining braces
      .replace(/\r\n?/g, '\n')
      .trim();

    const sections = this.splitIntoSections(text, false);
    return { text, sections, totalPages: sections.length };
  }

  private async processLaTeX(file: File): Promise<ExtractedText> {
    const raw = await file.text();
    const sections: TextSection[] = [];

    // Extract sections from LaTeX
    const sectionRegex = /\\(?:section|subsection|subsubsection|chapter)\{([^}]+)\}/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let sectionIndex = 0;

    while ((match = sectionRegex.exec(raw)) !== null) {
      if (sectionIndex > 0) {
        const sectionText = this.stripLaTeX(raw.slice(lastIndex, match.index));
        if (sectionText.trim()) {
          sections.push({
            text: sectionText.trim(),
            location: `Section ${sectionIndex}`,
            heading: sections[sections.length - 1]?.heading,
          });
        }
      }
      sectionIndex++;
      lastIndex = match.index + match[0].length;
      sections.push({
        text: '',
        location: `Section ${sectionIndex}`,
        heading: match[1],
      });
    }

    // Remaining content after last section
    if (lastIndex < raw.length) {
      const remaining = this.stripLaTeX(raw.slice(lastIndex));
      if (remaining.trim()) {
        if (sections.length > 0) {
          sections[sections.length - 1].text = remaining.trim();
        } else {
          sections.push({ text: remaining.trim(), location: 'Page 1' });
        }
      }
    }

    if (sections.length === 0) {
      const stripped = this.stripLaTeX(raw);
      sections.push({ text: stripped, location: 'Page 1' });
    }

    const text = sections.map((s) => [s.heading, s.text].filter(Boolean).join('\n')).join('\n\n');
    return { text, sections: sections.filter((s) => s.text), totalPages: sections.length };
  }

  private async processPDF(file: File): Promise<ExtractedText> {
    // Use pdf.js if available, otherwise extract what we can from raw bytes
    // In browser, we rely on pdf.js being loaded externally
    const pdfjsLib = (globalThis as any).pdfjsLib;
    if (pdfjsLib) {
      return this.processPDFWithPdfJs(file, pdfjsLib);
    }

    // Fallback: try to extract text from PDF raw content
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const text = this.extractTextFromPDFBytes(bytes);
    const sections = this.splitIntoSections(text, false);
    return { text, sections, totalPages: sections.length || 1 };
  }

  private async processPDFWithPdfJs(file: File, pdfjsLib: any): Promise<ExtractedText> {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const sections: TextSection[] = [];
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      pageTexts.push(pageText);
      sections.push({
        text: pageText,
        location: `Page ${i}`,
      });
    }

    return {
      text: pageTexts.join('\n\n'),
      sections,
      totalPages: pdf.numPages,
    };
  }

  private async processDOCX(file: File): Promise<ExtractedText> {
    // Use mammoth.js if available
    const mammoth = (globalThis as any).mammoth;
    if (mammoth) {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const text = result.value;
      const sections = this.splitIntoSections(text, false);
      return { text, sections, totalPages: sections.length || 1 };
    }

    // Fallback: extract text from DOCX ZIP structure
    const text = await this.extractTextFromDOCXZip(file);
    const sections = this.splitIntoSections(text, false);
    return { text, sections, totalPages: sections.length || 1 };
  }

  private async processEPUB(file: File): Promise<ExtractedText> {
    // EPUB is a ZIP containing XHTML files
    // Reuse ZIP extraction approach
    const text = await this.extractTextFromZipXHTML(file);
    const sections = this.splitIntoSections(text, false);
    return { text, sections, totalPages: sections.length || 1 };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private stripLaTeX(tex: string): string {
    return tex
      .replace(/\\begin\{[^}]+\}.*?\\end\{[^}]+\}/gs, '') // Remove environments
      .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?\{([^}]*)\}/g, '$2') // \cmd{text} → text
      .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?/g, '') // Remove remaining commands
      .replace(/[{}$%&_^~]/g, '') // Remove special chars
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private splitIntoSections(text: string, isMarkdown: boolean): TextSection[] {
    const sections: TextSection[] = [];
    const headerRegex = isMarkdown ? /^(#{1,6})\s+(.+)$/gm : /^(.+)\n[=\-]{3,}$|^(?=[A-Z][A-Z\s]{5,})/gm;

    if (isMarkdown) {
      const parts = text.split(/(?=^#{1,6}\s)/m);
      parts.forEach((part, i) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const headingMatch = trimmed.match(/^#{1,6}\s+(.+)/);
        sections.push({
          text: trimmed,
          location: `Section ${i + 1}`,
          heading: headingMatch?.[1],
        });
      });
    } else {
      // Split into roughly equal sections of ~2000 chars
      const chunkSize = 2000;
      for (let i = 0; i < text.length; i += chunkSize) {
        let end = Math.min(i + chunkSize, text.length);
        // Try to break at sentence boundary
        if (end < text.length) {
          const nextPeriod = text.indexOf('. ', end - 200);
          if (nextPeriod !== -1 && nextPeriod < end + 200) {
            end = nextPeriod + 2;
          }
        }
        sections.push({
          text: text.slice(i, end).trim(),
          location: `Section ${sections.length + 1}`,
        });
        if (end !== i + chunkSize) i = end - chunkSize; // adjust
      }
    }

    return sections.length > 0 ? sections : [{ text, location: 'Page 1' }];
  }

  private extractTextFromPDFBytes(bytes: Uint8Array): string {
    // Simple heuristic: find text between stream/endstream and extract printable ASCII
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(bytes);
    const texts: string[] = [];
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(raw)) !== null) {
      // Extract text show operators: Tj and TJ
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(match[1])) !== null) {
        texts.push(tjMatch[1]);
      }
    }

    return texts.join(' ').replace(/\s+/g, ' ').trim() || '[PDF text extraction requires pdf.js library]';
  }

  private async extractTextFromDOCXZip(file: File): Promise<string> {
    // DOCX contains word/document.xml
    // Minimal extraction without full ZIP library
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder();
    const raw = decoder.decode(bytes);

    // Find XML content between <w:t> tags
    const texts: string[] = [];
    const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      texts.push(match[1]);
    }

    return texts.join(' ') || '[DOCX extraction requires mammoth.js library]';
  }

  private async extractTextFromZipXHTML(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder();
    const raw = decoder.decode(new Uint8Array(buffer));

    // Extract text from HTML/XHTML tags
    const stripped = raw
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return stripped || '[EPUB extraction requires a ZIP library]';
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }
}
