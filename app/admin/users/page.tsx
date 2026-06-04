// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, UserX, Eye, Mail, Phone, Loader2, Users as UsersIcon, Crown, AlertCircle } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { adminUsersAPI } from '@/lib/admin-api'
import { useToast } from '@/lib/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [roleChangeDialog, setRoleChangeDialog] = useState<{ userId: string; newRole: string } | null>(null)
  const [updatingRole, setUpdatingRole] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filterRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterRole !== 'all') params.role = filterRole

      const response = await adminUsersAPI.getAll(params)
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: '❌ خطأ',
        description: 'فشل تحميل المستخدمين',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChangeRequest = (userId: string, newRole: string) => {
    setRoleChangeDialog({ userId, newRole })
  }

  const handleRoleChangeConfirm = async () => {
    if (!roleChangeDialog) return

    try {
      setUpdatingRole(true)
      await adminUsersAPI.changeRole(roleChangeDialog.userId, roleChangeDialog.newRole)
      
      toast({ 
        title: '✅ تم التحديث', 
        description: `تم تغيير دور المستخدم إلى "${roleChangeDialog.newRole === 'admin' ? 'مدير' : 'مستخدم'}" بنجاح` 
      })
      
      // تحديث الحالة محلياً لتجنب طلب API جديد
      setUsers(users.map(user => 
        user._id === roleChangeDialog.userId 
          ? { ...user, role: roleChangeDialog.newRole } 
          : user
      ))
    } catch (error: any) {
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || 'فشل تغيير الدور',
        variant: 'destructive',
      })
    } finally {
      setUpdatingRole(false)
      setRoleChangeDialog(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      await adminUsersAPI.delete(userToDelete)
      toast({ 
        title: '✅ تم الحذف', 
        description: 'تم حذف المستخدم بنجاح' 
      })
      setUsers(users.filter(user => user._id !== userToDelete))
    } catch (error: any) {
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || 'فشل حذف المستخدم',
        variant: 'destructive',
      })
    } finally {
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
  )

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'user').length,
  }

  return (
    <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6' dir="rtl">
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
        <div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'>
            إدارة المستخدمين
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
            إجمالي المستخدمين: <span className='font-bold text-primary'>{stats.total}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4'>
        <Card className='border-0 shadow-lg hover:shadow-xl transition-all'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-muted-foreground mb-1 font-semibold'>إجمالي</p>
                <h3 className='text-xl sm:text-2xl font-bold text-blue-600'>{stats.total}</h3>
              </div>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                <UsersIcon className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg hover:shadow-xl transition-all'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-muted-foreground mb-1 font-semibold'>المدراء</p>
                <h3 className='text-xl sm:text-2xl font-bold text-amber-600'>{stats.admins}</h3>
              </div>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg'>
                <Crown className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg hover:shadow-xl transition-all'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm text-muted-foreground mb-1 font-semibold'>العملاء</p>
                <h3 className='text-xl sm:text-2xl font-bold text-green-600'>{stats.customers}</h3>
              </div>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg'>
                <Shield className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='flex-1 relative'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='ابحث باسم، إيميل، أو رقم...'
                className='pr-10 h-10 sm:h-11'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className='w-full sm:w-[180px] h-10 sm:h-11'>
                <SelectValue placeholder='جميع الأدوار' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الأدوار</SelectItem>
                <SelectItem value='user'>👤 مستخدم</SelectItem>
                <SelectItem value='admin'>👑 مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className='border-0 shadow-md'>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <Loader2 className='h-10 w-10 animate-spin text-primary' />
              <p className='text-sm text-muted-foreground'>جاري التحميل...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <UsersIcon className='h-16 w-16 text-muted-foreground/30' />
              <p className='text-muted-foreground font-medium'>لا يوجد مستخدمين</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden lg:block overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/50'>
                      <TableHead className='text-right font-bold'>المستخدم</TableHead>
                      <TableHead className='text-right font-bold'>البريد الإلكتروني</TableHead>
                      <TableHead className='text-right font-bold'>رقم الهاتف</TableHead>
                      <TableHead className='text-center font-bold'>الدور</TableHead>
                      <TableHead className='text-center font-bold'>تاريخ التسجيل</TableHead>
                      <TableHead className='text-left font-bold'>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} className='hover:bg-accent/50'>
                        <TableCell className='text-right'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 ring-2 ring-primary/10'>
                              <AvatarImage src={user.profileImg} />
                              <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                                {user.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-semibold'>{user.name}</p>
                              <p className='text-xs text-muted-foreground'>#{user._id.slice(-6)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center gap-2'>
                            <Mail className='h-4 w-4 text-muted-foreground' />
                            <span className='text-sm'>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          {user.phone ? (
                            <div className='flex items-center gap-2'>
                              <Phone className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm' dir='ltr'>{user.phone}</span>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChangeRequest(user._id, value)}
                          >
                            <SelectTrigger className='w-[130px] mx-auto'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='user'>👤 مستخدم</SelectItem>
                              <SelectItem value='admin'>👑 مدير</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='text-center'>
                          <div className='text-sm'>
                            <p className='font-medium'>
                              {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {new Date(user.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='text-left'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setUserToDelete(user._id)}
                            disabled={user.role === 'admin'}
                            className='hover:bg-destructive/10 hover:text-destructive'
                          >
                            <UserX className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='lg:hidden divide-y'>
                {filteredUsers.map((user) => (
                  <div key={user._id} className='p-4 space-y-3'>
                    <div className='flex items-start gap-3'>
                      <Avatar className='h-12 w-12 ring-2 ring-primary/10'>
                        <AvatarImage src={user.profileImg} />
                        <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold truncate'>{user.name}</p>
                        <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                        {user.phone && (
                          <p className='text-xs text-muted-foreground mt-1' dir='ltr'>
                            📞 {user.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChangeRequest(user._id, value)}
                      >
                        <SelectTrigger className='flex-1 h-9'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='user'>👤 مستخدم</SelectItem>
                          <SelectItem value='admin'>👑 مدير</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setUserToDelete(user._id)}
                        disabled={user.role === 'admin'}
                        className='h-9 w-9'
                      >
                        <UserX className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>

                    <p className='text-xs text-muted-foreground text-center'>
                      انضم في {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!roleChangeDialog} onOpenChange={(open) => !open && setRoleChangeDialog(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-primary mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>تأكيد تغيير الدور</AlertDialogTitle>
              <Shield className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right text-sm">
              هل أنت متأكد من تغيير دور هذا المستخدم إلى{' '}
              <span className="font-bold text-foreground">
                {roleChangeDialog?.newRole === 'admin' ? 'مدير' : 'مستخدم'}
              </span>
              ؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleRoleChangeConfirm}
              disabled={updatingRole}
              className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
            >
              {updatingRole ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري التحديث...
                </>
              ) : (
                'تأكيد'
              )}
            </AlertDialogAction>
            <AlertDialogCancel className='flex-1 sm:flex-none' disabled={updatingRole}>
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-destructive mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>تأكيد الحذف</AlertDialogTitle>
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right text-sm">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 flex-1 sm:flex-none"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel className='flex-1 sm:flex-none'>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}