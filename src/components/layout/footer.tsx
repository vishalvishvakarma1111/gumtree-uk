import Link from 'next/link'

const FOOTER_COLS = [
  {
    title: 'About Us',
    links: [
      { label: 'About Gumtree', href: '#' },
      { label: 'Gumtree for Business', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Media Advertising', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    title: 'Help & Contact',
    links: [
      { label: 'Help Centre', href: '#' },
      { label: 'Safety', href: '#' },
      { label: 'Policies', href: '#' },
      { label: 'Privacy Notice', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
  {
    title: 'More From Us',
    links: [
      { label: 'Gumtree Lifestyle', href: '#' },
      { label: 'Car Guides', href: '#' },
      { label: 'Car Reviews', href: '#' },
      { label: 'Sell My Car', href: '#' },
    ],
  },
  {
    title: 'Mobile Apps',
    links: [
      { label: 'iOS App', href: '#' },
      { label: 'Android App', href: '#' },
      { label: 'More About Our Apps', href: '#' },
    ],
  },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: 'f' },
  { label: 'Instagram', href: '#', icon: '📷' },
  { label: 'TikTok', href: '#', icon: '♪' },
  { label: 'Twitter', href: '#', icon: '𝕏' },
  { label: 'YouTube', href: '#', icon: '▶' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8" style={{ borderColor: '#dbdadb' ,backgroundColor: '#3c3241'}}>
      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4
                className="text-sm font-bold mb-3"
                style={{ color: '#0D475C' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs hover:underline"
                      style={{ color: '#b1adb3' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#3c3241' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#0D475C' }}>
            Follow us
          </p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(s => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors hover:bg-gray-50"
                style={{ borderColor: '#dbdadb', color: '#0D475C' }}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t py-4 px-4" style={{ borderColor: '#dbdadb', backgroundColor: '#f1f1f1' }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs mb-2" style={{ color: '#b1adb3' }}>
            © Copyright 2000–{new Date().getFullYear()} Gumtree.com Limited. All rights reserved.
          </p>
          <p className="text-xs mb-2" style={{ color: '#b1adb3' }}>
            Gumtree.com Limited is an FCA regulated credit broker not a lender.
            Registered in England and Wales No. 03934849. VAT No. 476 0835 68.
          </p>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#b1adb3' }}>
            {['Terms of Use', 'Privacy Notice', 'Privacy Settings', 'Cookies Policy'].map(item => (
              <Link key={item} href="#" className="hover:underline">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
