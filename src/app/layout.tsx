import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Navbar } from '../components/navbar/Navbar'
import { Footer } from '../components/footer/Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/components/AuthProvider/AuthProvider'

const roboto = Roboto({ subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'Formflow Platform',
  description: 'A full-stack platform for authenticated, validated workflow experiences.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className='container'>
              <Navbar />
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
