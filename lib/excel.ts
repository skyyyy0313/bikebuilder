import * as XLSX from 'xlsx'

export interface ExcelData {
  [key: string]: any
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
}

export interface ImportOptions {
  headerRow?: number
}

export function exportToExcel(
  data: ExcelData[],
  columns: { key: string; label: string }[],
  options: ExportOptions = {}
): Blob {
  const { filename = 'data', sheetName = 'Sheet1' } = options

  const worksheetData = data.map((item) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      if (col.key !== 'actions' && col.key !== 'createdAt' && col.key !== 'id') {
        row[col.label] = item[col.key] || ''
      }
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function importFromExcel(
  file: File,
  columns: { key: string; label: string }[],
  options: ImportOptions = {}
): Promise<ExcelData[]> {
  return new Promise((resolve, reject) => {
    const { headerRow = 1 } = options
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 'A',
          raw: false,
          defval: '',
          range: headerRow - 1
        })

        const columnMap: Record<string, string> = {}
        columns.forEach((col) => {
          if (col.key !== 'actions' && col.key !== 'createdAt' && col.key !== 'id') {
            columnMap[col.label] = col.key
          }
        })

        const result: ExcelData[] = jsonData.map((row) => {
          const item: ExcelData = {}
          Object.entries(row).forEach(([excelCol, value]) => {
            const columnLabel = excelCol.replace(/[0-9]/g, '')
            const columnKey = columnMap[columnLabel]
            if (columnKey) {
              item[columnKey] = value
            }
          })
          return item
        }).filter(item => Object.keys(item).length > 0)

        resolve(result)
      } catch (error) {
        reject(new Error('Excel文件解析失败: ' + (error as Error).message))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsBinaryString(file)
  })
}

export function downloadExcel(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}