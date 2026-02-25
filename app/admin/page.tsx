import { getSession } from '@/lib/auth'
import Link from 'next/link'

const categories = [
  { id: 'frames', name: '车架', description: '管理车架配件' },
  { id: 'handlebars', name: '车把', description: '管理车把配件' },
  { id: 'stems', name: '把立', description: '管理把立配件' },
  { id: 'wheelsets', name: '轮组', description: '管理轮组配件' },
  { id: 'tires', name: '外胎', description: '管理外胎配件' },
  { id: 'innerTubes', name: '内胎', description: '管理内胎配件' },
  { id: 'bottomBrackets', name: '中轴', description: '管理中轴配件' },
  { id: 'saddles', name: '座垫', description: '管理座垫配件' },
  { id: 'barTapes', name: '把带', description: '管理把带配件' },
  { id: 'pedals', name: '脚踏', description: '管理脚踏配件' },
  { id: 'shiftLevers', name: '手变', description: '管理手变配件' },
  { id: 'frontDerailleurs', name: '前拨', description: '管理前拨配件' },
  { id: 'rearDerailleurs', name: '后拨', description: '管理后拨配件' },
  { id: 'cranks', name: '曲柄', description: '管理曲柄配件' },
  { id: 'chainrings', name: '牙盘', description: '管理牙盘配件' },
  { id: 'chains', name: '链条', description: '管理链条配件' },
  { id: 'cassettes', name: '飞轮', description: '管理飞轮配件' },
  { id: 'seatposts', name: '座管', description: '管理座管配件' },
  { id: 'brakes', name: '刹车', description: '管理刹车配件' },
]

export default async function AdminPage() {
  const session = await getSession()
  
  const isAdmin = session.isAdmin && session.isLoggedIn && session.userId
  
  if (!isAdmin) {
    return <div>需要管理员权限</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">管理员后台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/admin/${category.id}`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <p className="text-gray-600">{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}