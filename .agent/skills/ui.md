# UI Components & Styling

## Design System

### Colors (Tailwind classes)
- **Primary**: `green-600` (Gumtree brand green)
- **Primary hover**: `green-700`
- **Secondary**: `gray-100` backgrounds
- **Text primary**: `gray-900`
- **Text secondary**: `gray-500`
- **Border**: `gray-200`
- **Danger**: `red-500`
- **Success**: `green-500`
- **Warning**: `amber-500`

### Typography
- Page title: `text-2xl font-bold text-gray-900`
- Section heading: `text-lg font-semibold text-gray-900`
- Body: `text-sm text-gray-700`
- Muted: `text-sm text-gray-500`
- Price: `text-xl font-bold text-green-600`

---

## Core Components

### Button
```tsx
// Primary
<button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Post Ad
</button>

// Secondary
<button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Cancel
</button>

// Danger
<button className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  Delete
</button>
```

### Input
```tsx
<input
  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  placeholder="Search..."
/>
```

### Card
```tsx
<div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

### Badge
```tsx
// Condition
<span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">New</span>
// Urgent
<span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">⚡ Urgent</span>
// Free
<span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Free</span>
```

---

## Page Layouts

### Main layout (Header + Content + Footer)
```tsx
// src/app/(main)/layout.tsx
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

### Two-column browse layout
```tsx
<div className="flex gap-6">
  <aside className="w-64 flex-shrink-0">
    {/* Filters sidebar */}
  </aside>
  <div className="flex-1 min-w-0">
    {/* Results grid */}
  </div>
</div>
```

### Listing grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {listings.map(l => <ListingCard key={l.id} listing={l} />)}
</div>
```

---

## ListingCard Component
```tsx
export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={listing.images[0] ?? '/placeholder.jpg'}
            alt={listing.title}
            fill
            className="object-cover"
          />
          {listing.is_urgent && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              Urgent
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">{listing.title}</p>
          <p className="text-base font-bold text-green-600 mt-1">
            {listing.price_type === 'free' ? 'Free' : listing.price ? `$${listing.price}` : 'Price on ask'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{listing.location} · {timeAgo(listing.created_at)}</p>
        </div>
      </div>
    </Link>
  )
}
```

---

## Header Component
```tsx
// Always includes:
// - Logo (green "G" mark + "GumTree Clone")
// - Search bar (desktop)
// - Location selector
// - "Post Ad" CTA button (green)
// - Auth: Login/Register OR user avatar + dropdown
```

## Category Grid (Homepage)
```tsx
const CATEGORIES = [
  { name: 'Cars & Vehicles', icon: '🚗', slug: 'cars' },
  { name: 'Property', icon: '🏠', slug: 'property' },
  { name: 'Jobs', icon: '💼', slug: 'jobs' },
  { name: 'Electronics', icon: '📱', slug: 'electronics' },
  { name: 'Home & Garden', icon: '🌿', slug: 'home-garden' },
  { name: 'Pets', icon: '🐾', slug: 'pets' },
  { name: 'Fashion', icon: '👗', slug: 'fashion' },
  { name: 'Sport & Fitness', icon: '⚽', slug: 'sport' },
  { name: 'Kids & Baby', icon: '🧸', slug: 'kids' },
  { name: 'Community', icon: '🤝', slug: 'community' },
  { name: 'Services', icon: '🔧', slug: 'services' },
  { name: 'Other', icon: '📦', slug: 'other' },
]
```

---

## Form Patterns

### Post Ad form sections
1. Category picker (full-width grid of categories)
2. Ad details (title, description + AI generate button, price, condition)
3. Photos (drag-drop upload, reorder, max 10)
4. Location (text input with suburb suggestions)
5. Options (shipping toggle, urgent toggle)
6. Preview + Publish

### AI Generate button style
```tsx
<button
  onClick={handleGenerate}
  disabled={loading}
  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
>
  {loading ? <Spinner size="sm" /> : <SparklesIcon className="w-4 h-4" />}
  {loading ? 'Generating...' : 'Generate with AI'}
</button>
```

---

## Responsive Breakpoints
- Mobile first: base styles = mobile
- `md:` = 768px+ (tablet)
- `lg:` = 1024px+ (desktop)
- Filter sidebar: hidden on mobile, shown as sheet/drawer; visible on `lg:`
- Listing grid: 2 cols mobile → 3 cols tablet → 4 cols desktop