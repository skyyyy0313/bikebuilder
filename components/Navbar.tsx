'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; isAdmin: boolean } | null>(null)

  useEffect(() => {
    // 如果是认证页面，不获取会话
    if (pathname === '/login' || pathname === '/register') {
      setUser(null)
      return
    }
    
    fetch('/api/auth/session')
      .then(res => {
        if (!res.ok) {
          throw new Error('会话获取失败')
        }
        return res.json()
      })
      .then(data => {
        // 只有 isLoggedIn 为 true 时才设置用户
        if (data.isLoggedIn && data.name) {
          setUser({
            name: data.name,
            isAdmin: data.isAdmin || false
          })
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        setUser(null)
      })
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 无论登出是否成功，都跳转到登录页
      setUser(null)
      window.location.href = '/login'
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              自行车配置工具
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              自行车配置工具
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md ${
                  pathname === '/dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                 配置自行车
              </Link>
              {user?.isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md ${
                      pathname.startsWith('/admin') && !pathname.startsWith('/admin/users')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    后台管理
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 rounded-md ${
                      pathname.startsWith('/admin/users')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    用户管理
                  </Link>
                </>
              )}
            </div>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.name}</span>
              {user.isAdmin && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  管理员
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                登出
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}