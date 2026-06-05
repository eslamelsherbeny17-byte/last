import type React from "react"
import type { Metadata, Viewport } from "next"
import { Cairo, Tajawal, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { AddressProvider } from "@/contexts/AddressContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { OrdersProvider } from "@/contexts/OrdersContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "sonner" 
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
  weight: ["400", "500", "700"],
  preload: false,
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    // جلب الإعدادات من الـ API (وممكن نخليه يعمل كاش لمدة ساعة مثلاً عشان سرعة الموقع)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { 
      next: { revalidate: 3600 } 
    });
    const response = await res.json();
    const settings = response?.data;

    // استخراج البيانات أو استخدام قيم افتراضية قوية لو الإعدادات فاضية
    const siteName = settings?.siteName || "بسمه ستور";
    const description = settings?.description || "متجر إلكتروني متكامل لتسوق أفضل المنتجات بأعلى جودة.";

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`, // هيخلي الصفحات التانية تظهر كده: "عربة التسوق | بسمه ستور"
      },
      description: description,
      keywords: settings?.keywords || [siteName, "تسوق", "متجر", "أونلاين"],
      openGraph: {
        type: "website",
        locale: "ar_EG",
        siteName: siteName,
        title: siteName,
        description: description,
      },
    }
  } catch (error) {
    // في حالة فشل الاتصال بالسيرفر، نرجع بيانات احتياطية عشان الـ SEO ميقعش
    return {
      title: {
        default: "بسمه ستور",
        template: "%s | بسمه ستور",
      },
      description: "متجر إلكتروني متكامل لتسوق أفضل المنتجات.",
    }
  }
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d4af37" },
    { media: "(prefers-color-scheme: dark)", color: "#1a202c" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased transition-colors duration-300",
          cairo.variable,
          tajawal.variable,
          inter.variable,
          cairo.className,
        )}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AddressProvider>
                    <OrdersProvider>
                      
                      {/* ✨ الناف بار والفوتر بقوا هنا، كدة هيفضلوا ثابتين في كل الموقع */}
                      <Navbar />
                      <main className='min-h-screen'>{children}</main>
                      <Footer />
                      
                      <Toaster 
                        position="bottom-right"
                        dir="rtl"
                        richColors={false}
                        closeButton
                        duration={4000}
                        toastOptions={{
                          style: { fontFamily: 'var(--font-cairo)' },
                        }}
                      />
                    </OrdersProvider>
                  </AddressProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}