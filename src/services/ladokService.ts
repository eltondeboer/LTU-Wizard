import { db } from '@/lib/db'

interface LadokGrade {
  person_nr: string
  namn: string
  modul_kod: string
  betyg: string
  datum: string
  kurskod: string
}

export async function sendGradesToLadok(grades: LadokGrade[]): Promise<void> {
  try {
    // Using a transaction to ensure all inserts succeed or none do
    await db.execute('START TRANSACTION')

    for (const grade of grades) {
      await db.execute(
        `INSERT INTO ladok (person_nr, namn, modul_kod, betyg, datum, kurskod) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         namn = VALUES(namn),
         betyg = VALUES(betyg),
         datum = VALUES(datum)`,
        [grade.person_nr, grade.namn, grade.modul_kod, grade.betyg, grade.datum, grade.kurskod]
      )
    }

    await db.execute('COMMIT')
  } catch (error) {
    await db.execute('ROLLBACK')
    console.error('Database error:', error)
    throw new Error('Failed to send grades to Ladok')
  }
} 