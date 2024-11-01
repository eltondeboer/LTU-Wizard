import { db } from '@/lib/db'
import { StudentData } from '@/types/student'

export async function getStudentsByKurskod(kurskod: string): Promise<StudentData[]> {
  try {
    const [rows] = await db.execute(
      'SELECT stud_namn, kurskod, namn, datum, betyg_canvas, uppgift FROM canvas WHERE kurskod = ?',
      [kurskod]
    )
    return rows as StudentData[]
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch student data')
  }
} 