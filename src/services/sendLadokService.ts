import { db } from '@/lib/db'

interface SendLadokGrade {
  person_nr: string
  namn: string
  modul_kod: string
  betyg: string
  datum: string
  kurskod: string
}

export async function sendGradesToLadok(grades: SendLadokGrade[]): Promise<void> {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()

    try {
      for (const grade of grades) {
        console.log('Attempting to insert/update grade:', grade)
        
        await connection.execute(
          `INSERT INTO system.ladok (person_nr, namn, modul_kod, betyg, datum, kurskod) 
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           namn = VALUES(namn),
           betyg = VALUES(betyg),
           datum = VALUES(datum),
           kurskod = VALUES(kurskod)`,
          [
            grade.person_nr,
            grade.namn,
            grade.modul_kod,
            grade.betyg,
            grade.datum,
            grade.kurskod
          ]
        )
      }

      await connection.commit()
      console.log('Transaction committed successfully')
    } catch (queryError) {
      console.error('Error during database operations:', queryError)
      await connection.rollback()
      throw queryError
    }
  } catch (error) {
    console.error('Detailed error in sendGradesToLadok:', error)
    try {
      await connection.rollback()
      console.log('Transaction rolled back successfully')
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError)
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to send grades to Ladok: ${error.message}`)
    } else {
      throw new Error('Failed to send grades to Ladok: Unknown error')
    }
  } finally {
    connection.release()
  }
} 