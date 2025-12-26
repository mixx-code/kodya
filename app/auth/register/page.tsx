// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSignUp, useOAuth } from '@/hooks/useSupabase'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    })
    const [formErrors, setFormErrors] = useState<{
        email?: string
        password?: string
        confirmPassword?: string
        fullName?: string
    }>({})

    const { signUp, loading: signUpLoading, error: signUpError } = useSignUp()
    const { signInWithGoogle, loading: googleLoading, error: googleError, signUpWithGoogle } = useOAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))

        // Clear error when user starts typing
        if (formErrors[id as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [id]: undefined }))
        }
    }

    const validateForm = () => {
        const errors: typeof formErrors = {}

        if (!formData.email) {
            errors.email = 'Email wajib diisi'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Format email tidak valid'
        }

        if (!formData.password) {
            errors.password = 'Password wajib diisi'
        } else if (formData.password.length < 6) {
            errors.password = 'Password minimal 6 karakter'
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Password tidak cocok'
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Nama lengkap wajib diisi'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleEmailRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            await signUp(formData.email, formData.password)
            // Success message will be handled by the hook/supabase
            // User will get confirmation email
            router.push('/login?registered=true')
        } catch (error) {
            console.error('Registration failed:', error)
        }
    }

    const handleGoogleRegister = async () => {
        try {
            await signUpWithGoogle()
        } catch (error) {
            console.error('Google registration failed:', error)
        }
    }

    const isLoading = signUpLoading || googleLoading
    const error = signUpError || googleError

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            {/* Card Container */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Daftar dengan email atau gunakan akun Google Anda
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Register Button */}
                        <button
                            onClick={handleGoogleRegister}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {googleLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Daftar dengan Google
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Atau daftar dengan email</span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleEmailRegister} className="space-y-4">
                            {/* Full Name Field */}
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all`}
                                    />
                                </div>
                                {formErrors.fullName && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {formErrors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all`}
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Minimal 6 karakter"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all`}
                                    />
                                </div>
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {formErrors.password}
                                    </p>
                                )}
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Minimal 6 karakter
                                    </p>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Ketik ulang password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all`}
                                    />
                                </div>
                                {formErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {formErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1"
                                />
                                <label htmlFor="terms" className="text-gray-600">
                                    Saya setuju dengan{' '}
                                    <Link href="/terms" className="text-blue-600 hover:underline">
                                        Syarat Layanan
                                    </Link>{' '}
                                    dan{' '}
                                    <Link href="/privacy" className="text-blue-600 hover:underline">
                                        Kebijakan Privasi
                                    </Link>
                                </label>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p>{error.message}</p>
                                </div>
                            )}

                            {/* Success Message (if redirected from login with registered=true) */}
                            {/* You can add this if you want to show a success message after redirect */}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {signUpLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mendaftarkan...
                                    </>
                                ) : (
                                    'Buat Akun'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col space-y-4">
                    <div className="text-center text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:underline"
                        >
                            Masuk di sini
                        </Link>
                    </div>

                    <div className="text-[10px] text-gray-500 text-center leading-tight">
                        Dengan mendaftar, Anda menyetujui{' '}
                        <Link href="/terms" className="underline hover:text-gray-700">
                            Syarat Layanan
                        </Link>{' '}
                        dan{' '}
                        <Link href="/privacy" className="underline hover:text-gray-700">
                            Kebijakan Privasi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}