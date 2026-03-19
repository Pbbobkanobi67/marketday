import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
    CredentialsProvider({
      id: 'vendor-credentials',
      name: 'Vendor Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const vendor = await prisma.vendor.findUnique({
          where: { email: credentials.email },
        })
        if (!vendor || !vendor.hashedPassword) return null
        const isValid = await bcrypt.compare(credentials.password, vendor.hashedPassword)
        if (!isValid) return null
        return {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          role: 'vendor',
          vendorId: vendor.id,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.vendorId = (user as { vendorId?: string }).vendorId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { vendorId?: string }).vendorId = token.vendorId as string | undefined
      }
      return session
    },
  },
}
