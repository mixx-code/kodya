// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // PENTING: Gunakan getUser() untuk keamanan lebih tinggi (menghindari pemalsuan JWT client-side)
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // 1. DAFTAR ROUTE PROTEKSI UMUM (Harus Login)
    // Mencakup cart, checkout, saldo, dan semua halaman admin
    const isCustomerPath = ['/cart', '/checkout', '/saldo'].some(path => pathname.startsWith(path))
    const isAdminPath = ['/dashboard', '/products'].some(path => pathname.startsWith(path))
    
    // 2. DAFTAR ROUTE AUTH (Login/Register)
    const authPaths = ['/login', '/register', '/forgot-password']
    const isAuthPath = authPaths.includes(pathname)

    // --- LOGIKA REDIRECT ---

    // A. Jika akses route Terproteksi (Admin/Customer) tapi BELUM LOGIN
    if ((isCustomerPath || isAdminPath) && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // B. Jika akses route ADMIN tapi BUKAN ADMIN
    if (isAdminPath && user) {
        const role = user.app_metadata?.role // Pastikan di Supabase Auth, user punya metadata role: 'admin'
        
        if (role !== 'admin') {
            // Jika bukan admin, tendang ke home (atau halaman khusus 403)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // C. Jika sudah LOGIN tapi mencoba akses halaman LOGIN/REGISTER
    if (isAuthPath && user) {
        // Jika admin ke dashboard, jika user biasa ke home/profile
        const role = user.app_metadata?.role
        const target = role === 'admin' ? '/dashboard' : '/'
        return NextResponse.redirect(new URL(target, request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Mencocokkan semua request path kecuali:
         * - api (api routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - auth/callback (penting untuk login flow)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public/|auth/callback).*)',
    ],
}