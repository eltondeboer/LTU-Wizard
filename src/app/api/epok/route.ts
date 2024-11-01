import { NextResponse } from 'next/server'
import { getLadokModules } from '@/services/epokService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kurskod = searchParams.get('kurskod')

  if (!kurskod) {
    return NextResponse.json(
      { error: 'Kurskod is required' },
      { status: 400 }
    )
  }

  try {
    const modules = await getLadokModules(kurskod)
    return NextResponse.json(modules)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Ladok modules' },
      { status: 500 }
    )
  }
} 