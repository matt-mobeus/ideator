import type { FileFormat } from '@/types/file.ts'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export async function processStructuredFile(blob: Blob, format: FileFormat): Promise<string> {
  switch (format) {
    case 'csv':
      return await processCsv(blob)

    case 'xlsx':
    case 'xls':
      return await processExcel(blob)

    case 'json':
      return await processJson(blob)

    default:
      throw new Error(`Unsupported structured format: ${format}`)
  }
}

async function processCsv(blob: Blob): Promise<string> {
  const text = await blob.text()

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      complete: (results) => {
        try {
          const lines: string[] = []

          if (results.data.length === 0) {
            resolve('[Empty CSV file]')
            return
          }

          // Format as text with aligned columns
          const rows = results.data as string[][]

          // Calculate column widths
          const colWidths: number[] = []
          rows.forEach(row => {
            row.forEach((cell, i) => {
              const cellLength = String(cell).length
              colWidths[i] = Math.max(colWidths[i] || 0, cellLength)
            })
          })

          // Format rows
          rows.forEach((row, index) => {
            const formattedRow = row.map((cell, i) =>
              String(cell).padEnd(colWidths[i])
            ).join(' | ')
            lines.push(formattedRow)

            // Add separator after header
            if (index === 0 && rows.length > 1) {
              lines.push(colWidths.map(w => '-'.repeat(w)).join('-+-'))
            }
          })

          resolve(lines.join('\n'))
        } catch (error) {
          reject(error)
        }
      },
      error: (error: { message: string }) => {
        reject(new Error(`CSV parsing error: ${error.message}`))
      },
    })
  })
}

async function processExcel(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const lines: string[] = []

  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName]

    if (index > 0) {
      lines.push('\n' + '='.repeat(50) + '\n')
    }

    lines.push(`Sheet: ${sheetName}`)
    lines.push('-'.repeat(50))

    // Convert sheet to CSV format
    const csv = XLSX.utils.sheet_to_csv(sheet)

    if (csv.trim()) {
      // Format the CSV data
      const rows = csv.split('\n').filter(row => row.trim())
      const formattedRows = rows.map(row => row.split(',').join(' | '))
      lines.push(formattedRows.join('\n'))
    } else {
      lines.push('[Empty sheet]')
    }
  })

  return lines.join('\n')
}

async function processJson(blob: Blob): Promise<string> {
  const text = await blob.text()

  try {
    const parsed = JSON.parse(text)
    // Pretty print with 2-space indentation
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : String(error)}`)
  }
}
