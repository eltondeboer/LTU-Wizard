import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    console.log('Received auth request')
    console.log('APP_PASSWORD:', process.env.APP_PASSWORD)
    console.log('Received password:', password)

    if (!process.env.APP_PASSWORD) {
      console.error('APP_PASSWORD not set in environment')
      return new NextResponse('Server configuration error', { status: 500 })
    }

    if (password === process.env.APP_PASSWORD) {
      console.log('Password correct, setting cookie')
      
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })

      console.log('Cookie set, returning response')
      return response
    }

    console.log('Invalid password')
    return new NextResponse('Unauthorized', { status: 401 })
  } catch (error) {
    console.error('Auth error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 