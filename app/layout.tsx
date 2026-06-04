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

export const metadata: Metadata = {
  title: {
    default: "Ayman Bashir - Islamic Fashion Store | أيمن بشير - متجر الأزياء الإسلامية",
    template: "%s | Ayman Bashir",
  },
  description:
    "Modern and elegant Islamic fashion store offering abayas, hijabs, and modest clothing | متجر متخصص في الأزياء الإسلامية العصرية والأنيقة - عباءات، حجاب، وملابس محتشمة",
  keywords: [
    "أزياء إسلامية",
    "عباءات",
    "حجاب",
    "ملابس محتشمة",
    "Islamic fashion",
    "abayas",
    "hijabs",
    "modest clothing",
    "Islamic clothing Egypt",
    "Ayman Bashir",
  ],
  authors: [{ name: "Ayman Bashir" }],
  creator: "Ayman Bashir",
  publisher: "Ayman Bashir",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: "Ayman Bashir",
    title: "Ayman Bashir - Islamic Fashion Store",
    description: "Modern and elegant Islamic fashion store",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
                      {children}
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