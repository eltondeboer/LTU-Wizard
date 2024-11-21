'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentData } from '@/types/student'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CustomDialog } from "@/components/ui/custom-dialog"

const GRADE_OPTIONS = ["U", "G", "VG"] as const
type Grade = typeof GRADE_OPTIONS[number]

// Update the initial data structure to match the database
const initialData: StudentData[] = []

interface LadokModule {
  idepok: string
  uppgift: string
  kurskod: string
  display: string
}

interface PersonNrMap {
  [key: string]: string
}

interface ValidationErrors {
  [key: string]: Set<string>
}

type RequiredField = 'betyg_canvas' | 'datum' | 'namn'

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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [personNrs, setPersonNrs] = useState<PersonNrMap>({})
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState({ title: '', description: '', isError: false })

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
      const response = await fetch(`/api/epok?kurskod=${kurskod}`)
      if (!response.ok) throw new Error('Failed to fetch Ladok modules')
      const modules = await response.json()
      setLadokModules(modules)
    } catch (error) {
      console.error('Error fetching Ladok modules:', error)
    }
  }

  const fetchPersonNrs = async (studentIds: string[]) => {
    try {
      const response = await fetch('/api/its', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stud_namn: studentIds })
      })
      if (!response.ok) throw new Error('Failed to fetch person numbers')
      const data = await response.json()
      const personNrMap = data.reduce((acc: PersonNrMap, curr: { stud_namn: string, person_nr: string }) => {
        acc[curr.stud_namn] = curr.person_nr
        return acc
      }, {})
      setPersonNrs(personNrMap)
    } catch (error) {
      console.error('Error fetching person numbers:', error)
    }
  }

  const handleGetData = async (): Promise<void> => {
    if (!kurskod.trim()) {
      showDialog('Error', 'Please enter a course code', true)
      return
    }

    setIsFetching(true)
    try {
      // First, try to fetch the data
      const response = await fetch(`/api/students?kurskod=${kurskod}${selectedAssignment ? `&uppgift=${selectedAssignment}` : ''}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const fetchedData = await response.json()

      // Check if any data was found
      if (!fetchedData || fetchedData.length === 0) {
        showDialog('No Data Found', 'Could not find any data with that course number', true)
        setData([])
        setEditedData([])
        setAssignments([])
        setLadokModules([])
        return
      }

      // If we have data, proceed with fetching everything else
      await Promise.all([
        fetchAssignments(kurskod),
        fetchLadokModules(kurskod)
      ])
      
      setData(fetchedData)
      setEditedData(fetchedData)
      
      // Only fetch person numbers if we have student data
      await fetchPersonNrs(fetchedData.map((student: StudentData) => student.stud_namn))
    } catch (error) {
      console.error('Error fetching data:', error)
      showDialog(
        'Error',
        'Error fetching data. Please try again.',
        true
      )
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
      showDialog(
        'Error',
        'Error fetching data. Please try again.',
        true
      )
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

  const handleRowSelect = (stud_namn: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stud_namn)) {
        newSet.delete(stud_namn)
      } else {
        newSet.add(stud_namn)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === editedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(editedData.map(row => row.stud_namn)))
    }
  }

  const handleSelectGraded = () => {
    setSelectedRows(new Set(
      editedData
        .filter(row => row.betyg_canvas)
        .map(row => row.stud_namn)
    ))
  }

  const handleCellEdit = (stud_namn: string, field: keyof StudentData, value: string) => {
    setEditedData(prevData =>
      prevData.map(row =>
        row.stud_namn === stud_namn ? { ...row, [field]: value } : row
      )
    )
  }

  const isFutureDate = (dateStr: string): boolean => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today
    const checkDate = new Date(dateStr)
    checkDate.setHours(12, 0, 0, 0) // Set check date to noon to avoid timezone issues
    return checkDate > today
  }

  const validateRow = (row: StudentData): string[] => {
    const errors: string[] = []
    if (!row.betyg_canvas) errors.push('betyg_canvas')
    if (!row.datum) {
      errors.push('datum')
    } else if (isFutureDate(row.datum)) {
      errors.push('future_date')
    }
    if (!row.namn) errors.push('namn')
    return errors
  }

  const handleSendToLadok = async (): Promise<void> => {
    const newValidationErrors: ValidationErrors = {}
    let hasErrors = false

    // Check for selected rows
    if (selectedRows.size === 0) {
      showDialog('Error', 'Please select at least one student', true)
      return
    }

    // Check Ladok module
    if (!selectedLadokModule) {
      newValidationErrors.ladokModule = new Set(['required'])
      hasErrors = true
    }

    // Validate selected rows
    const selectedStudents = editedData.filter(student => selectedRows.has(student.stud_namn))
    
    selectedStudents.forEach(student => {
      const errors = validateRow(student)
      if (errors.length > 0) {
        newValidationErrors[student.stud_namn] = new Set(errors)
        hasErrors = true
      }
    })

    // Set all validation errors at once
    setValidationErrors(newValidationErrors)

    if (hasErrors) {
      showDialog('Validation Error', 'Please fill in all required fields', true)
      return
    }

    try {
      console.log('Selected students:', selectedStudents)
      console.log('Person numbers:', personNrs)
      
      const gradesToSend = selectedStudents.map(student => {
        const grade = {
          person_nr: personNrs[student.stud_namn],
          namn: student.namn,
          modul_kod: selectedLadokModule,
          betyg: student.betyg_canvas,
          datum: student.datum,
          kurskod: kurskod
        }
        console.log('Preparing grade:', grade)
        return grade
      })

      console.log('Sending grades:', gradesToSend)

      const response = await fetch('/api/ladok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradesToSend)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send grades to Ladok')
      }
      
      showDialog('Success', 'Grades successfully sent to Ladok')
      setValidationErrors({})
    } catch (error) {
      console.error('Detailed error in handleSendToLadok:', error)
      showDialog(
        'Error',
        error instanceof Error ? error.message : 'Failed to send grades to Ladok',
        true
      )
    }
  }

  const showDialog = (title: string, description: string, isError = false) => {
    setDialogMessage({ title, description, isError })
    setDialogOpen(true)
  }

  const handleDateSelect = (stud_namn: string, date: Date | undefined) => {
    if (date) {
      // Adjust the date to handle timezone correctly
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      const dateString = localDate.toISOString().split('T')[0]

      if (isFutureDate(dateString)) {
        showDialog('Invalid Date', 'Cannot select a future date', true)
        setValidationErrors(prev => ({
          ...prev,
          [stud_namn]: new Set([...(prev[stud_namn] || []), 'future_date'])
        }))
        return
      }
      
      handleCellEdit(stud_namn, 'datum', dateString)
      // Clear validation error if it exists
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        if (newErrors[stud_namn]) {
          newErrors[stud_namn].delete('future_date')
          if (newErrors[stud_namn].size === 0) {
            delete newErrors[stud_namn]
          }
        }
        return newErrors
      })
    }
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
                    Course code
                  </label>
                  <Input
                    id="kurskod"
                    type="text"
                    placeholder="course code"
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
                      Assignment in Canvas
                    </label>
                    <Select
                      value={selectedAssignment}
                      onValueChange={handleAssignmentChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Choose assignment" />
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
                      Module in Ladok
                    </label>
                    <Select
                      value={selectedLadokModule}
                      onValueChange={setSelectedLadokModule}
                    >
                      <SelectTrigger 
                        className={cn(
                          "w-[200px]",
                          !selectedLadokModule && 
                          selectedRows.size > 0 && 
                          Object.keys(validationErrors).length > 0 && // Only show red if there are validation errors
                          "border-red-500 ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Choose module" />
                      </SelectTrigger>
                      <SelectContent>
                        {ladokModules.map((module) => (
                          <SelectItem key={module.idepok} value={module.uppgift}>
                            {module.uppgift}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="border rounded-md">
                <div className="p-4 border-b flex space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedRows.size === editedData.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectGraded}
                  >
                    Select Graded
                  </Button>
                  <span className="ml-4 text-sm text-muted-foreground">
                    {selectedRows.size} rows selected
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]" />
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
                        <TableCell colSpan={6} className="text-center">
                          {isFetching ? 'Fetching data...' : 'Saving changes...'}
                        </TableCell>
                      </TableRow>
                    ) : editedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No data found for this kurskod
                        </TableCell>
                      </TableRow>
                    ) : (
                      editedData.map((row) => (
                        <TableRow key={row.stud_namn}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.has(row.stud_namn)}
                              onCheckedChange={() => handleRowSelect(row.stud_namn)}
                            />
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  {row.stud_namn}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Person Nr: {personNrs[row.stud_namn] || 'Loading...'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  {row.namn}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Person Nr: {personNrs[row.stud_namn] || 'Loading...'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[200px] justify-start text-left font-normal truncate",
                                    !row.datum && "text-muted-foreground",
                                    (validationErrors[row.stud_namn]?.has('datum') || 
                                     validationErrors[row.stud_namn]?.has('future_date')) && 
                                    selectedRows.has(row.stud_namn) && 
                                    "border-red-500 ring-red-500"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    {row.datum ? format(new Date(row.datum), "MMMM d, yyyy") : "Pick a date"}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-auto p-0" 
                                align="start"
                                sideOffset={4}
                              >
                                <Calendar
                                  mode="single"
                                  selected={row.datum ? new Date(row.datum) : undefined}
                                  onSelect={(date) => handleDateSelect(row.stud_namn, date)}
                                  initialFocus
                                  className="rounded-md border shadow"
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.betyg_canvas}
                              onValueChange={(value) => handleCellEdit(row.stud_namn, 'betyg_canvas', value)}
                            >
                              <SelectTrigger 
                                className={cn(
                                  "w-[100px]",
                                  validationErrors[row.stud_namn]?.has('betyg_canvas') && 
                                  selectedRows.has(row.stud_namn) && 
                                  "border-red-500 ring-red-500"
                                )}
                              >
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
              <div className="flex space-x-4 items-center">
                <Button 
                  onClick={handleUpdate} 
                  disabled={isLoading || !hasChanges}
                  variant={hasChanges ? "default" : "secondary"}
                >
                  {isLoading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
                <Button 
                  onClick={handleSendToLadok}
                  disabled={isLoading || selectedRows.size === 0}
                >
                  Send to Ladok ({selectedRows.size})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <CustomDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogMessage.title}
        description={dialogMessage.description}
        isError={dialogMessage.isError}
      />
    </div>
  )
}
