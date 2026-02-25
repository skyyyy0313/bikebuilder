'use server'

import { hashPassword, verifyPassword, getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function register(name: string, email: string, password: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: '该邮箱已注册' }
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    const session = await getSession()
    ;(session as any).userId = user.id
    ;(session as any).email = user.email
    ;(session as any).name = user.name
    ;(session as any).isAdmin = user.isAdmin
    ;(session as any).isLoggedIn = true
    await session.save()

    return { success: true }
  } catch (error) {
    console.error('注册错误:', error)
    return { success: false, error: '注册失败' }
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: '邮箱或密码错误' }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: '邮箱或密码错误' }
    }

    const session = await getSession()
    ;(session as any).userId = user.id
    ;(session as any).email = user.email
    ;(session as any).name = user.name
    ;(session as any).isAdmin = user.isAdmin
    ;(session as any).isLoggedIn = true
    await session.save()

    return { success: true }
  } catch (error) {
    console.error('登录错误:', error)
    return { success: false, error: '登录失败' }
  }
}

export async function logout() {
  try {
    const session = await getSession()
    // 检查是否有 destroy 方法
    if (typeof session.destroy === 'function') {
      await session.destroy()
    } else {
      // 降级方案：清除所有会话数据并保存
      session.userId = undefined
      session.email = undefined
      session.name = undefined
      session.isAdmin = undefined
      session.isLoggedIn = false
      await session.save()
    }
    return { success: true }
  } catch (error) {
    console.error('登出错误:', error)
    return { success: false }
  }
}