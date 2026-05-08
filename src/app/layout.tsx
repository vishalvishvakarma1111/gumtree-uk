import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gumtree UK – Free Classifieds',
  description: 'Buy and sell locally across the UK. Find great deals on cars, property, electronics, pets and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
