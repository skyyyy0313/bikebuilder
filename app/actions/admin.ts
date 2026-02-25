'use server'

import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export interface ExcelImportResult {
  success: boolean
  imported: number
  errors: string[]
  total: number
}

const modelConfigs: Record<string, { 
  title: string, 
  model: any,
  fields: string[] 
}> = {
  frames: {
    title: '车架',
    model: prisma.frame,
    fields: ['brand', 'model', 'frameWeight', 'forkWeight', 'seatpostWeight', 'type', 'material', 'color', 'size', 'bottomBracketStandard']
  },
  handlebars: {
    title: '车把',
    model: prisma.handlebar,
    fields: ['brand', 'model', 'weight', 'isIntegrated', 'width', 'stemLength']
  },
  stems: {
    title: '把立',
    model: prisma.stem,
    fields: ['brand', 'model', 'weight', 'length', 'angle']
  },
  wheelsets: {
    title: '轮组',
    model: prisma.wheelset,
    fields: ['brand', 'model', 'weight', 'rimDepth', 'rimWidth', 'material', 'type', 'hubType', 'spokeCount']
  },
  tires: {
    title: '外胎',
    model: prisma.tire,
    fields: ['brand', 'model', 'weight', 'width', 'type']
  },
  innerTubes: {
    title: '内胎',
    model: prisma.innerTube,
    fields: ['brand', 'model', 'weight', 'valveType', 'material']
  },
  bottomBrackets: {
    title: '中轴',
    model: prisma.bottomBracket,
    fields: ['brand', 'model', 'weight', 'standard', 'spindleType']
  },
  saddles: {
    title: '座垫',
    model: prisma.saddle,
    fields: ['brand', 'model', 'weight', 'width', 'rails']
  },
  barTapes: {
    title: '把带',
    model: prisma.barTape,
    fields: ['brand', 'model', 'weight', 'color', 'material']
  },
  pedals: {
    title: '脚踏',
    model: prisma.pedal,
    fields: ['brand', 'model', 'weight', 'type', 'platform']
  },
  shiftLevers: {
    title: '手变',
    model: prisma.shiftLever,
    fields: ['brand', 'model', 'weight', 'speed', 'side']
  },
  frontDerailleurs: {
    title: '前拨',
    model: prisma.frontDerailleur,
    fields: ['brand', 'model', 'weight', 'speed', 'mountType']
  },
  rearDerailleurs: {
    title: '后拨',
    model: prisma.rearDerailleur,
    fields: ['brand', 'model', 'weight', 'speed', 'cageSize']
  },
  cranks: {
    title: '曲柄',
    model: prisma.crank,
    fields: ['brand', 'model', 'weight', 'length', 'boltCircle']
  },
  chainrings: {
    title: '牙盘',
    model: prisma.chainring,
    fields: ['brand', 'model', 'weight', 'teeth', 'bolts']
  },
  chains: {
    title: '链条',
    model: prisma.chain,
    fields: ['brand', 'model', 'weight', 'speed', 'length']
  },
  cassettes: {
    title: '飞轮',
    model: prisma.cassette,
    fields: ['brand', 'model', 'weight', 'speeds', 'range']
  },
  seatposts: {
    title: '座管',
    model: prisma.seatpost,
    fields: ['brand', 'model', 'length', 'diameter', 'weight', 'material']
  },
  brakes: {
    title: '刹车',
    model: prisma.brake,
    fields: ['brand', 'model', 'weight', 'type', 'mountType', 'pistonCount', 'material']
  },
}

export async function getModelData(category: string) {
  const config = modelConfigs[category]
  if (!config) return null

  const data = await config.model.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const columns = [
    { key: 'id', label: 'ID' },
    ...config.fields.map(field => ({
      key: field,
      label: getFieldLabel(field)
    })),
    { key: 'createdAt', label: '创建时间' },
    { key: 'actions', label: '操作' }
  ]

  return {
    title: config.title,
    columns,
    data
  }
}

export async function createPart(category: string, data: Record<string, any>) {
  const config = modelConfigs[category]
  if (!config) throw new Error('无效的分类')

  const part = await config.model.create({
    data
  })
  return part
}

export async function updatePart(category: string, id: string, data: Record<string, any>) {
  const config = modelConfigs[category]
  if (!config) throw new Error('无效的分类')

  const part = await config.model.update({
    where: { id },
    data
  })
  return part
}

