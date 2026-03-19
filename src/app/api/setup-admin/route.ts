import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== 'backroads2026setup') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: 'bob.smic@gmail.com' },
  })

  if (existing) {
    return NextResponse.json({ message: 'Admin user already exists' })
  }

  await prisma.adminUser.create({
    data: {
      name: 'Bob',
      email: 'bob.smic@gmail.com',
      hashedPassword: await bcrypt.hash('Expert09$', 12),
      role: 'admin',
    },
  })

  return NextResponse.json({ message: 'Admin user created successfully' })
}
