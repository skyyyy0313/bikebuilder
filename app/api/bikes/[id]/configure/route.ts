import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { id } = await params

    const bike = await prisma.bike.findUnique({
      where: { id }
    })

    if (!bike) {
      return NextResponse.json({ error: '自行车不存在' }, { status: 404 })
    }

    if (bike.userId !== session.userId) {
      return NextResponse.json({ error: '无权访问此自行车' }, { status: 403 })
    }

    let configuration = {}
    if ((bike as any).configuration) {
      try {
        configuration = JSON.parse((bike as any).configuration)
      } catch {
        configuration = {}
      }
    }

    return NextResponse.json({ 
      success: true, 
      configuration,
      bike
    })
  } catch (error) {
    console.error('获取配置错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { id } = await params
    const { selections } = await request.json()

    if (!selections || typeof selections !== 'object') {
      return NextResponse.json({ error: '无效的配置数据' }, { status: 400 })
    }

    const bike = await prisma.bike.findUnique({
      where: { id }
    })

    if (!bike) {
      return NextResponse.json({ error: '自行车不存在' }, { status: 404 })
    }

    if (bike.userId !== session.userId) {
      return NextResponse.json({ error: '无权修改此自行车' }, { status: 403 })
    }

    console.log('尝试保存配置到自行车:', id)
    console.log('配置数据:', selections)
    console.log('字符串化的配置:', JSON.stringify(selections))
    
    const updatedBike = await prisma.bike.update({
      where: { id },
      data: {
        configuration: JSON.stringify(selections)
      } as any
    })

    return NextResponse.json({ 
      success: true, 
      message: '配置保存成功',
      bike: updatedBike
    })
  } catch (error) {
    console.error('保存配置错误详细:', error)
    console.error('错误堆栈:', (error as Error).stack)
    return NextResponse.json({ error: `服务器错误: ${(error as Error).message}` }, { status: 500 })
  }
}