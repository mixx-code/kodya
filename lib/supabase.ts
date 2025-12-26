// lib/supabase.ts
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// URL dan Key dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validasi environment variables
if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Type untuk options Supabase
export type SupabaseOptions = SupabaseClientOptions<'public'>

// Type untuk getSupabase function options
export interface GetSupabaseOptions {
    accessToken?: string
    persistSession?: boolean
    autoRefreshToken?: boolean
    detectSessionInUrl?: boolean
    headers?: Record<string, string>
}

// Buat Supabase client dengan tipe Database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
})

// Helper function untuk mendapatkan Supabase client (SSR/SSG)
export const getSupabase = (options?: GetSupabaseOptions): ReturnType<typeof createClient<Database>> => {
    const baseOptions: SupabaseOptions = {
        auth: {
            persistSession: options?.persistSession ?? false,
            autoRefreshToken: options?.autoRefreshToken ?? false,
            detectSessionInUrl: options?.detectSessionInUrl ?? false,
        }
    }

    if (options?.accessToken) {
        baseOptions.global = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${options.accessToken}`,
                ...options.headers,
            }
        }
    } else if (options?.headers) {
        baseOptions.global = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        }
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, baseOptions)
}

// Helper untuk mendapatkan admin client (menggunakan service role key)
export const getAdminSupabase = (): ReturnType<typeof createClient<Database>> => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    })
}

// Type untuk Supabase client
export type SupabaseClient = typeof supabase

// Utility types untuk query responses
export interface QueryResult<T> {
    data: T | null
    error: Error | null
    status: number
    statusText: string
}

export type SingleResult<T> = QueryResult<T>
export type ListResult<T> = QueryResult<T[]>
export interface CountResultData {
    count: number
}
export type CountResult = QueryResult<CountResultData>

// Type untuk error dari Supabase
export interface SupabaseError {
    message: string
    details?: string
    hint?: string
    code?: string
}

// Utility functions untuk error handling
export const handleSupabaseError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error
    }

    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>
        if (err.message && typeof err.message === 'string') {
            return new Error(err.message)
        }
        if (err.error && typeof err.error === 'string') {
            return new Error(err.error)
        }
    }

    return new Error('An unknown error occurred')
}

// Utility untuk memastikan response konsisten
export const formatResponse = <T>(
    data: T | null,
    error: unknown = null,
    status: number = error ? 400 : 200,
    statusText: string = error ? 'Error' : 'Success'
): QueryResult<T> => {
    return {
        data,
        error: error ? handleSupabaseError(error) : null,
        status,
        statusText,
    }
}