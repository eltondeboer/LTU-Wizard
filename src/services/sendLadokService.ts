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
    // Validate input
    if (!Array.isArray(grades) || grades.length === 0) {
      throw new Error('Invalid grades data: Empty or not an array')
    }

    // Validate each grade object with detailed logging
    grades.forEach((grade, index) => {
      console.log(`Validating grade at index ${index}:`, grade)
      const missingFields = []
      if (!grade.person_nr) missingFields.push('person_nr')
      if (!grade.modul_kod) missingFields.push('modul_kod')
      if (!grade.betyg) missingFields.push('betyg')
      if (!grade.datum) missingFields.push('datum')
      if (!grade.kurskod) missingFields.push('kurskod')
      
      if (missingFields.length > 0) {
        throw new Error(`Invalid grade data at index ${index}. Missing fields: ${missingFields.join(', ')}`)
      }
    })

    console.log('Starting transaction with grades:', grades)

    // Start transaction
    await connection.beginTransaction()

    try {
      for (const grade of grades) {
        console.log('Attempting to insert/update grade:', grade)
        
        await connection.execute(
          `INSERT INTO ladok (person_nr, namn, modul_kod, betyg, datum, kurskod) 
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