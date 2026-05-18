import { createServiceClient } from '@/lib/supabase/service'
import BannedWordsClient, { BannedWordRow } from './banned-words-client'

export const dynamic = 'force-dynamic'

export default async function AdminBannedWordsPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('banned_words')
    .select('id, word, severity, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as BannedWordRow[]

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1" style={{ color: '#0D475C' }}>Banned words</h1>
      <p className="text-sm text-gray-500 mb-5">
        Words flagged here are scanned when users post listings. <b>block</b> rejects the post; <b>flag</b> sends the listing to pending review.
      </p>
      <BannedWordsClient initial={rows} />
    </div>
  )
}
