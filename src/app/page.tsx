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

interface LadokModule {
  idepok: string
  uppgift: string
}

export default function Home() {
  const [kurskod, setKurskod] = useState<string>('')
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')
  const [assignments, setAssignments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [data, setData] = useState<StudentData[]>(initialData)
  const [editedData, setEditedData] = useState<StudentData[]>(initialData)
  const [ladokModules, setLadokModules] = useState<LadokModule[]>([])
  const [selectedLadokModule, setSelectedLadokModule] = useState<string>('')

  const fetchAssignments = async (kurskod: string) => {
    try {
      const response = await fetch(`/api/students?kurskod=${kurskod}&type=assignments`)
      if (!response.ok) throw new Error('Failed to fetch assignments')
      const assignments = await response.json()
      setAssignments(assignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const fetchLadokModules = async (kurskod: string) => {
    try {
      const response = await fetch(`/api/ladok?kurskod=${kurskod}`)
      if (!response.ok) throw new Error('Failed to fetch Ladok modules')
      const modules = await response.json()
      setLadokModules(modules)
    } catch (error) {
      console.error('Error fetching Ladok modules:', error)
    }
  }

  const handleGetData = async (): Promise<void> => {
    if (!kurskod.trim()) {
      alert('Please enter a kurskod')
      return
    }

    setIsFetching(true)
    try {
      await Promise.all([
        fetchAssignments(kurskod),
        fetchLadokModules(kurskod)
      ])
      const response = await fetch(`/api/students?kurskod=${kurskod}${selectedAssignment ? `&uppgift=${selectedAssignment}` : ''}`)
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

  const handleAssignmentChange = async (value: string) => {
    setSelectedAssignment(value)
    setIsFetching(true)
    try {
      const response = await fetch(`/api/students?kurskod=${kurskod}&uppgift=${value}`)
      if (!response.ok) throw new Error('Failed to fetch data')
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

  const handleSendToLadok = async (): Promise<void> => {
    if (!selectedLadokModule) {
      alert('Please select a Ladok module')
      return
    }

    try {
      const gradesToSend = data.map(student => ({
        stud_namn: student.stud_namn,
        betyg_canvas: student.betyg_canvas,
        modul_id: selectedLadokModule,
        kurskod: kurskod
      }))

      const response = await fetch('/api/ladok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradesToSend)
      })

      if (!response.ok) throw new Error('Failed to send grades to Ladok')
      
      alert('Grades successfully sent to Ladok')
    } catch (error) {
      console.error('Error sending to Ladok:', error)
      alert('Failed to send grades to Ladok')
    }
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
              <div className="flex space-x-4 items-end">
                <div className="space-y-2">
                  <label htmlFor="kurskod" className="text-sm font-medium">
                    Kurskod
                  </label>
                  <Input
                    id="kurskod"
                    type="text"
                    placeholder="kurskod"
                    value={kurskod}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKurskod(e.target.value)}
                    className="max-w-[150px]"
                  />
                </div>
                <Button 
                  onClick={handleGetData} 
                  disabled={isFetching}
                  variant="secondary"
                >
                  {isFetching ? 'Fetching...' : 'Get Data'}
                </Button>
                {assignments.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Uppgift i Canvas
                    </label>
                    <Select
                      value={selectedAssignment}
                      onValueChange={handleAssignmentChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Välj uppgift" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignments.map((assignment) => (
                          <SelectItem key={assignment} value={assignment}>
                            {assignment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {ladokModules.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Modul i Ladok
                    </label>
                    <Select
                      value={selectedLadokModule}
                      onValueChange={setSelectedLadokModule}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Välj modul" />
                      </SelectTrigger>
                      <SelectContent>
                        {ladokModules.map((module) => (
                          <SelectItem key={module.idepok} value={module.idepok}>
                            {module.uppgift}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
