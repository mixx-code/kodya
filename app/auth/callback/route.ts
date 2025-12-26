// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription)
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
        )
    }

    if (code) {
        const supabase = await createClient()

        try {
            // Exchange code for session
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Auth callback error:', error)
                return NextResponse.redirect(
                    new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
                )
            }
        } catch (error) {
            console.error('Auth callback exception:', error)
            return NextResponse.redirect(
                new URL('/login?error=An unexpected error occurred', request.url)
            )
        }
    }

    // Redirect to dashboard after successful login
    return NextResponse.redirect(new URL('/', request.url))
}