import Link from 'next/link'
import { notFound } from 'next/navigation'

type Section = { heading?: string; paragraphs: string[] }
type Article = {
  title: string
  intro: string
  updated: string
  sections: Section[]
}

const CONTENT: Record<string, Article> = {
  about: {
    title: 'About Gumtree',
    intro: 'Gumtree is the UK\'s #1 classifieds site, helping people buy, sell, and connect locally.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'Our story',
        paragraphs: [
          'Founded in 2000, Gumtree began as a noticeboard for newcomers to London and grew into one of the most-visited consumer marketplaces in the United Kingdom.',
          'Today millions of buyers and sellers post listings across cars, property, jobs, services, and second-hand goods — keeping items in circulation and putting money back into communities.',
        ],
      },
      {
        heading: 'What we stand for',
        paragraphs: [
          'We believe in giving things a second life. Every listing posted on Gumtree is a small win for sustainability and a step away from throwaway culture.',
          'We work hard to keep our marketplace safe, transparent, and easy to use — whether you\'re selling a sofa, hiring a plumber, or finding your next car.',
        ],
      },
    ],
  },
  help: {
    title: 'Help Centre',
    intro: 'Answers to common questions about buying, selling, and using Gumtree.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'Posting an ad',
        paragraphs: [
          'Click "Post an ad" in the header, choose a category, fill in the details, add photos, and publish. Your listing is reviewed and goes live within minutes.',
          'You can edit or remove your ad anytime from My Ads in your account.',
        ],
      },
      {
        heading: 'Messaging a seller',
        paragraphs: [
          'Open any listing and use the contact panel to start a conversation. All chats are stored under Messages so you can pick up where you left off.',
          'We strongly recommend keeping conversation on-platform — it gives you a record if anything goes wrong.',
        ],
      },
      {
        heading: 'Reporting a problem',
        paragraphs: [
          'Every listing has a Report button. Use it if you spot a scam, prohibited item, or anything that doesn\'t look right. Our team reviews reports within 24 hours.',
        ],
      },
    ],
  },
  safety: {
    title: 'Safety tips',
    intro: 'Stay safe when buying and selling on Gumtree.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'Meet in a public place',
        paragraphs: [
          'Always meet the other party in a busy, well-lit public location during daylight hours. Train stations, supermarket car parks, and high streets are good choices.',
          'Avoid inviting strangers to your home unless you\'re selling a large item that can\'t reasonably be moved.',
        ],
      },
      {
        heading: 'Never pay in advance',
        paragraphs: [
          'Pay only after you\'ve seen the item in person. Avoid wire transfers, gift cards, or "shipping fees" — these are classic scam patterns.',
          'For high-value items, prefer cash or bank transfer once you\'ve verified the item exists and works.',
        ],
      },
      {
        heading: 'Protect your personal data',
        paragraphs: [
          'Don\'t share your full address, ID, or bank details over chat. A buyer or seller never needs your passport or full account number to complete a sale.',
          'Be wary of links sent in messages — Gumtree will never ask you to pay or log in via a link.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact us',
    intro: 'Get in touch with the Gumtree team.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'Support',
        paragraphs: [
          'For help with your account, listings, or reports, email support@gumtree.example. Most enquiries receive a response within one business day.',
        ],
      },
      {
        heading: 'Trust & Safety',
        paragraphs: [
          'To report a suspicious listing, scam, or safety concern, email safety@gumtree.example or use the Report button on the listing itself.',
        ],
      },
      {
        heading: 'Press',
        paragraphs: [
          'Press and media enquiries: press@gumtree.example.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro: 'These terms govern your use of Gumtree.',
    updated: 'May 2026',
    sections: [
      {
        heading: '1. Acceptance',
        paragraphs: [
          'By creating an account, posting a listing, or otherwise using Gumtree, you agree to be bound by these Terms of Use. If you do not agree, please do not use the service.',
        ],
      },
      {
        heading: '2. Your account',
        paragraphs: [
          'You are responsible for keeping your login details secure and for any activity that takes place under your account. You must be at least 18 years old to register.',
        ],
      },
      {
        heading: '3. Listings',
        paragraphs: [
          'You may only post listings for items or services you have the legal right to sell. Prohibited items include weapons, illegal substances, counterfeit goods, and anything that violates UK law.',
          'We reserve the right to remove any listing at our discretion and to suspend accounts that repeatedly violate these terms.',
        ],
      },
      {
        heading: '4. Conduct',
        paragraphs: [
          'Treat other users with respect. Harassment, hate speech, and fraudulent behaviour will result in immediate account suspension.',
        ],
      },
      {
        heading: '5. Liability',
        paragraphs: [
          'Gumtree is a platform that connects buyers and sellers — we are not party to any transaction. We make no guarantees about the quality, safety, or legality of items listed.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Notice',
    intro: 'How we collect, use, and protect your personal data.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'When you register, we collect your name, email address, and a password. When you post a listing, we collect the listing content and location.',
          'When you use the site, we automatically collect IP address, browser type, and pages visited.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use your data to operate the marketplace, send transactional emails (registration, password recovery, message notifications), and prevent fraud.',
          'We do not sell your personal data to third parties.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can request a copy of your data, update it, or delete your account at any time from the Profile section of your account.',
          'For data requests, contact privacy@gumtree.example.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookies Policy',
    intro: 'How Gumtree uses cookies and similar technologies.',
    updated: 'May 2026',
    sections: [
      {
        heading: 'What is a cookie',
        paragraphs: [
          'A cookie is a small text file that a website stores on your device. We use cookies to keep you signed in, remember your preferences, and understand how the site is used.',
        ],
      },
      {
        heading: 'Cookies we use',
        paragraphs: [
          'Essential cookies keep your session active and the site functioning. Analytics cookies help us measure traffic and improve features. We do not use third-party advertising cookies.',
        ],
      },
      {
        heading: 'Managing cookies',
        paragraphs: [
          'You can clear or block cookies in your browser settings. Disabling essential cookies will prevent you from staying signed in.',
        ],
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(CONTENT).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = CONTENT[slug]
  if (!article) return { title: 'Not found' }
  return { title: `${article.title} — Gumtree` }
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = CONTENT[slug]
  if (!article) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-xs mb-4" style={{ color: '#0D475C' }}>
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5 text-gray-400">/</span>
        <span className="text-gray-500">{article.title}</span>
      </nav>

      <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: '#dbdadb' }}>
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#0D475C' }}>
          {article.title}
        </h1>
        <p className="text-sm text-gray-600 mb-1">{article.intro}</p>
        <p className="text-xs text-gray-400 mb-7">Last updated: {article.updated}</p>

        <div className="space-y-7">
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="text-base font-bold mb-2" style={{ color: '#0D475C' }}>
                  {section.heading}
                </h2>
              )}
              <div className="space-y-3">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-gray-700">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
