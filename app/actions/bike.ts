'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function createBike(name: string) {
  try {
    const session = await getSession()
    
    console.log('创建自行车会话:', { 
      isLoggedIn: session.isLoggedIn, 
      userId: session.userId,
      email: session.email,
      name: session.name 
    })
    
    if (!session.isLoggedIn) {
      console.log('用户未登录')
      return { success: false, error: '请先登录' }
    }

    if (!session.userId) {
      console.error('用户ID不存在于会话中')
      return { success: false, error: '会话无效，请重新登录' }
    }

    // 检查用户是否存在于数据库中
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      console.error(`数据库中找不到用户ID: ${session.userId}`)
      return { success: false, error: '用户账户不存在，请重新登录' }
    }

    console.log(`为用户 ${user.email} 创建自行车: ${name}`)

    const bike = await prisma.bike.create({
      data: {
        name,
        userId: session.userId,
      },
    })

    console.log('自行车创建成功:', bike.id)
    return { success: true, bikeId: bike.id }
  } catch (error: any) {
    console.error('创建自行车错误详情:', error)
    console.error('错误名称:', error.name)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    // 提供更具体的错误信息
    let errorMessage = '创建失败'
    if (error.message.includes('foreign key constraint')) {
      errorMessage = '用户账户不存在，请重新登录'
    } else if (error.message.includes('Unique constraint')) {
      errorMessage = '自行车名称可能已存在'
    } else if (error.message.includes('prisma')) {
      errorMessage = '数据库错误，请检查连接'
    }
    
    return { success: false, error: errorMessage + ': ' + (error.message || '未知错误') }
  }
}

export async function getUserBikes(userId: string) {
  try {
    const bikes = await prisma.bike.findMany({
      where: { userId: userId as any },
      orderBy: { createdAt: 'desc' },
    })
    return bikes
  } catch (error) {
    console.error('获取自行车列表错误:', error)
    return []
  }
}

export async function deleteBike(bikeId: string) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return { success: false, error: '请先登录' }
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId }
    })

    if (!bike) {
      return { success: false, error: '自行车不存在' }
    }

    if (bike.userId !== session.userId) {
      return { success: false, error: '无权删除此自行车' }
    }

    await prisma.bike.delete({
      where: { id: bikeId }
    })

    return { success: true, message: '自行车删除成功' }
  } catch (error) {
    console.error('删除自行车错误:', error)
    return { success: false, error: '删除失败' }
  }
}