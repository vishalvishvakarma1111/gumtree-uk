import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from './edit-form'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/account/my-ads/${id}/edit`)

  const { data: listing } = await supabase
    .from('listings')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!listing) notFound()

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold mb-1" style={{ color: '#0D475C' }}>Edit ad</h1>
        <p className="text-xs text-gray-400 mb-5">{listing.categories?.name ?? 'Listing'}</p>
        <EditListingForm listing={listing} />
      </div>
    </div>
  )
}
