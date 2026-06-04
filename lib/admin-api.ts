import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

console.log('🌐 Admin API Base URL:', API_BASE_URL)

const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ==================== INTERCEPTORS ====================

// Request interceptor
adminAPI.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token') || localStorage.getItem('token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
adminAPI.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
    })

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        Cookies.remove('token')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        if (!window.location.pathname.includes('/admin/login')) {
            window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ==================== HELPERS ====================

function logFormData(formData: FormData) {
  console.log('📤 FormData Uploading...')
}

function normalizeResponse(response: any) {
  if (response.data?.data) {
    return response.data
  }
  if (response.data) {
    return { data: response.data }
  }
  return { data: response }
}

// ==================== DASHBOARD API ====================
export const adminDashboardAPI = {
  getStats: async () => {
    try {
      const response = await adminAPI.get('/admin/dashboard/stats')
      return response.data?.data || response.data
    } catch (error: any) {
      console.error('Stats error:', error)
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        trends: {
          revenue: { value: 0, isPositive: true },
          orders: { value: 0, isPositive: true },
          products: { value: 0, isPositive: true },
          users: { value: 0, isPositive: true },
        },
      }
    }
  },

  getRecentOrders: async (limit: number = 5) => {
    try {
      const response = await adminAPI.get('/orders', {
        params: { limit, sort: '-createdAt' },
      })
      return normalizeResponse(response)
    } catch (error) {
      return { data: [] }
    }
  },

  getTopProducts: async (limit: number = 5) => {
    try {
      const response = await adminAPI.get('/products', {
        params: { limit, sort: '-sold' },
      })
      return normalizeResponse(response)
    } catch (error) {
      return { data: [] }
    }
  },
}

// ==================== PRODUCTS API ====================
export const adminProductsAPI = {
  getAll: async (params?: any) => {
    const response = await adminAPI.get('/products', { params })
    return normalizeResponse(response)
  },

  getById: async (id: string) => {
    const response = await adminAPI.get(`/products/${id}`)
    return normalizeResponse(response).data
  },

  create: async (formData: FormData) => {
    const response = await adminAPI.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  update: async (id: string, formData: FormData) => {
    const response = await adminAPI.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/products/${id}`)
    return response.data
  },
}

// ==================== CATEGORIES API ====================
export const adminCategoriesAPI = {
  getAll: async () => {
    const response = await adminAPI.get('/categories')
    return normalizeResponse(response)
  },

  create: async (data: FormData) => {
    const response = await adminAPI.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  update: async (id: string, data: FormData) => {
    const response = await adminAPI.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/categories/${id}`)
    return response.data
  },
}

// ==================== SUBCATEGORIES API ====================
export const adminSubCategoriesAPI = {
  getAll: async () => {
    const response = await adminAPI.get('/subcategories')
    return normalizeResponse(response)
  },

  getByCategoryId: async (categoryId: string) => {
    const response = await adminAPI.get(`/categories/${categoryId}/subcategories`)
    return normalizeResponse(response)
  },

  create: async (data: FormData) => {
    const response = await adminAPI.post('/subcategories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  update: async (id: string, data: FormData) => {
    const response = await adminAPI.put(`/subcategories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/subcategories/${id}`)
    return response.data
  },
}

// ==================== BRANDS API ====================
export const adminBrandsAPI = {
  getAll: async () => {
    const response = await adminAPI.get('/brands')
    return normalizeResponse(response)
  },

  create: async (data: FormData) => {
    const response = await adminAPI.post('/brands', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  update: async (id: string, data: FormData) => {
    const response = await adminAPI.put(`/brands/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/brands/${id}`)
    return response.data
  },
}

// ==================== ORDERS API ====================
export const adminOrdersAPI = {
  getAll: async (params?: any) => {
    const response = await adminAPI.get('/orders', { params })
    return normalizeResponse(response)
  },

  getById: async (id: string) => {
    const response = await adminAPI.get(`/orders/${id}`)
    return normalizeResponse(response).data; 
  },

  updateStatus: async (id: string, status: string) => {
    const response = await adminAPI.put(`/orders/${id}`, { status })
    return normalizeResponse(response)
  },

  updatePaidStatus: async (id: string) => {
    const response = await adminAPI.put(`/orders/${id}`, { isPaid: true })
    return normalizeResponse(response)
  },

  updateDeliveredStatus: async (id: string) => {
    const response = await adminAPI.put(`/orders/${id}`, { isDelivered: true })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/orders/${id}`)
    return response.data
  },
}

// ==================== USERS API ====================
export const adminUsersAPI = {
   getAll: async (params?: any) => {
    const response = await adminAPI.get('/users', { params })
    return normalizeResponse(response)
  },

  getById: async (id: string) => {
    const response = await adminAPI.get(`/users/${id}`)
    return normalizeResponse(response).data
  },

  update: async (id: string, data: any) => {
    const response = await adminAPI.put(`/users/${id}`, data)
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/users/${id}`)
    return response.data
  },

  changeRole: async (id: string, role: string) => {
    const response = await adminAPI.put(`/users/${id}`, { role })
    return normalizeResponse(response)
  },
}

// ==================== REVIEWS API ====================
export const adminReviewsAPI = {
  getAll: async (params?: any) => {
    const response = await adminAPI.get('/reviews', { params })
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/reviews/${id}`)
    return response.data
  },

  approve: async (id: string) => {
    const response = await adminAPI.put(`/reviews/${id}/approve`)
    return normalizeResponse(response)
  },
}

// ==================== COUPONS API ====================
export const adminCouponsAPI = {
  getAll: async (params?: any) => {
    const response = await adminAPI.get('/coupons', { params })
    return normalizeResponse(response)
  },

  getById: async (id: string) => {
    const response = await adminAPI.get(`/coupons/${id}`)
    return normalizeResponse(response).data
  },

  create: async (data: any) => {
    const response = await adminAPI.post('/coupons', data)
    return normalizeResponse(response)
  },

  update: async (id: string, data: any) => {
    const response = await adminAPI.put(`/coupons/${id}`, data)
    return normalizeResponse(response)
  },

  delete: async (id: string) => {
    const response = await adminAPI.delete(`/coupons/${id}`)
    return response.data
  },
}

// ==================== SETTINGS API ====================
export const adminSettingsAPI = {
  get: async () => {
    const response = await adminAPI.get('/settings')
    return normalizeResponse(response)
  },

  update: async (data: any) => {
    const response = await adminAPI.put('/settings', data)
    return normalizeResponse(response)
  },
}

export default adminAPI