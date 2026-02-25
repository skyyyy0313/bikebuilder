'use client'

import { useState, useEffect } from 'react'

interface PartFormProps {
  category: string
  part: any
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel: () => void
  loading: boolean
}

const fieldConfigs: Record<string, { type: string; label: string; options?: string[] }[]> = {
  frames: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '车架重量(g)' },
    { type: 'number', label: '前叉重量(g)' },
    { type: 'number', label: '座管重量(g)' },
    { type: 'select', label: '类型', options: ['圈刹', '碟刹'] },
    { type: 'select', label: '材质', options: ['碳纤维', '铝合金', '钢', '钛合金', '其他'] },
    { type: 'text', label: '颜色' },
    { type: 'text', label: '尺寸' },
    { type: 'text', label: '中轴标准' },
  ],
  handlebars: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'checkbox', label: '一体把' },
    { type: 'text', label: '宽度' },
    { type: 'text', label: '把立长度' },
  ],
  stems: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'text', label: '长度(mm)' },
    { type: 'text', label: '角度(°)' },
  ],
  wheelsets: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'text', label: '轮圈深度(mm)' },
    { type: 'text', label: '轮圈宽度(mm)' },
    { type: 'select', label: '材质', options: ['碳纤维', '铝合金'] },
    { type: 'select', label: '类型', options: ['圈刹', '碟刹'] },
    { type: 'text', label: '花鼓类型' },
    { type: 'number', label: '辐条数' },
  ],
  tires: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'text', label: '宽度(mm)' },
    { type: 'select', label: '类型', options: ['开口胎', '管胎', '真空胎'] },
  ],
  innerTubes: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '气嘴类型', options: ['法嘴', '美嘴', '英嘴'] },
    { type: 'select', label: '材质', options: ['丁基', 'TPU'] },
  ],
  bottomBrackets: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '标准', options: ['BSA', '意大利螺纹', '压入式', 'BB30', 'BB86', 'T47', '其他'] },
    { type: 'select', label: '轴心类型', options: ['24mm', '30mm', 'GXP', 'BB30', '24/22mm', '其他'] },
  ],
  saddles: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '宽度(mm)', options: ['130mm', '135mm', '140mm', '145mm', '150mm', '155mm', '160mm', '165mm', '其他'] },
    { type: 'select', label: '导轨', options: ['圆轨', '椭圆轨', '碳轨', '钛轨', '钢轨', '其他'] },
  ],
  barTapes: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'text', label: '颜色' },
    { type: 'select', label: '材质', options: ['软木', '合成材料', '皮革', '凝胶', '其他'] },
  ],
  pedals: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '类型', options: ['锁踏', '平台脚踏', '混合脚踏', '脚套', '其他'] },
    { type: 'select', label: '平台', options: ['塑料', '金属', '复合材料', '其他'] },
  ],
  shiftLevers: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '速别' },
    { type: 'select', label: '侧边', options: ['左', '右', '双边'] },
  ],
  frontDerailleurs: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '速别' },
    { type: 'select', label: '安装类型', options: ['直装式', '夹环式', 'E型', '其他'] },
  ],
  rearDerailleurs: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '速别' },
    { type: 'select', label: '导板尺寸', options: ['短腿', '中腿', '长腿'] },
  ],
  cranks: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '长度(mm)', options: ['165mm', '170mm', '172.5mm', '175mm', '其他'] },
    { type: 'select', label: 'BCD', options: ['110mm', '130mm', '144mm', '其他'] },
  ],
  chainrings: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '齿数' },
    { type: 'number', label: '螺栓数' },
  ],
  chains: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '速别' },
    { type: 'text', label: '长度' },
  ],
  cassettes: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'number', label: '速别' },
    { type: 'text', label: '齿比范围' },
  ],
  seatposts: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'text', label: '长度(mm)' },
    { type: 'select', label: '规格(mm)', options: ['27.2mm', '31.6mm', '30.9mm', '25.4mm', '31.8mm', '第三方异形座管'] },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '材质', options: ['碳纤维', '铝合金', '钛合金', '钢'] },
  ],
  brakes: [
    { type: 'text', label: '品牌' },
    { type: 'text', label: '型号' },
    { type: 'number', label: '重量(g)' },
    { type: 'select', label: '类型', options: ['线拉圈刹', '油压圈刹', '线拉碟刹', '油压碟刹'] },
    { type: 'text', label: '安装类型' },
    { type: 'number', label: '活塞数' },
    { type: 'text', label: '材质' },
  ],
}

