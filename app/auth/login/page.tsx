// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSignIn, useOAuth } from '@/hooks/useSupabase'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { signIn, loading: signInLoading, error: signInError } = useSignIn()
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useOAuth()

    // Memperbaiki error "implicitly has an 'any' type" dengan React.FormEvent
    const handleEmailLogin = async () => {
        try {
            await signIn(email, password)
            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error('Google login failed:', error)
        }
    }

    const isLoading = signInLoading || googleLoading
    const error = signInError || googleError

    return (
        <div className="min-h-screen flex items-center justify-center p-4 fixed inset-0 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-full max-w-sm">
                <div className="text-center mb-12">
                    <h1 className="text-2xl font-light tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Selamat Datang</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Masuk untuk melanjutkan</p>
                </div>

                <div className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--icon-muted)' }} />
                            <input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                suppressHydrationWarning
                                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--card-background)',
                                    color: 'var(--text-primary)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--background)';
                                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs hover:opacity-80 transition-opacity"
                                style={{ color: 'var(--primary)' }}
                            >
                                Lupa?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--icon-muted)' }} />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                suppressHydrationWarning
                                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--card-background)',
                                    color: 'var(--text-primary)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--background)';
                                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--error)20', color: 'var(--error)' }}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error.message}</span>
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        onClick={handleEmailLogin}
                        disabled={isLoading}
                        suppressHydrationWarning
                        className="w-full py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-inverse)'
                        }}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
                    >
                        {signInLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Memproses...</span>
                            </div>
                        ) : (
                            'Masuk'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" style={{ borderColor: 'var(--border-muted)' }}></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3" style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>atau</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        suppressHydrationWarning
                        className="w-full py-3 rounded-lg border-0 outline-none transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                        style={{
                            backgroundColor: 'var(--card-background)',
                            color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span className="font-medium">Google</span>
                    </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-8">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Belum punya akun?{' '}
                        <Link
                            href="/auth/register"
                            className="font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--primary)' }}
                        >
                            Daftar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}