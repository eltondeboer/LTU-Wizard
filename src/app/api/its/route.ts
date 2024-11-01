import { NextResponse } from 'next/server'
import { getPersonNr } from '@/services/itsService'

export async function POST(request: Request) {
  try {
    const { stud_namn } = await request.json()
    if (!Array.isArray(stud_namn)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const personNrs = await getPersonNr(stud_namn)
    return NextResponse.json(personNrs)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person numbers' },
      { status: 500 }
    )
  }
} 