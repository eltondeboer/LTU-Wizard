import { NextResponse } from 'next/server'
import { sendGradesToLadok } from '@/services/sendLadokService'

export async function POST(request: Request) {
  try {
    const grades = await request.json()
    console.log('Received grades in API:', grades)
    
    // Validate the incoming data
    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format: Empty or not an array' },
        { status: 400 }
      )
    }

    // Validate each grade object
    for (const grade of grades) {
      const missingFields = []
      if (!grade.person_nr) missingFields.push('person_nr')
      if (!grade.modul_kod) missingFields.push('modul_kod')
      if (!grade.betyg) missingFields.push('betyg')
      if (!grade.datum) missingFields.push('datum')
      if (!grade.kurskod) missingFields.push('kurskod')

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        )
      }
    }

    await sendGradesToLadok(grades)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Detailed API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 