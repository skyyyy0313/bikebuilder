'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
// Icons replaced with text for simplicity

interface Part {
  id: string
  brand: string
  model: string
  weight: number
  [key: string]: any
}

interface CategoryConfig {
  key: string
  title: string
  fields: string[]
}

interface Selection {
  [category: string]: string | null
}

type BrakeTypeFilter = '' | '圈刹' | '碟刹'

const categoryConfigs: CategoryConfig[] = [
  { key: 'frames', title: '车架', fields: ['brand', 'model', 'frameWeight', 'forkWeight', 'seatpostWeight', 'type', 'material', 'color', 'size', 'bottomBracketStandard'] },
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
  { key: 'seatposts', title: '座管', fields: ['brand', 'model', 'length', 'diameter', 'weight', 'material'] },
  { key: 'brakes', title: '刹车', fields: ['brand', 'model', 'weight', 'type', 'mountType', 'pistonCount', 'material'] },
]

const fieldLabels: Record<string, string> = {
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

export default function ConfigurePage() {
  const params = useParams()
  const router = useRouter()
  const bikeId = params.id as string
  
  const [selections, setSelections] = useState<Selection>({})
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})
  const [partsData, setPartsData] = useState<Record<string, { title: string, data: Part[], fields: string[] }>>({})
  const [partCache, setPartCache] = useState<Record<string, Part>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [brakeTypeFilter, setBrakeTypeFilter] = useState<BrakeTypeFilter>('')
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  
  const fetchParts = useCallback(async (category: string, search: string = '') => {
    setLoading(prev => ({ ...prev, [category]: true }))
    try {
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await fetch(`/api/parts/${category}${searchParam}`)
      if (!response.ok) {
        throw new Error('获取数据失败')
      }
      const result = await response.json()
      setPartCache(prev => {
        const next = { ...prev }
        for (const part of result.data as Part[]) {
          next[`${category}:${part.id}`] = part
        }
        return next
      })
      setPartsData(prev => ({
        ...prev,
        [category]: {
          title: result.title,
          data: result.data,
          fields: result.fields
        }
      }))
    } catch (error) {
      console.error(`获取${category}数据失败:`, error)
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }))
    }
  }, [])
  
  useEffect(() => {
    async function loadConfiguration() {
      try {
        const response = await fetch(`/api/bikes/${bikeId}/configure`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.configuration) {
            setSelections(result.configuration)
          }
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }
    
    loadConfiguration()
  }, [bikeId])
  
  useEffect(() => {
    categoryConfigs.forEach(category => {
      fetchParts(category.key)
    })
  }, [fetchParts])

  useEffect(() => {
    return () => {
      Object.values(searchTimers.current).forEach(timer => clearTimeout(timer))
    }
  }, [])
  
  const handleSearch = (category: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [category]: query }))
    const existingTimer = searchTimers.current[category]
    if (existingTimer) clearTimeout(existingTimer)
    searchTimers.current[category] = setTimeout(() => {
      fetchParts(category, query.trim())
    }, 300)
  }
  
  const handleSelect = (category: string, partId: string | null) => {
    setSelections(prev => ({ ...prev, [category]: partId }))
  }
  
  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/bikes/${bikeId}/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selections })
      })
      
      let errorText = '保存配置失败'
      try {
        const result = await response.json()
        console.log('保存响应:', result)
        
        if (result.success) {
          alert('配置保存成功！')
          router.push(`/bikes/${bikeId}`)
          return
        } else {
          errorText = result.error || '保存失败'
        }
      } catch (jsonError) {
        console.error('JSON解析错误:', jsonError)
        errorText = `服务器返回异常: ${response.status} ${response.statusText}`
      }
      
      if (!response.ok) {
        errorText = `HTTP错误: ${response.status} ${response.statusText}`
      }
      
      throw new Error(errorText)
    } catch (error) {
      console.error('保存配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`保存配置失败: ${errorMessage}，请重试`)
    } finally {
      setSaving(false)
    }
  }
  
  const getSelectedPart = (category: string): Part | null => {
    const selectedId = selections[category]
    if (!selectedId) return null
    const categoryData = partsData[category]
    if (!categoryData) return partCache[`${category}:${selectedId}`] || null
    return categoryData.data.find(part => part.id === selectedId) || partCache[`${category}:${selectedId}`] || null
  }

  const categorySupportsTypeFilter = (category: CategoryConfig): boolean => {
    return category.fields.includes('type')
  }

  const matchesBrakeTypeFilter = (category: CategoryConfig, part: Part): boolean => {
    if (!brakeTypeFilter || !categorySupportsTypeFilter(category)) return true
    const typeValue = String(part.type || '')
    return typeValue.includes(brakeTypeFilter)
  }

  useEffect(() => {
    if (!brakeTypeFilter) return

    setSelections(prev => {
      let changed = false
      const next = { ...prev }

      for (const category of categoryConfigs) {
        if (!categorySupportsTypeFilter(category)) continue
        const selectedId = prev[category.key]
        if (!selectedId) continue

        const part =
          partsData[category.key]?.data?.find(item => item.id === selectedId) ||
          partCache[`${category.key}:${selectedId}`]

        if (!part || !matchesBrakeTypeFilter(category, part)) {
          next[category.key] = null
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [brakeTypeFilter, partsData, partCache])
  
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? '是' : '否'
    return String(value)
  }
  
  const calculateTotalWeight = (): number => {
    return categoryConfigs.reduce((total, category) => {
      const selectedPart = getSelectedPart(category.key)
      if (!selectedPart) return total
      
      if (category.key === 'frames') {
        const frameWeight = selectedPart.frameWeight || 0
        const forkWeight = selectedPart.forkWeight || 0
        const seatpostWeight = selectedPart.seatpostWeight || 0
        return total + frameWeight + forkWeight + seatpostWeight
      } else {
        return total + (selectedPart.weight || 0)
      }
    }, 0)
  }

  const getOptionWeightText = (categoryKey: string, part: Part): string => {
    if (categoryKey === 'frames') {
      const total = (part.frameWeight || 0) + (part.forkWeight || 0) + (part.seatpostWeight || 0)
      return `${total}g`
    }
    return `${part.weight || 0}g`
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">配置自行车</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">刹车类型</label>
            <select
              value={brakeTypeFilter}
              onChange={(e) => setBrakeTypeFilter(e.target.value as BrakeTypeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部</option>
              <option value="圈刹">圈刹</option>
              <option value="碟刹">碟刹</option>
            </select>
          </div>
          <div className="text-lg">
            总重量: <span className="font-bold">{calculateTotalWeight()}g</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{saving ? '保存中...' : '保存配置'}</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categoryConfigs.map(category => {
          const categoryData = partsData[category.key]
          const selectedPart = getSelectedPart(category.key)
          const isLoading = loading[category.key]
          const searchQuery = searchQueries[category.key] || ''
          const selectedId = selections[category.key] || ''
          const selectedOption = selectedId ? partCache[`${category.key}:${selectedId}`] : null
          const filteredOptions = (categoryData?.data || []).filter((part: Part) => matchesBrakeTypeFilter(category, part))
          const hasSelectedInOptions = !!selectedOption && filteredOptions.some(part => part.id === selectedOption.id)
          
          return (
            <div key={category.key} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{category.title}</h2>
                <div className="text-sm text-gray-600">
                  {selectedPart ? `${selectedPart.brand} ${selectedPart.model}` : '未选择'}
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(category.key, e.target.value)}
                  placeholder={`搜索${category.title}...`}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <select
                  value={selectedId}
                  onChange={(e) => handleSelect(category.key, e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">选择{category.title}</option>
                  {selectedOption && !hasSelectedInOptions && matchesBrakeTypeFilter(category, selectedOption) && (
                    <option value={selectedOption.id}>
                      {selectedOption.brand} {selectedOption.model} ({getOptionWeightText(category.key, selectedOption)})
                    </option>
                  )}
                  {filteredOptions.map((part: Part) => (
                    <option key={part.id} value={part.id}>
                      {part.brand} {part.model} ({getOptionWeightText(category.key, part)})
                    </option>
                  ))}
                </select>
              </div>
              
              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              )}
              
               {selectedPart && (
                 <div className="border-t pt-4">
                   <h3 className="font-medium mb-2">详细信息</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(category.key === 'brakes' && selectedPart.type && ['线拉圈刹', '油压圈刹'].includes(selectedPart.type)
                        ? category.fields.filter(field => field !== 'pistonCount')
                        : category.fields
                      ).map(field => (
                        <div key={field} className="flex">
                          <span className="text-gray-600 w-24">{fieldLabels[field] || field}:</span>
                          <span className="font-medium">{formatFieldValue(selectedPart[field])}</span>
                        </div>
                      ))}
                      {category.key === 'frames' && (
                        <div className="flex col-span-2 border-t pt-2 mt-2">
                          <span className="text-gray-600 w-24">车架总重(g):</span>
                          <span className="font-medium">
                            {(selectedPart.frameWeight || 0) + (selectedPart.forkWeight || 0) + (selectedPart.seatpostWeight || 0)}g
                          </span>
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>
          )
        })}
      </div>
      
      {/* 悬浮保存按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-3 rounded-md shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>{saving ? '保存中...' : '保存配置'}</span>
        </button>
      </div>
    </div>
  )
}