export default function PartForm({ category, part, onSubmit, onCancel, loading }: PartFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const fields = fieldConfigs[category] || []

  useEffect(() => {
    if (part) {
      // 编辑现有记录
      const editedData = { ...part }
      // 如果是车把类别且不是一体把，确保把立长度为"无"
      if (category === 'handlebars' && !editedData.isIntegrated) {
        if (editedData.stemLength !== '无') {
          editedData.stemLength = '无'
        }
      }
      setFormData(editedData)
    } else {
      // 创建新记录
      const initialData: Record<string, any> = {}
      fields.forEach(field => {
        const key = getFieldKey(field.label)
        initialData[key] = field.type === 'checkbox' ? false : ''
      })
      // 如果是车把类别且不是一体把，设置把立长度为"无"
      if (category === 'handlebars' && !initialData.isIntegrated) {
        initialData.stemLength = '无'
      }
      setFormData(initialData)
    }
  }, [part, category])

  const getFilteredFields = () => {
    if (category === 'brakes') {
      const brakeType = formData.type || ''
      const isDiscBrake = brakeType === '线拉碟刹' || brakeType === '油压碟刹'
      
      return fields.filter(field => {
        if (field.label === '活塞数') {
          return isDiscBrake
        }
        return true
      })
    }
    
    if (category === 'handlebars') {
      const isIntegrated = formData.isIntegrated || false
      
      return fields.filter(field => {
        if (field.label === '把立长度') {
          return isIntegrated
        }
        return true
      })
    }
    
    return fields
  }

  const handleChange = (key: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: value }
      
      if (category === 'brakes' && key === 'type') {
        const isDiscBrake = value === '线拉碟刹' || value === '油压碟刹'
        if (!isDiscBrake) {
          newData.pistonCount = null
        }
      }
      
      if (category === 'handlebars' && key === 'isIntegrated') {
        if (!value) {
          // 取消勾选一体把时，把立长度设置为"无"
          newData.stemLength = '无'
        } else {
          // 勾选一体把时，如果当前值是"无"，则清空以便用户输入
          if (newData.stemLength === '无') {
            newData.stemLength = ''
          }
        }
      }
      
      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {part ? '编辑' : '添加'}{getCategoryName(category)}
        </h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            {getFilteredFields().map((field, index) => {
              const key = getFieldKey(field.label)
              return (
                <div key={index}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  {field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={formData[key] || false}
                      onChange={(e) => handleChange(key, e.target.checked)}
                      className="h-4 w-4"
                    />
                  ) : field.type === 'number' ? (
                     <input
                       type="number"
                       value={formData[key] || ''}
                       onChange={(e) => {
                         const value = e.target.value
                         const numValue = value === '' ? null : parseInt(value) || 0
                         handleChange(key, numValue)
                       }}
                       min="0" step="1"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
                     />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">请选择</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  )}
                </div>
              )
            })}
            {category === 'frames' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  车架总重(g)
                </label>
                <input
                  type="text"
                  value={`${(formData.frameWeight || 0) + (formData.forkWeight || 0) + (formData.seatpostWeight || 0)}g`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '处理中...' : part ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getFieldKey(label: string): string {
  const mapping: Record<string, string> = {
    '品牌': 'brand',
    '型号': 'model',
    '重量(g)': 'weight',
    '车架重量(g)': 'frameWeight',
    '前叉重量(g)': 'forkWeight',
    '座管重量(g)': 'seatpostWeight',
    '颜色': 'color',
    '尺寸': 'size',
    '中轴标准': 'bottomBracketStandard',
    '一体把': 'isIntegrated',
    '宽度': 'width',
    '把立长度': 'stemLength',
    '长度': 'length',
    '角度': 'angle',
    '轮圈深度': 'rimDepth',
    '轮圈宽度': 'rimWidth',
    '花鼓类型': 'hubType',
    '辐条数': 'spokeCount',
    '气嘴类型': 'valveType',
    '标准': 'standard',
    '轴心类型': 'spindleType',
    '导轨': 'rails',
    '材质': 'material',
    '类型': 'type',
    '平台': 'platform',
    '速别': 'speed',
    '侧边': 'side',
    '安装类型': 'mountType',
    '导板尺寸': 'cageSize',
    'BCD': 'boltCircle',
    '齿数': 'teeth',
    '螺栓数': 'bolts',
    '齿比范围': 'range',
    '活塞数': 'pistonCount',
    '规格': 'diameter',
    '长度(mm)': 'length',
    '角度(°)': 'angle',
    '轮圈深度(mm)': 'rimDepth',
    '轮圈宽度(mm)': 'rimWidth',
    '宽度(mm)': 'width',
    '规格(mm)': 'diameter'
  }
  return mapping[label] || label
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    frames: '车架',
    handlebars: '车把',
    stems: '把立',
    wheelsets: '轮组',
    tires: '外胎',
    innerTubes: '内胎',
    bottomBrackets: '中轴',
    saddles: '座垫',
    barTapes: '把带',
    pedals: '脚踏',
    shiftLevers: '手变',
    frontDerailleurs: '前拨',
    rearDerailleurs: '后拨',
    cranks: '曲柄',
    chainrings: '牙盘',
    chains: '链条',
    cassettes: '飞轮',
    seatposts: '座管',
    brakes: '刹车'
  }
  return names[category] || '配件'
}