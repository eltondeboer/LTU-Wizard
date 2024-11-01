import { NextResponse } from 'next/server'
import { getStudentsByKurskod, getUniqueAssignments } from '@/services/canvasService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kurskod = searchParams.get('kurskod')
  const uppgift = searchParams.get('uppgift')
  const fetchType = searchParams.get('type')

  if (!kurskod) {
    return NextResponse.json(
      { error: 'Kurskod is required' },
      { status: 400 }
    )
  }

  try {
    if (fetchType === 'assignments') {
      const assignments = await getUniqueAssignments(kurskod)
      return NextResponse.json(assignments)
    } else {
      const students = await getStudentsByKurskod(kurskod, uppgift || undefined)
      return NextResponse.json(students)
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 