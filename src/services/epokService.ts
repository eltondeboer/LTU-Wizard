import { db } from '@/lib/db'
import { LadokModule, LadokGrade } from '@/types/ladok'

export async function getLadokModules(kurskod: string): Promise<LadokModule[]> {
  try {
    const [rows] = await db.execute(
      'SELECT idepok, uppgift, kurskod FROM epok WHERE kurskod = ? ORDER BY idepok',
      [kurskod]
    )
    return rows as LadokModule[]
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch Ladok modules')
  }
}

export async function sendGradesToLadok(grades: LadokGrade[]): Promise<void> {
  try {
    // This will be implemented later when connecting to Ladok
    // For now, it's just a placeholder
    console.log('Sending grades to Ladok:', grades)
  } catch (error) {
    console.error('Error sending grades to Ladok:', error)
    throw new Error('Failed to send grades to Ladok')
  }
} 