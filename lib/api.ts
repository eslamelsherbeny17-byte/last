import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type {
  Product,
  Category,
  SubCategory,
  Cart,
  Review,
  AuthResponse,
  PaginatedResponse,
  Brand,
  User,
  UpdateUserData,
  ChangePasswordData,
  Address,
} from './types'

const API_BASE_URL =
   '/api'

interface ProductQueryParams {
  page?: number
  limit?: number
  sort?: string
  category?: string | string[]
  subcategory?: string
  brand?: string | string[]
  priceMin?: number
  priceMax?: number
  keyword?: string
  [key: string]: any
}

/** ========= Token helpers (single source of truth) ========= */
const TOKEN_KEY = 'token'
const COOKIE_TOKEN_KEY = 'token'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('user')

  // امسح cookie token (بدون js-cookie لأننا داخل lib عام)
  document.cookie = `${COOKIE_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

/** ========= Axios instance ========= */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/** ========= Request interceptor ========= */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      // تأكد إن headers موجودة
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** ========= Response interceptor ========= */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status
      const currentPath = window.location.pathname

      const isAuthPage =
        currentPath.startsWith('/login') ||
        currentPath.startsWith('/signup') ||
        currentPath.startsWith('/admin/login')

      const requestUrl = error.config?.url || ''

      // Endpoints auth (لما تفشل ما نعملش redirect تلقائي)
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/signup') ||
        requestUrl.includes('/auth/forgotPassword') ||
        requestUrl.includes('/auth/resetPassword') ||
        requestUrl.includes('/auth/verifyResetCode')

      if (status === 401) {
        clearAuthStorage()

        // redirect فقط لو مش على صفحات auth ومش endpoint auth
        if (!isAuthPage && !isAuthEndpoint) {
          window.location.replace('/login')
        }
      }
    }

    return Promise.reject(error)
  }
)

// ==================== PRODUCTS API ====================

 export const productsAPI = {
  getAll: async (params?: ProductQueryParams) => {
    const cleanParams: any = { ...params }

    if (cleanParams.priceMin !== undefined) {
      cleanParams['price[gte]'] = cleanParams.priceMin
      delete cleanParams.priceMin
    }
    if (cleanParams.priceMax !== undefined) {
      cleanParams['price[lte]'] = cleanParams.priceMax
      delete cleanParams.priceMax
    }

    // ✨✨ التصحيح هنا: يجب تمرير params داخل كائن { params: ... }
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params: cleanParams,
      paramsSerializer: { indexes: null }, // مهم للفلاتر المتعددة
    })
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: Product }>(`/products/${id}`)
    return response.data.data
  },

  // ✅ التعديل هنا لتجنب 404
  getReviews: async (productId: string) => {
    const response = await api.get<PaginatedResponse<Review>>('/reviews', {
      params: { productId }
    })
    return response.data.data || []
  },
}

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get<{ results: number; data: Category[] }>(
      '/categories'
    )
    return response.data.data
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: Category }>(`/categories/${id}`)
    return response.data.data
  },
  getSubCategories: async (categoryId?: string) => {
    const url = categoryId
      ? `/categories/${categoryId}/subcategories`
      : '/subcategories'
    const response = await api.get<{ results: number; data: SubCategory[] }>(
      url
    )
    return response.data.data
  },
}

// ==================== BRANDS API ====================
export const brandsAPI = {
  getAll: async () => {
    const response = await api.get<{ results: number; data: Brand[] }>(
      '/brands'
    )
    return response.data.data
  },
}

// ==================== AUTH API ====================
export const authAPI = {
  signup: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/signup', data)
    return response.data
  },

  login: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgotPassword', data)
    return response.data
  },

  verifyPassResetCode: async (data: { resetCode: string }) => {
    const response = await api.post('/auth/verifyResetCode', data)
    return response.data
  },

  resetPassword: async (data: { email: string; newPassword: string }) => {
    const response = await api.put('/auth/resetPassword', data)
    return response.data
  },

  logout: async () => {
    clearAuthStorage()
    return true
  },
}

// ==================== USERS API ====================
export const usersAPI = {
  getMe: async () => {
    const response = await api.get<{ status: number; data: User }>(
      '/users/getMe'
    )
    return response.data.data
  },

  updateMe: async (data: UpdateUserData) => {
    const response = await api.put<{ status: number; data: User }>(
      '/users/updateMe',
      data
    )
    return response.data.data
  },

  changeMyPassword: async (data: ChangePasswordData) => {
    const response = await api.put<{ status: number; token: string; data: User }>(
      '/users/changeMyPassword',
      data
    )
    return response.data
  },

  deleteMe: async () => {
    const response = await api.delete('/users/deleteMe')
    return response.data
  },
}

// ==================== CART API ====================
export const cartAPI = {
  get: async () => {
    const response = await api.get<{ data: Cart }>('/cart')
    const cart = response.data.data

    if (
      cart?.cartItems?.length > 0 &&
      typeof (cart.cartItems as any)[0]?.product === 'string'
    ) {
      cart.cartItems = await Promise.all(
        (cart.cartItems as any).map(async (item: any) => {
          const prod = await productsAPI.getById(item.product)
          return { ...item, product: prod }
        })
      )
    }

    return cart
  },

  addItem: async (data: any) => {
    await api.post('/cart', data)
    return cartAPI.get()
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    await api.put(`/cart/${itemId}`, { quantity })
    return cartAPI.get()
  },

  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/${itemId}`)
    return response.data
  },

  clear: async () => {
    const response = await api.delete('/cart')
    return response.data
  },

  applyCoupon: async (coupon: string) => {
    await api.put('/cart/applyCoupon', { coupon })
    return cartAPI.get()
  },
}

