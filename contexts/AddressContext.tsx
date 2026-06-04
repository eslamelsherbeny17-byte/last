// contexts/AddressContext.tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { addressesAPI } from '@/lib/api'
import { useAuth } from './AuthContext'

interface Address {
  _id: string
  alias: string
  details: string
  phone: string
  city: string
  postalCode: string
}

interface AddressContextType {
  addresses: Address[]
  loading: boolean
  addAddress: (address: any) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  updateAddress: (id: string, address: any) => Promise<void>
  refreshAddresses: () => Promise<void>
}

const AddressContext = createContext<AddressContextType | undefined>(undefined)

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      refreshAddresses()
    }
  }, [isAuthenticated])

  const refreshAddresses = async () => {
    try {
      setLoading(true)
      const data = await addressesAPI.getAll()
      setAddresses(data)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAddress = async (address: any) => {
    await addressesAPI.add(address)
    await refreshAddresses()
  }

  const deleteAddress = async (id: string) => {
    await addressesAPI.delete(id)
    setAddresses(addresses.filter((addr) => addr._id !== id))
  }

  const updateAddress = async (id: string, address: any) => {
    await addressesAPI.update(id, address)
    await refreshAddresses()
  }

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        addAddress,
        deleteAddress,
        updateAddress,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export const useAddresses = () => {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddresses must be used within AddressProvider')
  }
  return context
}
