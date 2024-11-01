import { NextResponse } from 'next/server'
import { getStudentsByKurskod } from '@/services/studentService'

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
    const students = await getStudentsByKurskod(kurskod)
    return NextResponse.json(students)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    )
  }
} 