// ==================== WISHLIST API ====================
export const wishlistAPI = {
  get: async () => {
    const response = await api.get<{ data: Product[] }>('/wishlist')
    return response.data.data || []
  },
  add: async (productId: string) => {
    const response = await api.post('/wishlist', { productId })
    return response.data.data
  },
  remove: async (productId: string) => {
    const response = await api.delete(`/wishlist/${productId}`)
    return response.data.data
  },
}

// ==================== ORDERS API ====================
export const ordersAPI = {// عدل هذا السطر في lib/api.ts
createCashOrder: async (cartId: string, shippingAddress: any) => {
    // 🎯 أرسل الطلب للمسار الأساسي /orders وليس /orders/cartId
    const response = await api.post(`/orders`, { cartId, shippingAddress })
    return response.data
},
  getUserOrders: async () => {
    const response = await api.get<{ data: any[] }>('/orders')
    return response.data.data || []
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`)
    return response.data.data
  },
  getCheckoutSession: async (cartId: string, shippingAddress: any) => {
    const response = await api.get(`/orders/checkout-session/${cartId}`, {
      params: shippingAddress,
    })
    return response.data
  },
}

// ==================== REVIEWS API ====================
export const reviewsAPI = {
  create: async (data: any) => {
    const response = await api.post('/reviews', data)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/reviews/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  },
  // ✅ التعديل التاني هنا لتجنب 404
  getReviews: async (productId: string) => {
    const response = await api.get<{ data: Review[] }>('/reviews', {
      params: { productId }
    })
    return response.data.data || []
  },
}

// ==================== ADDRESSES API ====================
export const addressesAPI = {
  getAll: async () => {
    const response = await api.get<{ data: Address[] }>('/addresses')
    return response.data.data || []
  },
  add: async (address: any) => {
    const response = await api.post('/addresses', address)
    return response.data.data
  },
  update: async (id: string, address: any) => {
    const response = await api.put(`/addresses/${id}`, address)
    return response.data.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/addresses/${id}`)
    return response.data
  },
}

export default api