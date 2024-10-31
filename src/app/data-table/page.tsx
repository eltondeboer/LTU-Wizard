'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentData {
  id: number
  name: string
  course: string
  grade: string
}

// Mock data - in a real application, this would come from your database
const mockData: StudentData[] = [
  { id: 1, name: 'John Doe', course: 'Mathematics', grade: 'A' },
  { id: 2, name: 'Jane Smith', course: 'Physics', grade: 'B' },
  { id: 3, name: 'Alice Johnson', course: 'Chemistry', grade: 'A-' },
  { id: 4, name: 'Bob Brown', course: 'Biology', grade: 'B+' },
  { id: 5, name: 'Charlie Davis', course: 'Computer Science', grade: 'A+' },
]

export default function DataTablePage(): React.ReactElement {
  const [tentakod, setTentakod] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleUpdate = (): void => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleSendToLadok = (): void => {
    alert(`Sending data with tentakod: ${tentakod}`)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Student Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="tentakod"
              value={tentakod}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTentakod(e.target.value)}
              className="max-w-sm"
            />
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.course}</TableCell>
                        <TableCell>{row.grade}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
              <Button onClick={handleSendToLadok}>Send to Ladok</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 