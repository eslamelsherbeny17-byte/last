'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

import { authAPI, usersAPI } from '@/lib/api'
import type { User, UpdateUserData, ChangePasswordData } from '@/lib/types'
import { translateError } from '@/lib/error-translator'
import { useLanguage } from '@/contexts/LanguageContext'

type SignupData = {
  name: string
  email: string
  password: string
  passwordConfirm: string
  phone?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string, callbackUrl?: string) => Promise<void>
  signup: (data: SignupData, callbackUrl?: string) => Promise<void>
  logout: (redirectTo?: string) => void

  updateProfile: (data: UpdateUserData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  deleteAccount: () => Promise<void>

  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'token'
const COOKIE_TOKEN_KEY = 'token'

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  Cookies.set(COOKIE_TOKEN_KEY, token, {
    expires: 7,
    path: '/',
    sameSite: 'lax',
  })
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('user')
  Cookies.remove(COOKIE_TOKEN_KEY, { path: '/' })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { t } = useLanguage()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return

      // خلي cookie متزامنة دائمًا مع localStorage
      if (!Cookies.get(COOKIE_TOKEN_KEY)) {
        Cookies.set(COOKIE_TOKEN_KEY, token, { expires: 7, path: '/', sameSite: 'lax' })
      }

      const me = await usersAPI.getMe()
      setUser(me)
    } catch (err) {
      // token فاسد/expired أو getMe فشل
      clearToken()
      setUser(null)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        await checkAuth()
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshUser = async () => {
    try {
      const me = await usersAPI.getMe()
      setUser(me)
    } catch {
      // لو فشل، اعتبره خرج (خصوصًا لو 401)
      clearToken()
      setUser(null)
    }
  }

  const login = async (email: string, password: string, callbackUrl: string = '/') => {
    try {
      const res: any = await authAPI.login({ email, password })
      const token = res?.token
      const userData = res?.data

      if (!token) throw new Error('Missing token from login response')

      setToken(token)
      setUser(userData ?? null)

      toast.success(t('loginSuccess'), { description: t('welcomeBack') })

      // callbackUrl أولى من '/'
      router.replace(callbackUrl || '/')
    } catch (error: any) {
      clearToken()
      setUser(null)

      const backendErrors = error.response?.data?.errors
      const rawMsg =
        backendErrors?.[0]?.msg ??
        error.response?.data?.message ??
        error.message ??
        'حدث خطأ غير متوقع'

      const { title, description } = translateError(rawMsg)
      toast.error(title, { description })

      
    }
  }

  const signup = async (data: SignupData, callbackUrl: string = '/') => {
    try {
      const res: any = await authAPI.signup(data)
      const token = res?.token
      const userData = res?.data

      if (!token) throw new Error('Missing token from signup response')

      setToken(token)
      setUser(userData ?? null)

      toast.success(t('signupSuccess') ?? 'تم إنشاء الحساب بنجاح')

      router.replace(callbackUrl || '/')
    } catch (error: any) {
      clearToken()
      setUser(null)

      const backendErrors = error.response?.data?.errors
      const rawMsg =
        backendErrors?.[0]?.msg ??
        error.response?.data?.message ??
        error.message ??
        'حدث خطأ غير متوقع'

      const { title, description } = translateError(rawMsg)
      toast.error(title, { description })

      
    }
  }

  const logout = (redirectTo: string = '/login') => {
    try {
      // ما تعتمدش على window.location.href داخل authAPI.logout
      // خليه يكون "server logout" لو موجود، لكن هنا إحنا client-side
      authAPI.logout?.()
    } catch {
      // ignore
    } finally {
      clearToken()
      setUser(null)
      toast.success(t('logoutSuccess') ?? 'تم تسجيل الخروج بنجاح')
      router.replace(redirectTo)
    }
  }

  const updateProfile = async (data: UpdateUserData) => {
    try {
      const updatedUser = await usersAPI.updateMe(data)
      setUser(updatedUser)
      toast.success(t('profileUpdated') ?? 'تم تحديث البيانات بنجاح')
    } catch (error: any) {
      const rawMsg = error.response?.data?.message ?? error.message ?? 'فشل تحديث البيانات'
      toast.error(t('error') ?? 'خطأ', { description: rawMsg })
      throw new Error(rawMsg)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const res: any = await usersAPI.changeMyPassword(data)

      // بعض الباك إند بيرجع token جديد بعد تغيير الباسورد
      if (res?.token) setToken(res.token)
      if (res?.data) setUser(res.data)

      toast.success(t('passwordChanged') ?? 'تم تغيير كلمة المرور بنجاح')
    } catch (error: any) {
      const rawMsg = error.response?.data?.message ?? error.message ?? 'فشل تغيير كلمة المرور'
      toast.error(t('error') ?? 'خطأ', { description: rawMsg })
      throw new Error(rawMsg)
    }
  }

  const deleteAccount = async () => {
    try {
      await usersAPI.deleteMe()

      clearToken()
      setUser(null)

      toast.success(t('accountDeleted') ?? 'تم حذف الحساب بنجاح')
      router.replace('/')
    } catch (error: any) {
      const rawMsg = error.response?.data?.message ?? error.message ?? 'فشل حذف الحساب'
      toast.error(t('error') ?? 'خطأ', { description: rawMsg })
      throw new Error(rawMsg)
    }
  }

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated,

      login,
      signup,
      logout,

      updateProfile,
      changePassword,
      deleteAccount,

      refreshUser,
    }),
    [user, loading, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}