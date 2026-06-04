'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { ordersAPI } from '@/lib/api'
import { useAuth } from './AuthContext'

interface OrdersContextType {
  orders: any[]
  ordersCount: number
  loading: boolean
  refreshOrders: () => Promise<void>
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders()
    } else {
      setOrders([])
    }
  }, [isAuthenticated])

  const refreshOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersAPI.getUserOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        ordersCount: orders.length,
        loading,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}
