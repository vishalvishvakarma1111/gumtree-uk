import Link from 'next/link'

const FOOTER_COLS = [
  {
    title: 'About Us',
    links: [
      { label: 'About Gumtree', href: '/info/about' },
    ],
  },
  {
    title: 'Help & Contact',
    links: [
      { label: 'Help Centre', href: '/info/help' },
      { label: 'Safety', href: '/info/safety' },
      { label: 'Contact Us', href: '/info/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t mt-8" style={{ borderColor: '#2a232e', backgroundColor: '#3c3241' }}>
      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-8">
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4
                className="text-sm font-bold mb-3"
                style={{ color: '#ffffff' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs hover:underline hover:text-white"
                      style={{ color: '#dbdadb' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>

      {/* Legal bar */}
      <div className="border-t py-4 px-4" style={{ borderColor: '#2a232e', backgroundColor: '#2a232e' }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs mb-2" style={{ color: '#dbdadb' }}>
            © Copyright 2000–{new Date().getFullYear()} Gumtree.com Limited. All rights reserved.
          </p>
          <p className="text-xs mb-2" style={{ color: '#dbdadb' }}>
            Gumtree.com Limited is an FCA regulated credit broker not a lender.
            Registered in England and Wales No. 03934849. VAT No. 476 0835 68.
          </p>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#dbdadb' }}>
            <Link href="/info/terms" className="hover:underline hover:text-white">Terms of Use</Link>
            <Link href="/info/privacy" className="hover:underline hover:text-white">Privacy Notice</Link>
            <Link href="/info/cookies" className="hover:underline hover:text-white">Cookies Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
