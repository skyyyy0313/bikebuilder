'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface Part {
  id: string
  brand: string
  model: string
  weight: number
  [key: string]: any
}

interface Bike {
  id: string
  name: string
  configuration: string | null
  createdAt: string
  updatedAt: string
}

interface Configuration {
  [category: string]: string | null
}

interface CategoryInfo {
  key: string
  title: string
  fields: string[]
}

const categoryConfigs: CategoryInfo[] = [
  { key: 'frames', title: '车架', fields: ['brand', 'model', 'weight', 'color', 'size', 'bottomBracketStandard'] },
  { key: 'handlebars', title: '车把', fields: ['brand', 'model', 'weight', 'isIntegrated', 'width', 'stemLength'] },
  { key: 'stems', title: '把立', fields: ['brand', 'model', 'weight', 'length', 'angle'] },
  { key: 'wheelsets', title: '轮组', fields: ['brand', 'model', 'weight', 'rimDepth', 'rimWidth', 'hubType', 'spokeCount'] },
  { key: 'tires', title: '外胎', fields: ['brand', 'model', 'weight', 'width', 'type'] },
  { key: 'innerTubes', title: '内胎', fields: ['brand', 'model', 'weight', 'valveType'] },
  { key: 'bottomBrackets', title: '中轴', fields: ['brand', 'model', 'weight', 'standard', 'spindleType'] },
  { key: 'saddles', title: '座垫', fields: ['brand', 'model', 'weight', 'width', 'rails'] },
  { key: 'barTapes', title: '把带', fields: ['brand', 'model', 'weight', 'color', 'material'] },
  { key: 'pedals', title: '脚踏', fields: ['brand', 'model', 'weight', 'type', 'platform'] },
  { key: 'shiftLevers', title: '手变', fields: ['brand', 'model', 'weight', 'speed', 'side'] },
  { key: 'frontDerailleurs', title: '前拨', fields: ['brand', 'model', 'weight', 'speed', 'mountType'] },
  { key: 'rearDerailleurs', title: '后拨', fields: ['brand', 'model', 'weight', 'speed', 'cageSize'] },
  { key: 'cranks', title: '曲柄', fields: ['brand', 'model', 'weight', 'length', 'boltCircle'] },
  { key: 'chainrings', title: '牙盘', fields: ['brand', 'model', 'weight', 'teeth', 'bolts'] },
  { key: 'chains', title: '链条', fields: ['brand', 'model', 'weight', 'speed', 'length'] },
  { key: 'cassettes', title: '飞轮', fields: ['brand', 'model', 'weight', 'speeds', 'range'] },
]

const fieldLabels: Record<string, string> = {
  brand: '品牌',
  model: '型号',
  weight: '重量(g)',
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
  speeds: '速别'
}

export default function BikeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bikeId = params.id as string
  
  const [bike, setBike] = useState<Bike | null>(null)
  const [configuration, setConfiguration] = useState<Configuration>({})
  const [partsData, setPartsData] = useState<Record<string, Part>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    async function loadBikeDetails() {
      try {
        setLoading(true)
        setError('')
        
        const response = await fetch(`/api/bikes/${bikeId}/configure`)
        if (!response.ok) {
          throw new Error('获取自行车数据失败')
        }
        
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || '获取配置失败')
        }
        
        setBike(result.bike)
        setConfiguration(result.configuration || {})
        
        const config = result.configuration || {}
        const partDetails: Record<string, Part> = {}
        
        for (const [category, partId] of Object.entries(config)) {
          if (!partId) continue
          
          try {
            const partsResponse = await fetch(`/api/parts/${category}`)
            if (partsResponse.ok) {
              const partsResult = await partsResponse.json()
              const part = partsResult.data.find((p: Part) => p.id === partId)
              if (part) {
                partDetails[category] = part
              }
            }
          } catch (err) {
            console.error(`获取${category}部件详情失败:`, err)
          }
        }
        
        setPartsData(partDetails)
      } catch (err) {
        console.error('加载自行车详情失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }
    
    loadBikeDetails()
  }, [bikeId])
  
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? '是' : '否'
    return String(value)
  }
  
  const calculateTotalWeight = (): number => {
    return Object.values(partsData).reduce((total, part) => {
      return total + (part.weight || 0)
    }, 0)
  }
  
  const exportToExcel = () => {
    if (!bike) return
    
    const worksheetData = []
    
    worksheetData.push(['自行车配置详情'])
    worksheetData.push(['自行车名称:', bike.name])
    worksheetData.push(['创建时间:', new Date(bike.createdAt).toLocaleString('zh-CN')])
    worksheetData.push(['更新时间:', new Date(bike.updatedAt).toLocaleString('zh-CN')])
    worksheetData.push(['总重量:', `${calculateTotalWeight()}g`])
    worksheetData.push([])
    worksheetData.push(['部件配置详情'])
    worksheetData.push(['类别', '部件', '品牌', '型号', '重量(g)', '其他属性'])
    
    categoryConfigs.forEach(category => {
      const part = partsData[category.key]
      if (part) {
        const otherFields = category.fields
          .filter(field => !['brand', 'model', 'weight'].includes(field))
          .map(field => `${fieldLabels[field] || field}: ${formatFieldValue(part[field])}`)
          .join('; ')
        
        worksheetData.push([
          category.title,
          `${part.brand} ${part.model}`,
          part.brand,
          part.model,
          part.weight || 0,
          otherFields
        ])
      } else {
        worksheetData.push([category.title, '未配置', '', '', '', ''])
      }
    })
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '自行车配置')
    
    const fileName = `${bike.name}_配置_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>加载失败: {error}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          返回主页
        </button>
      </div>
    )
  }
  
  if (!bike) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">自行车不存在</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          返回主页
        </button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{bike.name}</h1>
          <p className="text-gray-600 mt-2">
            创建时间: {new Date(bike.createdAt).toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-lg">
            总重量: <span className="font-bold">{calculateTotalWeight()}g</span>
          </div>
          <Link
            href="/dashboard"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            返回主页
          </Link>
          <Link
            href={`/bikes/${bikeId}/configure`}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            编辑配置
          </Link>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <span>导出Excel</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类别
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部件
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  品牌
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  型号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  重量(g)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  其他属性
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryConfigs.map((category) => {
                const part = partsData[category.key]
                return (
                  <tr key={category.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part ? `${part.brand} ${part.model}` : '未配置'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part?.brand || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part?.model || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part?.weight || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {part ? (
                        <div className="space-y-1">
                          {category.fields
                            .filter(field => !['brand', 'model', 'weight'].includes(field))
                            .map(field => (
                              <div key={field} className="flex">
                                <span className="text-gray-600 w-24">{fieldLabels[field] || field}:</span>
                                <span className="font-medium">{formatFieldValue(part[field])}</span>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Link
          href="/dashboard"
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50"
        >
          返回主页
        </Link>
        <Link
          href={`/bikes/${bikeId}/configure`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          编辑配置
        </Link>
      </div>
    </div>
  )
}