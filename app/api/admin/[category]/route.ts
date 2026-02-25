import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getModelData } from '@/app/actions/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { category } = await params
    const modelData = await getModelData(category)

    if (!modelData) {
      return NextResponse.json({ error: '找不到对应的配件分类' }, { status: 404 })
    }

    return NextResponse.json(modelData.data)
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}