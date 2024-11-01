import { db } from '@/lib/db'
import { StudentData } from '@/types/student'

export async function getStudentsByKurskod(kurskod: string, uppgift?: string): Promise<StudentData[]> {
  try {
    let query = 'SELECT stud_namn, kurskod, namn, DATE_FORMAT(datum, "%Y-%m-%d") as datum, betyg_canvas, uppgift FROM canvas WHERE kurskod = ?'
    const params = [kurskod]
    
    if (uppgift) {
      query += ' AND uppgift = ?'
      params.push(uppgift)
    }
    
    const [rows] = await db.execute(query, params)
    return rows as StudentData[]
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch student data')
  }
}

export async function getUniqueAssignments(kurskod: string): Promise<string[]> {
  try {
    const [rows] = await db.execute(
      'SELECT DISTINCT uppgift FROM canvas WHERE kurskod = ? ORDER BY uppgift',
      [kurskod]
    )
    return (rows as { uppgift: string }[]).map(row => row.uppgift)
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch assignments')
  }
} 