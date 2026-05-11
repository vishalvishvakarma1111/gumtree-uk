import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { Listing } from '@/types'
import { timeAgo, formatPrice } from '@/lib/utils'
import { WatchlistButton } from './watchlist-button'

interface Props {
  listing: Listing
  variant?: 'grid' | 'list'
}

const PRICE_GREEN = '#15803d'

export function ListingCard({ listing, variant = 'grid' }: Props) {
  if (variant === 'list') {
    return (
      <div className="relative bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: '#dbdadb' }}>
        <Link href={`/listings/${listing.id}`} className="flex">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 flex-shrink-0">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-3xl">📷</div>
            )}
            {listing.is_urgent && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Urgent
              </span>
            )}
          </div>
          <div className="p-3 pr-14 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{listing.title}</h3>
            <p className="text-lg font-extrabold mt-1" style={{ color: PRICE_GREEN }}>
              {formatPrice(listing.price, listing.price_type)}
            </p>
            {listing.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1 truncate">
                <MapPin size={11} className="flex-shrink-0" /> {listing.location}
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock size={11} /> {timeAgo(listing.created_at)}
              </span>
            </div>
          </div>
        </Link>
        <div className="absolute bottom-3 right-3 z-10">
          <WatchlistButton listingId={listing.id} size={16} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col" style={{ borderColor: '#dbdadb' }}>
      <Link href={`/listings/${listing.id}`} className="flex flex-col h-full">
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
          {/* Heart sits on image bottom-right, translated down so half overflows */}
          <div className="absolute right-2 bottom-0 z-10 translate-y-1/2">
            <WatchlistButton listingId={listing.id} />
          </div>
        </div>
        <div className="px-3 pt-5 pb-3 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {listing.title}
          </h3>
          <p className="text-base font-extrabold mt-1" style={{ color: PRICE_GREEN }}>
            {formatPrice(listing.price, listing.price_type)}
          </p>
          <div className="mt-1.5 space-y-0.5 text-xs text-gray-500">
            <p className="flex items-center gap-1 truncate">
              <MapPin size={11} className="flex-shrink-0" /> {listing.location}
            </p>
            <p className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo(listing.created_at)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
