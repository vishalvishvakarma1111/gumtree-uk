import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'

interface ReviewRow {
  id: string
  overall: number
  communication: number
  reliability: number
  as_described: number
  comment: string | null
  created_at: string
  listing: { id: string; title: string } | null
  reviewer: { id: string; name: string; avatar_url: string | null } | null
}

export default async function MyReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account/reviews')

  const { data } = await supabase
    .from('reviews')
    .select(`
      id, overall, communication, reliability, as_described, comment, created_at,
      listing:listings ( id, title ),
      reviewer:user_profiles!reviews_reviewer_id_fkey ( id, name, avatar_url )
    `)
    .eq('reviewee_id', user.id)
    .order('created_at', { ascending: false })

  const reviews = (data ?? []) as unknown as ReviewRow[]
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.overall, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
          My reviews {reviews.length > 0 && <span className="text-sm font-normal text-gray-400">({reviews.length})</span>}
        </h2>
        {avg && (
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#0D475C' }}>
            <Star size={16} fill="#f59e0b" stroke="#f59e0b" /> {avg} avg
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-4">⭐</p>
          <h3 className="font-bold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-sm text-gray-400">Reviews from buyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl border p-4" style={{ borderColor: '#dbdadb' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#0D475C' }}>
                  {r.reviewer?.name?.slice(0, 1).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900">{r.reviewer?.name ?? 'Anonymous'}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(r.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={14}
                        fill={i <= r.overall ? '#f59e0b' : 'none'}
                        stroke={i <= r.overall ? '#f59e0b' : '#dbdadb'}
                      />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mt-2">{r.comment}</p>}
                  {r.listing && (
                    <Link
                      href={`/listings/${r.listing.id}`}
                      className="text-xs font-semibold mt-2 inline-block hover:underline"
                      style={{ color: '#0D475C' }}
                    >
                      Re: {r.listing.title}
                    </Link>
                  )}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-500">
                    <span>Communication: {r.communication}/5</span>
                    <span>Reliability: {r.reliability}/5</span>
                    <span>As described: {r.as_described}/5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
