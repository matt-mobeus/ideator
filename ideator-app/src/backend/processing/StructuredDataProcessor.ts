// ============================================================================
// IDEATOR — Structured Data Processor (BE-2.4)
// Parses spreadsheets (CSV) and JSON files into text
// ============================================================================

import type { ExtractedText, TextSection } from './TextDocumentProcessor';

export class StructuredDataProcessor {
  /** Process a structured data file into text */
  async process(file: File): Promise<ExtractedText> {
    const extension = this.getExtension(file.name);

    switch (extension) {
      case '.csv':
        return this.processCSV(file);
      case '.json':
        return this.processJSON(file);
      case '.xlsx':
      case '.xls':
        return this.processSpreadsheet(file);
      default:
        return this.processCSV(file); // fallback
    }
  }

  private async processCSV(file: File): Promise<ExtractedText> {
    const raw = await file.text();
    const rows = this.parseCSV(raw);
    if (rows.length === 0) {
      return { text: '', sections: [], totalPages: 0 };
    }

    const headers = rows[0];
    const sections: TextSection[] = [];
    const textParts: string[] = [];

    // Header summary
    textParts.push(`Columns: ${headers.join(', ')}`);
    textParts.push(`Total rows: ${rows.length - 1}`);

    // Convert rows to readable text (limit to first 500 rows for LLM context)
    const dataRows = rows.slice(1, 501);
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const pairs = headers
        .map((h, j) => (row[j]?.trim() ? `${h}: ${row[j].trim()}` : null))
        .filter(Boolean);

      if (pairs.length > 0) {
        const rowText = pairs.join(', ');
        sections.push({
          text: rowText,
          location: `Row ${i + 2}`, // 1-indexed, skip header
        });
        textParts.push(rowText);
      }
    }

    if (rows.length > 501) {
      textParts.push(`... and ${rows.length - 501} more rows`);
    }

    const text = textParts.join('\n');
    return { text, sections, totalPages: Math.ceil(dataRows.length / 50) };
  }

  private async processJSON(file: File): Promise<ExtractedText> {
    const raw = await file.text();
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        text: `[Invalid JSON: ${raw.slice(0, 200)}...]`,
        sections: [{ text: raw.slice(0, 5000), location: 'File' }],
        totalPages: 1,
      };
    }

    const flattened = this.flattenJSON(data);
    const sections: TextSection[] = [];
    const textParts: string[] = [];

    // Describe the structure
    if (Array.isArray(data)) {
      textParts.push(`JSON Array with ${data.length} items`);
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        textParts.push(`Item keys: ${Object.keys(data[0]).join(', ')}`);
      }
    } else if (typeof data === 'object' && data !== null) {
      textParts.push(`JSON Object with keys: ${Object.keys(data).join(', ')}`);
    }

    // Convert flattened entries to sections
    for (const [path, value] of flattened.slice(0, 1000)) {
      const entry = `${path}: ${String(value)}`;
      sections.push({
        text: entry,
        location: path,
      });
      textParts.push(entry);
    }

    if (flattened.length > 1000) {
      textParts.push(`... and ${flattened.length - 1000} more entries`);
    }

    const text = textParts.join('\n');
    return { text, sections, totalPages: Math.ceil(sections.length / 50) || 1 };
  }

  private async processSpreadsheet(file: File): Promise<ExtractedText> {
    // XLSX is a ZIP containing xl/sharedStrings.xml and xl/worksheets/sheet*.xml
    // Minimal extraction without full library
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder();
    const raw = decoder.decode(new Uint8Array(buffer));

    // Extract shared strings
    const strings: string[] = [];
    const stringRegex = /<t[^>]*>([^<]*)<\/t>/g;
    let match: RegExpExecArray | null;
    while ((match = stringRegex.exec(raw)) !== null) {
      strings.push(match[1]);
    }

    if (strings.length === 0) {
      return {
        text: '[Spreadsheet extraction requires a library like SheetJS for full fidelity]',
        sections: [],
        totalPages: 1,
      };
    }

    const sections: TextSection[] = [];
    const textParts = [`Spreadsheet data (${strings.length} cells extracted):`];

    // Group strings into rough rows
    const rowSize = Math.min(10, Math.ceil(Math.sqrt(strings.length)));
    for (let i = 0; i < strings.length; i += rowSize) {
      const rowStrings = strings.slice(i, i + rowSize);
      const rowText = rowStrings.join(' | ');
      sections.push({
        text: rowText,
        location: `Row ${Math.floor(i / rowSize) + 1}`,
      });
      textParts.push(rowText);
    }

    const text = textParts.join('\n');
    return { text, sections, totalPages: Math.ceil(sections.length / 50) || 1 };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private parseCSV(raw: string): string[][] {
    const rows: string[][] = [];
    let current: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      const next = raw[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++; // skip escaped quote
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          current.push(field);
          field = '';
        } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
          current.push(field);
          field = '';
          rows.push(current);
          current = [];
          if (ch === '\r') i++; // skip \n after \r
        } else if (ch === '\r') {
          current.push(field);
          field = '';
          rows.push(current);
          current = [];
        } else {
          field += ch;
        }
      }
    }

    // Last field/row
    if (field || current.length > 0) {
      current.push(field);
      rows.push(current);
    }

    return rows;
  }

  private flattenJSON(data: unknown, prefix = '', result: [string, unknown][] = []): [string, unknown][] {
    if (data === null || data === undefined) {
      result.push([prefix || 'root', data]);
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        result.push([prefix || 'root', '[]']);
      } else {
        data.forEach((item, i) => {
          this.flattenJSON(item, `${prefix}[${i}]`, result);
        });
      }
    } else if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        this.flattenJSON(value, prefix ? `${prefix}.${key}` : key, result);
      }
    } else {
      result.push([prefix || 'root', data]);
    }
    return result;
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }
}
