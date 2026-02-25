import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getSession()
  
  if (session.isLoggedIn) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Image Carousel */}
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Image Carousel Background */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {/* Image 1 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_0s]">
              <img 
                src="/banner/bike1.jpg" 
                alt="Bike 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 2 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_6s]">
              <img 
                src="/banner/bike2.jpg" 
                alt="Bike 2"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 3 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_12s]">
              <img 
                src="/banner/bike3.jpg" 
                alt="Bike 3"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 4 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_18s]">
              <img 
                src="/banner/bike4.jpg" 
                alt="Bike 4"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 5 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_24s]">
              <img 
                src="/banner/bike5.jpg" 
                alt="Bike 5"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 6 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_30s]">
              <img 
                src="/banner/bike6.jpg" 
                alt="Bike 6"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 7 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_36s]">
              <img 
                src="/banner/bike7.jpg" 
                alt="Bike 7"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 8 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_42s]">
              <img 
                src="/banner/bike8.jpg" 
                alt="Bike 8"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 9 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_48s]">
              <img 
                src="/banner/bike9.jpg" 
                alt="Bike 9"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            {/* Image 10 */}
            <div className="absolute inset-0 opacity-0 animate-[fadeInOut_60s_infinite_54s]">
              <img 
                src="/banner/bike10.jpg" 
                alt="Bike 10"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            自行车配置工具
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl drop-shadow-lg">
            专业的自行车零件配置平台，轻松打造您的专属座驾
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-lg"
            >
              立即开始
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-opacity-90 bg-primary-800 hover:bg-primary-900 border border-white border-opacity-30 shadow-lg"
            >
              免费注册
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">核心功能</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">零件管理</h3>
                <p className="text-gray-600">
                  包含17种自行车零件分类，涵盖车架、轮组、变速系统等完整配置
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">快速配置</h3>
                <p className="text-gray-600">
                  直观的配置界面，实时计算总重量，轻松选择和更换零件
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">数据导出</h3>
                <p className="text-gray-600">
                  支持Excel格式导出，方便保存和分享您的自行车配置方案
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">使用流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="relative">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">注册账号</h3>
                <p className="text-gray-600">创建您的专属账户</p>
              </div>
              
              <div className="relative">
                <div className="md:absolute md:top-8 md:-right-4 md:w-8 md:h-0.5 bg-primary-300 hidden md:block"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">创建配置</h3>
                <p className="text-gray-600">新建自行车配置项目</p>
              </div>
              
              <div className="relative">
                <div className="md:absolute md:top-8 md:-right-4 md:w-8 md:h-0.5 bg-primary-300 hidden md:block"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择零件</h3>
                <p className="text-gray-600">从丰富零件库中挑选</p>
              </div>
              
              <div className="relative">
                <div className="md:absolute md:top-8 md:-right-4 md:w-8 md:h-0.5 bg-primary-300 hidden md:block"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">保存分享</h3>
                <p className="text-gray-600">导出配置并与他人分享</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-50 rounded-lg">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            立即开始配置您的专属自行车
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            加入数百名自行车爱好者的行列，打造您的完美座驾
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              免费注册
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 border border-primary-300"
            >
              已有账号？立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}