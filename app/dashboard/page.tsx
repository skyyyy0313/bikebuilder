import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { getUserBikes } from '@/app/actions/bike'
import DeleteButton from '@/components/DeleteButton'
import { prisma } from '@/lib/db'

function parseConfiguration(config: string | null): Record<string, string> | null {
  if (!config) return null
  try {
    return JSON.parse(config)
  } catch {
    return null
  }
}

function countConfiguredCategories(config: Record<string, string> | null): number {
  if (!config) return 0
  return Object.keys(config).filter(key => config[key] !== null).length
}

async function calculateTotalWeight(config: Record<string, string> | null): Promise<number> {
  if (!config) return 0
  
  const modelMap: Record<string, any> = {
    frames: prisma.frame,
    handlebars: prisma.handlebar,
    stems: prisma.stem,
    wheelsets: prisma.wheelset,
    tires: prisma.tire,
    innerTubes: prisma.innerTube,
    bottomBrackets: prisma.bottomBracket,
    saddles: prisma.saddle,
    barTapes: prisma.barTape,
    pedals: prisma.pedal,
    shiftLevers: prisma.shiftLever,
    frontDerailleurs: prisma.frontDerailleur,
    rearDerailleurs: prisma.rearDerailleur,
    cranks: prisma.crank,
    chainrings: prisma.chainring,
    chains: prisma.chain,
    cassettes: prisma.cassette,
  }
  
  let totalWeight = 0
  
  for (const [category, partId] of Object.entries(config)) {
    if (!partId) continue
    
    const model = modelMap[category]
    if (!model) continue
    
    try {
      const part = await model.findUnique({
        where: { id: partId },
        select: { weight: true }
      })
      
      if (part && part.weight) {
        totalWeight += part.weight
      }
    } catch (error) {
      console.error(`获取${category}部件重量失败:`, error)
    }
  }
  
  return totalWeight
}

export default async function DashboardPage() {
  const session = await getSession()
  
  const isLoggedIn = session.isLoggedIn && session.userId
  
  if (!isLoggedIn) {
    return <div>请先登录</div>
  }

  const bikes = await getUserBikes(session.userId!)
  
  const bikesWithWeights = await Promise.all(
    bikes.map(async (bike) => {
      const config = parseConfiguration(bike.configuration)
      const weight = await calculateTotalWeight(config)
      const configuredCount = countConfiguredCategories(config)
      return {
        ...bike,
        config,
        weight,
        configuredCount
      }
    })
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">我的自行车</h1>
        <Link
          href="/bikes/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          新建自行车
        </Link>
      </div>
      
       {bikesWithWeights.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">您还没有自行车</p>
          <Link
            href="/bikes/new"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            创建第一辆自行车
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {bikesWithWeights.map((bike) => {
            return (
              <div
                key={bike.id}
                className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <DeleteButton bikeId={bike.id} bikeName={bike.name} />
                <Link
                  href={`/bikes/${bike.id}`}
                  className="block"
                >
                  <h3 className="text-xl font-semibold mb-2 pr-10">{bike.name}</h3>
                  <p className="text-gray-600 mb-2">
                    创建时间: {new Date(bike.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="text-gray-600 mb-2">
                     配置状态: {bike.configuredCount > 0 ? `已配置 ${bike.configuredCount} 个部件` : '未配置'}
                  </p>
                   <p className="text-gray-600">总重量: {bike.weight > 0 ? `${bike.weight}g` : '暂未计算'}</p>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
