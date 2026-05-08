import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f1f1' }}>
      {/* Minimal header */}
      <header className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-sm"
              style={{ backgroundColor: '#e75462' }}
            >
              G
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: '#0D475C' }}>
              Gumtree
            </span>
          </Link>
          <div className="text-xs text-gray-400 hidden sm:block">
            The UK&apos;s #1 classifieds site
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Gumtree.com Limited. All rights reserved.
      </footer>
    </div>
  )
}
