// hooks/useSupabase.ts
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { SupabaseClient } from '@/lib/supabase'
import type { Json } from '@/types/supabase'
import type { User, Session, Provider } from '@supabase/supabase-js'

// Hook untuk Supabase client (tanpa state)
export function useSupabase(): SupabaseClient {
    return createClient()
}

// Hook untuk auth dengan cleanup yang proper
export function useAuth() {
    const [state, setState] = useState<{
        user: User | null
        loading: boolean
        error: Error | null
    }>({
        user: null,
        loading: true,
        error: null,
    })

    const supabase = useSupabase()

    useEffect(() => {
        let mounted = true
        let subscription: { unsubscribe: () => void } | null = null

        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        user: session?.user ?? null,
                        loading: false,
                    }))
                }
            } catch (error) {
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: error instanceof Error ? error : new Error('Auth error'),
                    }))
                }
            }
        }

        initAuth()

        // Setup auth state change listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        user: session?.user ?? null,
                        loading: false,
                    }))
                }
            }
        )

        subscription = authSubscription

        return () => {
            mounted = false
            subscription?.unsubscribe()
        }
    }, [supabase])

    return state
}

// Hook untuk OAuth (Google Login)
export function useOAuth() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const signInWithOAuth = async (provider: Provider = 'google') => {
        setLoading(true)
        setError(null)

        try {
            const redirectTo = `${window.location.origin}/auth/callback`
            console.log('OAuth Redirect URL:', redirectTo) // DEBUG
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('OAuth login failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const signUpWithOAuth = async (provider: Provider = 'google') => {
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?action=signup`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('OAuth registration failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }


    const signInWithGoogle = () => signInWithOAuth('google')
    const signUpWithGoogle = () => signUpWithOAuth('google')

    return {
        signInWithGoogle,
        signInWithOAuth,
        signUpWithGoogle,
        signUpWithOAuth,
        loading,
        error,
    }
}

// Hook untuk mendapatkan session
export function useSession() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const supabase = useSupabase()

    useEffect(() => {
        let mounted = true

        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (mounted) {
                setSession(data.session)
                setLoading(false)
            }
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, newSession: Session | null) => {
                if (mounted) {
                    setSession(newSession)
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    return { session, loading }
}

// Hook untuk sign in dengan email/password
export function useSignIn() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const signIn = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Sign in failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { signIn, loading, error }
}

// Hook untuk sign up dengan email/password
export function useSignUp() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const signUp = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `https://ppujrcixcibvfrcmxjxr.supabase.co/auth/v1/callback`,
                },
            })

            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Sign up failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { signUp, loading, error }
}

// Hook untuk sign out
export function useSignOut() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const signOut = async () => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Sign out failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { signOut, loading, error }
}

// Hook untuk reset password
export function useResetPassword() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const resetPassword = async (email: string) => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            })

            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Password reset failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { resetPassword, loading, error }
}

// Hook untuk update password
export function useUpdatePassword() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    const updatePassword = async (newPassword: string) => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Password update failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { updatePassword, loading, error }
}

// Hook untuk update user data
export function useUpdateUser() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const supabase = useSupabase()

    // Type untuk user metadata menggunakan Json dari types/supabase.ts
    interface UpdateUserData {
        email?: string
        password?: string
        data?: Record<string, Json>
    }

    const updateUser = async (data: UpdateUserData) => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser(data)
            if (error) throw error
        } catch (err) {
            const error = err instanceof Error ? err : new Error('User update failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { updateUser, loading, error }
}