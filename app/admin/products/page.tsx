'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Filter,
  Download,
  Grid3x3,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { adminProductsAPI } from '@/lib/admin-api'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useToast } from '@/lib/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface Product {
  _id: string
  title: string
  titleAr?: string
  description: string
  price: number
  priceAfterDiscount?: number
  quantity: number
  sold: number
  imageCover: string
  category?: { _id: string; name: string } | null
  brand?: { _id: string; name: string } | null
  ratingsAverage: number
  ratingsQuantity: number
  createdAt: string
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {}

      if (sortBy === 'newest') params.sort = '-createdAt'
      if (sortBy === 'oldest') params.sort = 'createdAt'
      if (sortBy === 'price-low') params.sort = 'price'
      if (sortBy === 'price-high') params.sort = '-price'
      if (sortBy === 'name') params.sort = 'title'

      const response = await adminProductsAPI.getAll(params)
      setProducts(response.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المنتجات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setDeleting(true)
    try {
      await adminProductsAPI.delete(productToDelete)
      toast({
        title: '✅ تم الحذف',
        description: 'تم حذف المنتج بنجاح',
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل حذف المنتج',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id))
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.titleAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>المنتجات</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            إدارة منتجات المتجر ({products.length} منتج)
          </p>
        </div>
        <Link href='/admin/products/new' className='w-full sm:w-auto'>
          <Button className='w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'>
            <Plus className='ml-2 h-4 w-4' />
            إضافة منتج جديد
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='البحث عن منتج...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-10'
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-full md:w-[200px]'>
                <SelectValue placeholder='ترتيب حسب' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>الأحدث</SelectItem>
                <SelectItem value='oldest'>الأقدم</SelectItem>
                <SelectItem value='price-low'>السعر: من الأقل</SelectItem>
                <SelectItem value='price-high'>السعر: من الأعلى</SelectItem>
                <SelectItem value='name'>الاسم</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle - Hidden on Mobile */}
            <div className='hidden md:flex gap-1 border rounded-lg p-1'>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('table')}
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg md:text-xl'>جميع المنتجات</CardTitle>
            {selectedProducts.length > 0 && (
              <Badge variant='secondary' className='text-sm'>
                {selectedProducts.length} محدد
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>لا توجد منتجات</p>
            </div>
          ) : viewMode === 'table' ? (
            // Table View (Desktop)
            <div className='hidden md:block overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px] text-right'>
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className='w-[80px] text-right'>الصورة</TableHead>
                    <TableHead className='text-right'>المنتج</TableHead>
                    <TableHead className='text-center'>الفئة</TableHead>
                    <TableHead className='text-center'>السعر</TableHead>
                    <TableHead className='text-center'>الكمية</TableHead>
                    <TableHead className='text-center'>المبيعات</TableHead>
                    <TableHead className='text-center'>التقييم</TableHead>
                    <TableHead className='text-center'>الحالة</TableHead>
                    <TableHead className='text-left'>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className='text-right'>
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={() => handleSelectProduct(product._id)}
                        />
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='relative w-16 h-16 rounded-lg overflow-hidden bg-secondary'>
                          <Image
                            src={getImageUrl(product.imageCover)}
                            alt={product.title}
                            fill
                            className='object-cover'
                          />
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='font-medium'>{product.titleAr || product.title}</div>
                        <div className='text-sm text-muted-foreground line-clamp-1'>
                          {product.title}
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        {product.category ? (
                          <Badge variant='secondary'>{product.category.name}</Badge>
                        ) : (
                          <Badge variant='outline'>غير محدد</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-center'>
                        <div className='font-semibold'>
                          {formatPrice(product.priceAfterDiscount || product.price)}
                        </div>
                        {product.priceAfterDiscount && (
                          <div className='text-sm text-muted-foreground line-through'>
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge variant={product.quantity > 10 ? 'default' : 'destructive'}>
                          {product.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>{product.sold || 0}</TableCell>
                      <TableCell className='text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          <span className='text-yellow-500'>★</span>
                          <span className='font-medium'>
                            {product.ratingsAverage?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        {product.quantity > 0 ? (
                          <Badge className='bg-green-500 hover:bg-green-600'>متوفر</Badge>
                        ) : (
                          <Badge variant='destructive'>نفذ</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-left'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='bg-card border shadow-lg'>
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/product/${product._id}`}>
                                <Eye className='ml-2 h-4 w-4' />
                                عرض
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product._id}/edit`}>
                                <Edit className='ml-2 h-4 w-4' />
                                تعديل
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={() => handleDeleteClick(product._id)}
                            >
                              <Trash2 className='ml-2 h-4 w-4' />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {/* Mobile Card View */}
          <div className='md:hidden divide-y'>
            {filteredProducts.map((product) => (
              <div key={product._id} className='p-4 hover:bg-accent/50 transition-colors'>
                <div className='flex gap-3'>
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onCheckedChange={() => handleSelectProduct(product._id)}
                    className='mt-1'
                  />

                  {/* Image */}
                  <div className='relative w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0'>
                    <Image
                      src={getImageUrl(product.imageCover)}
                      alt={product.title}
                      fill
                      className='object-cover'
                    />
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-sm line-clamp-1'>
                      {product.titleAr || product.title}
                    </h3>
                    <p className='text-xs text-muted-foreground line-clamp-1 mb-2'>
                      {product.title}
                    </p>

                    <div className='flex items-center gap-2 flex-wrap mb-2'>
                      <Badge variant='secondary' className='text-xs'>
                        {product.category?.name || 'غير محدد'}
                      </Badge>
                      <Badge variant={product.quantity > 0 ? 'default' : 'destructive'} className='text-xs'>
                        {product.quantity > 0 ? 'متوفر' : 'نفذ'}
                      </Badge>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-bold text-primary text-sm'>
                          {formatPrice(product.priceAfterDiscount || product.price)}
                        </p>
                        {product.priceAfterDiscount && (
                          <p className='text-xs text-muted-foreground line-through'>
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-card'>
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${product._id}`}>
                              <Eye className='ml-2 h-4 w-4' />
                              عرض
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product._id}/edit`}>
                              <Edit className='ml-2 h-4 w-4' />
                              تعديل
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDeleteClick(product._id)}
                          >
                            <Trash2 className='ml-2 h-4 w-4' />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              لن تتمكن من التراجع عن هذا الإجراء. سيتم حذف المنتج نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}