import { getSession } from '@/lib/auth'
import PartTable from '@/components/PartTable'
import { getModelData } from '@/app/actions/admin'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const session = await getSession()
  
  const isAdmin = session.isAdmin && session.isLoggedIn && session.userId
  
  if (!isAdmin) {
    return <div>需要管理员权限</div>
  }

  const modelData = await getModelData(category)

  if (!modelData) {
    return <div>找不到对应的配件分类</div>
  }

  const { title, columns, data } = modelData

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link
          href="/admin"
          className="flex items-center text-primary-600 hover:text-primary-800 mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          返回后台
        </Link>
        <h1 className="text-3xl font-bold flex-grow text-center">{title}管理</h1>
        <div className="w-20"></div> {/* 用于平衡布局 */}
      </div>
      <PartTable
        category={category}
        columns={columns}
        data={data}
      />
    </div>
  )
}