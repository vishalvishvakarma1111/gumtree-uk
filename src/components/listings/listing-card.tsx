import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/types'
import { timeAgo, formatPrice } from '@/lib/utils'

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="relative aspect-square bg-gray-100">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">
              📷
            </div>
          )}
          {listing.is_urgent && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Urgent
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {listing.title}
          </p>
          <p className="text-base font-bold mt-1" style={{ color: '#e75462' }}>
            {formatPrice(listing.price, listing.price_type)}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {listing.location} · {timeAgo(listing.created_at)}
          </p>
          {listing.condition && listing.condition !== 'good' && (
            <span className="inline-block mt-1.5 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  parts_only: 'Parts Only',
}
