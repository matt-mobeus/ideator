import type { FileFormat } from '@/types/file.ts'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set worker src to empty string for inline worker
pdfjsLib.GlobalWorkerOptions.workerSrc = ''

export async function processTextFile(blob: Blob, format: FileFormat): Promise<string> {
  switch (format) {
    case 'txt':
    case 'md':
      return await blob.text()

    case 'html':
    case 'htm':
      return await processHtml(blob)

    case 'pdf':
      return await processPdf(blob)

    case 'docx':
      return await processDocx(blob)

    case 'rtf':
    case 'epub':
    case 'tex':
    case 'latex':
    case 'doc':
      return await processFallback(blob, format)

    default:
      throw new Error(`Unsupported text format: ${format}`)
  }
}

async function processHtml(blob: Blob): Promise<string> {
  const html = await blob.text()
  // Strip HTML tags with regex
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  // Collapse multiple whitespaces
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

async function processPdf(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
  const pdf = await loadingTask.promise

  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    textParts.push(pageText)
  }

  return textParts.join('\n\n')
}

async function processDocx(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

async function processFallback(blob: Blob, format: FileFormat): Promise<string> {
  const text = await blob.text()
  return `[Note: ${format.toUpperCase()} processing not fully implemented. Raw content below:]\n\n${text}`
}
