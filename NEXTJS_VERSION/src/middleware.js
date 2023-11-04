import md5 from 'md5'
import { NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request) {

  const room = request.nextUrl.pathname.substring(1)

  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/exproom/${room}`)
    const { exp } = await res.json()

    console.log(res)
    
    if (res.status == 200) {

      if (parseInt(exp) < new Date().getTime()) {
        return NextResponse.next()
      } else {
        console.log("EXP", exp)
        console.log("TIME", new Date().getTime())
        return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_WEB_PORT}/expired`))
      }

    }

    if (res.status == 404) {

      return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_WEB_PORT}/badcode`))

    }

  } catch (e) {
    console.log(e)
    return NextResponse.next()
    //return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/:path((?:[A-Za-z0-9]{3}-){2}[A-Za-z0-9]{3})',
}