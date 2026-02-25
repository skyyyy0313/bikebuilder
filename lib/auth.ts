import bcrypt from 'bcrypt'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from './session'
import { prisma } from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  
  // 确保会话对象有默认值
  if (typeof session.isLoggedIn === 'undefined') {
    session.isLoggedIn = false
  }
  if (typeof session.isAdmin === 'undefined') {
    session.isAdmin = false
  }
  
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    throw new Error('未授权')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (!session.isAdmin) {
    throw new Error('需要管理员权限')
  }
  return session
}