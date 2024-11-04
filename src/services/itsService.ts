import { db } from '@/lib/db'

interface ItsData {
  stud_namn: string
  person_nr: string
}

export async function getPersonNr(stud_namn: string[]): Promise<ItsData[]> {
  try {
    const placeholders = stud_namn.map(() => '?').join(',')
    const [rows] = await db.execute(
      `SELECT stud_namn, person_nr FROM system.its WHERE stud_namn IN (${placeholders})`,
      stud_namn
    )
    return rows as ItsData[]
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch person numbers')
  }
} 