export async function deletePart(category: string, id: string) {
  const config = modelConfigs[category]
  if (!config) throw new Error('无效的分类')

  await config.model.delete({
    where: { id }
  })
  return true
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    brand: '品牌',
    model: '型号',
    weight: '重量(g)',
    frameWeight: '车架重量(g)',
    forkWeight: '前叉重量(g)',
    seatpostWeight: '座管重量(g)',
    color: '颜色',
    size: '尺寸',
    bottomBracketStandard: '中轴标准',
    isIntegrated: '一体把',
    width: '宽度',
    stemLength: '把立长度',
    length: '长度',
    angle: '角度',
    rimDepth: '轮圈深度',
    rimWidth: '轮圈宽度',
    hubType: '花鼓类型',
    spokeCount: '辐条数',
    valveType: '气嘴类型',
    standard: '标准',
    spindleType: '轴心类型',
    rails: '导轨',
    material: '材质',
    type: '类型',
    platform: '平台',
    speed: '速别',
    side: '侧边',
    mountType: '安装类型',
    cageSize: '导板尺寸',
    boltCircle: 'BCD',
    teeth: '齿数',
    bolts: '螺栓数',
    range: '齿比范围',
    speeds: '速别',
    pistonCount: '活塞数',
    diameter: '规格'
  }
  return labels[field] || field
}

export async function exportPartsToExcel(category: string): Promise<string> {
  const config = modelConfigs[category]
  if (!config) throw new Error('无效的分类')

  const data = await config.model.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const columns = [
    ...config.fields.map(field => ({
      key: field,
      label: getFieldLabel(field)
    }))
  ]

  const worksheetData = data.map((item: any) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      const value = item[col.key]
      if (col.key === 'isIntegrated') {
        row[col.label] = value ? '是' : '否'
      } else {
        row[col.label] = value || ''
      }
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, config.title)
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
  console.log('Generated Excel buffer size:', excelBuffer.length)
  return excelBuffer.toString('base64')
}

export async function importPartsFromExcel(
  category: string,
  fileBuffer: string | Buffer,
  fileName: string
): Promise<ExcelImportResult> {
  const config = modelConfigs[category]
  if (!config) throw new Error('无效的分类')

  const result: ExcelImportResult = {
    success: false,
    imported: 0,
    errors: [],
    total: 0
  }

  try {
    let buffer: Buffer
    if (typeof fileBuffer === 'string') {
      buffer = Buffer.from(fileBuffer, 'base64')
    } else {
      buffer = fileBuffer
    }
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: ''
    })

    console.log('Excel导入调试:', {
      sheetName,
      sheetNames: workbook.SheetNames,
      jsonDataLength: jsonData.length,
      jsonDataFirstFew: jsonData.slice(0, 3)
    })

    if (jsonData.length === 0) {
      result.errors.push(`Excel文件没有数据行。工作表: ${sheetName}`)
      return result
    }

    const headers = Object.keys(jsonData[0] || {})
    console.log('Excel标题行:', headers)
    console.log('配置字段:', config.fields)
    
    const fieldMap: Record<string, string> = {}
    config.fields.forEach(field => {
      const label = getFieldLabel(field)
      fieldMap[label] = field
    })
    
    console.log('字段映射:', fieldMap)

    const rowsToImport = []
    result.total = jsonData.length

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      const rowData: Record<string, any> = {}
      let isValid = true
      let errorMessage = `第${i + 2}行: `

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        const normalizedHeader = String(header).trim()
        const field = fieldMap[normalizedHeader]
        if (field) {
          const value = row[header]
          
           if (field === 'brand' || field === 'model') {
             // 品牌和型号现在可选，不再验证
           }

            if (field === 'weight' || field === 'frameWeight' || field === 'seatpostWeight') {
              const weight = parseInt(value)
              if (!isNaN(weight) && weight >= 0) {
                rowData[field] = weight
              } else {
                rowData[field] = null
              }
              continue
            }

          if (field === 'isIntegrated') {
            if (value === '是' || value === true || value === 'true' || value === 1) {
              rowData[field] = true
            } else if (value === '否' || value === false || value === 'false' || value === 0) {
              rowData[field] = false
            } else {
              rowData[field] = false
            }
            continue
          }

          if (field === 'spokeCount' || field === 'speed' || field === 'teeth' || field === 'bolts' || field === 'speeds' || field === 'pistonCount' || field === 'forkWeight') {
            const numValue = parseInt(value)
            if (!isNaN(numValue) && numValue > 0) {
              rowData[field] = numValue
            } else {
              rowData[field] = null
            }
            continue
          }

          rowData[field] = value || null
        }
      }

      if (isValid) {
        rowsToImport.push(rowData)
      } else {
        result.errors.push(errorMessage)
      }
    }

    if (rowsToImport.length === 0) {
      result.errors.push('没有有效的数据可以导入')
      return result
    }

    for (const rowData of rowsToImport) {
      try {
        await config.model.create({
          data: rowData
        })
        result.imported++
      } catch (error) {
        result.errors.push(`导入失败: ${JSON.stringify(rowData)} - ${(error as Error).message}`)
      }
    }

    result.success = result.imported > 0
    return result

  } catch (error) {
    result.errors.push(`文件解析失败: ${(error as Error).message}`)
    return result
  }
}
