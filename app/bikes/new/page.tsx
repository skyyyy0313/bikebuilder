'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBike } from '@/app/actions/bike'

export default function NewBikePage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    try {
      const result = await createBike(name)
      if (result.success && result.bikeId) {
        router.push(`/bikes/${result.bikeId}/configure`)
      } else {
        setError(result.error || '创建失败')
      }
    } catch (err) {
      setError('发生错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
     <div className="max-w-md mx-auto mt-16">
       <h1 className="text-3xl font-bold mb-8 text-center">新建自行车</h1>
       <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            自行车名称
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="我的公路车"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 font-medium mb-1">创建失败</div>
            <div className="text-red-700 text-sm">{error}</div>
            {(error.includes('用户账户不存在') || error.includes('请重新登录') || error.includes('会话无效')) && (
              <div className="mt-2 text-red-600 text-sm">
                建议：请尝试 <a href="/login" className="underline font-medium">重新登录</a> 后重试
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建'}
          </button>
        </div>
      </form>
    </div>
  )
}