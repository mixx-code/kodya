// lib/supabase-server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import type { SupabaseOptions } from './supabase'

export async function createClient(customOptions?: SupabaseOptions) {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll(): { name: string; value: string }[] {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>): void {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore if called from Server Component
                    }
                },
            },
            ...customOptions,
        }
    )
}

// Helper untuk mendapatkan Supabase client di Server Components
export async function getSupabaseServerClient(customOptions?: SupabaseOptions) {
    const supabase = await createClient(customOptions)
    return supabase
}