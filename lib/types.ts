// lib/types.ts

// ===== Product =====
export interface Product {
  _id: string
  title: string
  slug: string
  description: string
  quantity: number
  titleEn?: string;     
  descriptionEn?: string;
  sold: number
  price: number
  priceAfterDiscount?: number
  colors?: string[]
  sizes?: string[]
  imageCover: string
  images: string[]
  category: Category
  subcategories?: SubCategory[]
  brand?: Brand
  ratingsAverage: number
  ratingsQuantity: number
  createdAt: string
  updatedAt: string
}

// ===== Category & Brand =====
export interface Category {
  _id: string
  name: string
  slug: string
  image?: string
}

export interface SubCategory {
  _id: string
  name: string
  slug: string
  category: string
}

export interface Brand {
  _id: string
  name: string
  slug: string
  image?: string
}

// ===== Address =====
export interface Address {
  _id: string
  alias: string
  details: string
  phone: string
  city: string
  postalCode: string
}

// ===== Cart =====
export interface CartItem {
  _id: string
  product: Product | string
  quantity: number
  color?: string
  size?: string
  price: number
}

export interface Cart {
  _id: string
  cartItems: CartItem[]
  totalCartPrice: number
  totalPriceAfterDiscount?: number
  user: string
  createdAt: string
  updatedAt: string
}

// ===== Review =====
export interface Review {
  _id: string
  title?: string
  ratings: number
  user: {
    _id: string
    name: string
    image?: string
  }
  product: string
  createdAt: string
  updatedAt: string
}

// ===== User =====
export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  profileImg?: string
  role: string
  active: boolean
  wishlist?: string[]
  addresses?: Address[]
  createdAt?: string
  updatedAt?: string
  passwordChangedAt?: string
  __v?: number
}

// ===== Auth =====
export interface AuthResponse {
  token: string
  data: {
    user: User
  }
}

// ✅ إضافة للبروفايل
export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
}

export interface ChangePasswordData {
  currentPassword: string
  password: string
  passwordConfirm: string
}

// ===== Pagination =====
export interface PaginatedResponse<T> {
  results: number
  paginationResult: {
    currentPage: number
    limit: number
    numberOfPages: number
    next?: number
    prev?: number
  }
  data: T[]
}

// ===== Order =====
export interface Order {
  _id: string
  user: User | string
  cartItems: CartItem[]
  taxPrice?: number
  shippingPrice: number
  totalOrderPrice: number
  paymentMethodType: 'cash' | 'card' | 'fawry'
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    details: string
    phone: string
    city: string
    postalCode: string
  }
  createdAt: string
  updatedAt: string
  __v?: number
}

// ===== Coupon =====
export interface Coupon {
  _id: string
  name: string
  expire: string
  discount: number
}
