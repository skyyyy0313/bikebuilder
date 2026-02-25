import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId || !session.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    const { isAdmin } = body

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (targetUser.id === session.userId && !isAdmin) {
      return NextResponse.json({ error: '不能取消自己的管理员权限' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('更新用户错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId || !session.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { id } = await params
    
    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (targetUser.id === session.userId) {
      return NextResponse.json({ error: '不能修改自己的管理员状态' }, { status: 400 })
    }

    const newAdminStatus = !targetUser.isAdmin
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin: newAdminStatus }
    })

    return NextResponse.redirect(new URL('/admin/users', request.url))
  } catch (error) {
    console.error('切换管理员状态错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId || !session.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bikes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('获取用户错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}