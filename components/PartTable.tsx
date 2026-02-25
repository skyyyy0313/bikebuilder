'use client'

import { useState, useRef } from 'react'
import { deletePart, updatePart, createPart, exportPartsToExcel, importPartsFromExcel, ExcelImportResult } from '@/app/actions/admin'
import PartForm from './PartForm'

interface Column {
  key: string
  label: string
}

interface PartData {
  id: string
  [key: string]: any
}

interface PartTableProps {
  category: string
  columns: Column[]
  data: PartData[]
}

export default function PartTable({ category, columns, data }: PartTableProps) {
  const [parts, setParts] = useState(data)
  const [editingPart, setEditingPart] = useState<PartData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null)
  const [showImportResult, setShowImportResult] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [visibleFields, setVisibleFields] = useState<Set<string>>(() => {
    const defaultVisible = new Set(columns.map(col => col.key))
    return defaultVisible
  })

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey)
      } else {
        newSet.add(fieldKey)
      }
      return newSet
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return
    
    setLoading(true)
    try {
      await deletePart(category, id)
      setParts(parts.filter(part => part.id !== id))
    } catch (error) {
      alert('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (part: PartData) => {
    setEditingPart(part)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingPart(null)
    setShowForm(true)
  }

  const handleSubmit = async (formData: Record<string, any>) => {
    setLoading(true)
    try {
      if (editingPart) {
        const updated = await updatePart(category, editingPart.id, formData)
        setParts(parts.map(part => part.id === editingPart.id ? updated : part))
      } else {
        const created = await createPart(category, formData)
        setParts([created, ...parts])
      }
      setShowForm(false)
      setEditingPart(null)
    } catch (error) {
      alert(editingPart ? '更新失败' : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const base64String = await exportPartsToExcel(category)
      console.log('Received base64 string:', base64String, typeof base64String)
      
      const binaryString = atob(base64String)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${category}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('导出失败: ' + (error as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)
    setShowImportResult(false)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      const result = await importPartsFromExcel(category, base64String, file.name)
      setImportResult(result)
      setShowImportResult(true)

      if (result.imported > 0) {
        const updatedData = await fetchParts()
        setParts(updatedData)
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        errors: ['导入失败: ' + (error as Error).message],
        total: 0
      })
      setShowImportResult(true)
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const fetchParts = async () => {
    try {
      const response = await fetch(`/api/admin/${category}?t=${Date.now()}`)
      if (!response.ok) throw new Error('获取数据失败')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('刷新数据失败:', error)
      return parts
    }
  }

  const filteredColumns = columns.filter(column => 
    column.key === 'actions' || visibleFields.has(column.key)
  )
  
  return (
    <div>
       <div className="mb-6 flex flex-wrap gap-4 items-center relative">
        <button
          onClick={handleCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          disabled={loading}
        >
          添加{getCategoryName(category)}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                导出中...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出Excel
              </>
            )}
          </button>
          
          <button
            onClick={handleImportClick}
            disabled={importing || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {importing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                导入中...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                导入Excel
              </>
            )}
           </button>
           
           <button
             type="button"
             onClick={() => setShowFieldSelector(!showFieldSelector)}
             className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
             disabled={loading}
           >
             <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
             </svg>
             选择字段
           </button>
        </div>

        {showFieldSelector && (
          <div className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 p-4 max-h-64 overflow-y-auto">
            <div className="mb-2 font-medium text-sm">显示字段:</div>
            <div className="space-y-2">
               {columns.filter(col => col.key !== 'actions').map(column => (
                <label key={column.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visibleFields.has(column.key)}
                    onChange={() => toggleFieldVisibility(column.key)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
      </div>

       <div className="text-sm text-gray-500 mb-2 flex items-center">
         <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
         </svg>
         表格支持横向滚动，可左右拖动查看所有字段
       </div>
       <div className="bg-white rounded-lg shadow overflow-x-auto overflow-y-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                {filteredColumns.map((column) => (
                 <th
                   key={column.key}
                   className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.key === 'actions' ? 'w-32' : ''}`}
                 >
                   {column.label}
                 </th>
               ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                {filteredColumns.map((column) => (
                   <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.key === 'actions' ? 'w-32' : ''}`}>
                    {column.key === 'actions' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(part)}
                          className="text-primary-600 hover:text-primary-900"
                          disabled={loading}
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(part.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          删除
                        </button>
                      </div>
                    ) : column.key === 'createdAt' ? (
                      new Date(part[column.key]).toLocaleDateString('zh-CN')
                    ) : column.key === 'isIntegrated' ? (
                      part[column.key] ? '是' : '否'
                    ) : (
                      part[column.key] || '-'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImportResult && importResult && (
        <div className={`mt-6 p-4 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-lg font-medium ${importResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
                {importResult.success ? '导入成功' : '导入完成，但有部分错误'}
              </h3>
              <div className="mt-2">
                <p className={`text-sm ${importResult.success ? 'text-green-700' : 'text-yellow-700'}`}>
                  总计: {importResult.total} 条记录, 成功导入: {importResult.imported} 条
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm text-red-700">错误信息:</p>
                    <ul className="mt-1 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowImportResult(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <PartForm
          category={category}
          part={editingPart}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingPart(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
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