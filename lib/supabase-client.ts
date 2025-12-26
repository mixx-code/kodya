// lib/supabase-client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import type { SupabaseOptions } from './supabase'

export function createClient(customOptions?: SupabaseOptions) {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        customOptions
    )
}