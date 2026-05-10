import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { timeAgo } from '@/lib/utils'
import type { Listing } from '@/types'

interface UserProfile {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  location: string
  reply_rate: number
  created_at: string
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, name, avatar_url, bio, location, reply_rate, created_at')
    .eq('id', id)
    .maybeSingle<UserProfile>()

  if (!profile) notFound()

  const { data: listingsRaw } = await supabase
    .from('listings')
    .select('*, categories(*), user_profiles(*)')
    .eq('user_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(60)

  const listings = (listingsRaw ?? []) as Listing[]

  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall')
    .eq('reviewee_id', id)

  const reviewCount = reviews?.length ?? 0
  const avgRating = reviewCount > 0
    ? (reviews!.reduce((sum, r) => sum + r.overall, 0) / reviewCount).toFixed(1)
    : null

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-6 mb-6 flex gap-5 items-start" style={{ borderColor: '#dbdadb' }}>
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: '#0D475C' }}>
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
            ) : (
              profile.name.slice(0, 1).toUpperCase() || '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>{profile.name}</h1>
            <div className="flex flex-wrap gap-3 items-center mt-2 text-xs text-gray-500">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>
              )}
              <span>Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
              <span>Reply rate: {profile.reply_rate}%</span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                  {avgRating} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
            {profile.bio && <p className="text-sm text-gray-600 mt-3">{profile.bio}</p>}
          </div>
        </div>

        <h2 className="text-base font-extrabold mb-3" style={{ color: '#0D475C' }}>
          Active ads {listings.length > 0 && <span className="text-sm font-normal text-gray-400">({listings.length})</span>}
        </h2>

        {listings.length === 0 ? (
          <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
            <p className="text-sm text-gray-400">No active ads from this user.</p>
            <Link href="/browse" className="text-sm font-semibold mt-4 inline-block" style={{ color: '#e75462' }}>
              Browse all ads
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {reviewCount > 0 && (
          <p className="text-xs text-gray-400 mt-6 text-center">
            Last review {timeAgo(new Date().toISOString())}
          </p>
        )}
      </div>
    </div>
  )
}
