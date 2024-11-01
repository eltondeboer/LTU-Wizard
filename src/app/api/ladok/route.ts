import { NextResponse } from 'next/server'
import { getLadokModules, sendGradesToLadok } from '@/services/epokService'
import { LadokGrade } from '@/types/ladok'

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

export async function POST(request: Request) {
  try {
    const grades: LadokGrade[] = await request.json()
    await sendGradesToLadok(grades)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to send grades to Ladok' },
      { status: 500 }
    )
  }
} 