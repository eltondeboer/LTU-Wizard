'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentData } from '@/types/student'

const GRADE_OPTIONS = ["U", "G", "VG"] as const
type Grade = typeof GRADE_OPTIONS[number]

// Update the initial data structure to match the database
const initialData: StudentData[] = []

export default function Home() {
  const [kurskod, setKurskod] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [data, setData] = useState<StudentData[]>(initialData)
  const [editedData, setEditedData] = useState<StudentData[]>(initialData)

  const handleGetData = async (): Promise<void> => {
    if (!kurskod.trim()) {
      alert('Please enter a kurskod')
      return
    }

    setIsFetching(true)
    try {
      const response = await fetch(`/api/students?kurskod=${kurskod}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const fetchedData = await response.json()
      setData(fetchedData)
      setEditedData(fetchedData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error fetching data. Please try again.')
    } finally {
      setIsFetching(false)
    }
  }

  const handleUpdate = (): void => {
    setIsLoading(true)
    // Simulate saving changes locally
    setTimeout(() => {
      setData(editedData)
      setIsLoading(false)
    }, 1000)
  }

  const handleSendToLadok = (): void => {
    // This will send the saved data (not the edited data) to Ladok
    alert(`Sending saved data to Ladok for kurskod: ${kurskod}`)
  }

  const handleCellEdit = (stud_namn: string, field: keyof StudentData, value: string) => {
    setEditedData(prevData =>
      prevData.map(row =>
        row.stud_namn === stud_namn ? { ...row, [field]: value } : row
      )
    )
  }

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(data) !== JSON.stringify(editedData)

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
          <div className="absolute left-4">
            {/* Empty div for spacing */}
          </div>
          <h1 className="text-2xl font-bold flex-grow text-center">LTU-Wizard</h1>
          <div className="absolute right-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Student Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4 items-center">
                <Input
                  type="text"
                  placeholder="kurskod"
                  value={kurskod}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKurskod(e.target.value)}
                  className="max-w-[150px]"
                />
                <Button 
                  onClick={handleGetData} 
                  disabled={isFetching}
                  variant="secondary"
                >
                  {isFetching ? 'Fetching...' : 'Get Data'}
                </Button>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Assignment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isLoading || isFetching) ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          {isFetching ? 'Fetching data...' : 'Saving changes...'}
                        </TableCell>
                      </TableRow>
                    ) : editedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No data found for this kurskod
                        </TableCell>
                      </TableRow>
                    ) : (
                      editedData.map((row) => (
                        <TableRow key={row.stud_namn}>
                          <TableCell>{row.stud_namn}</TableCell>
                          <TableCell>{row.namn}</TableCell>
                          <TableCell>
                            {new Date(row.datum).toISOString().split('T')[0]}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.betyg_canvas}
                              onValueChange={(value) => handleCellEdit(row.stud_namn, 'betyg_canvas', value)}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {GRADE_OPTIONS.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{row.uppgift}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex space-x-4">
                <Button 
                  onClick={handleUpdate} 
                  disabled={isLoading || !hasChanges}
                  variant={hasChanges ? "default" : "secondary"}
                >
                  {isLoading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
                <Button 
                  onClick={handleSendToLadok}
                  disabled={isLoading}
                >
                  Send to Ladok
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
