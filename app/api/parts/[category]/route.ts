import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const modelConfigs: Record<string, { 
  title: string, 
  model: any,
  fields: string[] 
}> = {
  frames: {
    title: '车架',
    model: prisma.frame,
    fields: ['brand', 'model', 'frameWeight', 'forkWeight', 'seatpostWeight', 'type', 'material', 'color', 'size', 'bottomBracketStandard']
  },
  handlebars: {
    title: '车把',
    model: prisma.handlebar,
    fields: ['brand', 'model', 'weight', 'isIntegrated', 'width', 'stemLength']
  },
  stems: {
    title: '把立',
    model: prisma.stem,
    fields: ['brand', 'model', 'weight', 'length', 'angle']
  },
  wheelsets: {
    title: '轮组',
    model: prisma.wheelset,
    fields: ['brand', 'model', 'weight', 'rimDepth', 'rimWidth', 'hubType', 'spokeCount']
  },
  tires: {
    title: '外胎',
    model: prisma.tire,
    fields: ['brand', 'model', 'weight', 'width', 'type']
  },
  innerTubes: {
    title: '内胎',
    model: prisma.innerTube,
    fields: ['brand', 'model', 'weight', 'valveType']
  },
  bottomBrackets: {
    title: '中轴',
    model: prisma.bottomBracket,
    fields: ['brand', 'model', 'weight', 'standard', 'spindleType']
  },
  saddles: {
    title: '座垫',
    model: prisma.saddle,
    fields: ['brand', 'model', 'weight', 'width', 'rails']
  },
  barTapes: {
    title: '把带',
    model: prisma.barTape,
    fields: ['brand', 'model', 'weight', 'color', 'material']
  },
  pedals: {
    title: '脚踏',
    model: prisma.pedal,
    fields: ['brand', 'model', 'weight', 'type', 'platform']
  },
  shiftLevers: {
    title: '手变',
    model: prisma.shiftLever,
    fields: ['brand', 'model', 'weight', 'speed', 'side']
  },
  frontDerailleurs: {
    title: '前拨',
    model: prisma.frontDerailleur,
    fields: ['brand', 'model', 'weight', 'speed', 'mountType']
  },
  rearDerailleurs: {
    title: '后拨',
    model: prisma.rearDerailleur,
    fields: ['brand', 'model', 'weight', 'speed', 'cageSize']
  },
  cranks: {
    title: '曲柄',
    model: prisma.crank,
    fields: ['brand', 'model', 'weight', 'length', 'boltCircle']
  },
  chainrings: {
    title: '牙盘',
    model: prisma.chainring,
    fields: ['brand', 'model', 'weight', 'teeth', 'bolts']
  },
  chains: {
    title: '链条',
    model: prisma.chain,
    fields: ['brand', 'model', 'weight', 'speed', 'length']
  },
  cassettes: {
    title: '飞轮',
    model: prisma.cassette,
    fields: ['brand', 'model', 'weight', 'speeds', 'range']
  },
  seatposts: {
    title: '座管',
    model: prisma.seatpost,
    fields: ['brand', 'model', 'length', 'diameter', 'weight', 'material']
  },
  brakes: {
    title: '刹车',
    model: prisma.brake,
    fields: ['brand', 'model', 'weight', 'type', 'mountType', 'pistonCount', 'material']
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { category } = await params
    const config = modelConfigs[category]
    
    if (!config) {
      return NextResponse.json({ error: '找不到对应的配件分类' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    let whereClause: any = {}
    
    if (search) {
      whereClause = {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } }
        ]
      }
    }
    
    const data = await config.model.findMany({
      where: whereClause,
      orderBy: { brand: 'asc' },
      take: 50
    })

    return NextResponse.json({
      title: config.title,
      data,
      fields: config.fields
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}