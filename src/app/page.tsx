'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

interface StudentData {
  id: number
  name: string
  course: string
  grade: string
}

// Mock data - this will be replaced with MySQL data later
const initialData: StudentData[] = [
  { id: 1, name: 'John Doe', course: 'Mathematics', grade: 'A' },
  { id: 2, name: 'Jane Smith', course: 'Physics', grade: 'B' },
  { id: 3, name: 'Alice Johnson', course: 'Chemistry', grade: 'A-' },
  { id: 4, name: 'Bob Brown', course: 'Biology', grade: 'B+' },
  { id: 5, name: 'Charlie Davis', course: 'Computer Science', grade: 'A+' },
]

export default function Home() {
  const [kurskod, setKurskod] = useState<string>('')
  const [uppgift, setUppgift] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [data, setData] = useState<StudentData[]>(initialData)
  const [editedData, setEditedData] = useState<StudentData[]>(initialData)

  const handleGetData = async (): Promise<void> => {
    if (!kurskod.trim()) {
      alert('Please enter a kurskod')
      return
    }
    if (!uppgift.trim()) {
      alert('Please enter an uppgift')
      return
    }

    setIsFetching(true)
    try {
      // This will be replaced with actual MySQL query later
      // Example query: SELECT * FROM students WHERE kurskod = ? AND uppgift = ?
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Simulate filtered data based on kurskod
      const filteredData = initialData.filter(item => item.id === parseInt(kurskod) || item.id % 2 === 0)
      setData(filteredData)
      setEditedData(filteredData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error fetching data. Please try again.')
    } finally {
      setIsFetching(false)
    }
  }

  const handleUpdate = (): void => {
    setIsLoading(true)
    // Simulate API call - will be replaced with MySQL UPDATE statement later
    // Example query: UPDATE students SET name = ?, course = ?, grade = ? WHERE kurskod = ? AND uppgift = ?
    setTimeout(() => {
      setData(editedData)
      setIsLoading(false)
    }, 1000)
  }

  const handleSendToLadok = (): void => {
    alert(`Sending data with kurskod: ${kurskod} and uppgift: ${uppgift}`)
  }

  const handleCellEdit = (id: number, field: keyof StudentData, value: string) => {
    setEditedData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: value } : row
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
                <Input
                  type="text"
                  placeholder="uppgift"
                  value={uppgift}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUppgift(e.target.value)}
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
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Grade</TableHead>
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
                          No data found for this kurskod and uppgift
                        </TableCell>
                      </TableRow>
                    ) : (
                      editedData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>
                            <Input
                              value={row.name}
                              onChange={(e) => handleCellEdit(row.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.course}
                              onChange={(e) => handleCellEdit(row.id, 'course', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.grade}
                              onChange={(e) => handleCellEdit(row.id, 'grade', e.target.value)}
                            />
                          </TableCell>
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
                <Button onClick={handleSendToLadok}>Send to Ladok</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
