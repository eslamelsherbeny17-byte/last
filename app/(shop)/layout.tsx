import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* شلنا الناف بار والفوتر من هنا لأنهم بقوا في الـ RootLayout */}
      {children}
    </>
  )
}
