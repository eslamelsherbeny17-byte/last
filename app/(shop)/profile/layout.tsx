import { ProfileSidebar } from '@/components/profile/ProfileSidebar'

export const metadata = {
  title: 'حسابي - أيمن بشير',
  description: 'إدارة حسابك وطلباتك',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-secondary py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl font-bold mb-8'>حسابي</h1>
        <div className='grid lg:grid-cols-4 gap-8'>
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Main Content */}
          <div className='lg:col-span-3'>{children}</div>
        </div>
      </div>
    </div>
  )
}
