import { getSession } from '@/lib/auth'
import { SessionData } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    
    // 确保返回标准的 SessionData 结构
    const sessionData: SessionData = {
      userId: session.userId || undefined,
      email: session.email || undefined,
      name: session.name || undefined,
      isAdmin: session.isAdmin || false,
      isLoggedIn: !!session.isLoggedIn && !!session.userId
    }
    
    return Response.json(sessionData)
  } catch (error) {
    console.error('会话API错误:', error)
    // 出错时返回默认的空会话
    const emptySession: SessionData = {
      isLoggedIn: false
    }
    return Response.json(emptySession)
  }
}