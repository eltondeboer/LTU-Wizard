import { db } from '@/lib/db'

interface LadokModule {
  idepok: string
  uppgift: string
  kurskod: string
  display: string
}

export async function getLadokModules(kurskod: string): Promise<LadokModule[]> {
  try {
    const [rows] = await db.execute(
      'SELECT idepok, uppgift, kurskod FROM epok WHERE kurskod = ? ORDER BY idepok',
      [kurskod]
    )
    
    // Transform the rows to use uppgift as the display and value
    return (rows as LadokModule[]).map(row => ({
      ...row,
      display: row.uppgift // Just use the uppgift text
    }))
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Failed to fetch Ladok modules')
  }
} 