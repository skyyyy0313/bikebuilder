'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBike } from '@/app/actions/bike'

interface DeleteButtonProps {
  bikeId: string
  bikeName: string
}

export default function DeleteButton({ bikeId, bikeName }: DeleteButtonProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteBike(bikeId)
      if (result.success) {
        router.refresh()
      } else {
        alert(`删除失败: ${result.error}`)
      }
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败，请重试')
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2"
        title="删除此配置"
      >
        🗑️
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">删除配置</h3>
            <p className="text-gray-600 mb-6">
              是否删除配置 <span className="font-semibold">{bikeName}</span>？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDialog}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}