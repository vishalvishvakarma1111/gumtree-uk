import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  let email = ''
  let profile = { name: '', location: '', bio: '', avatar_url: '', phone: '', email_notifications: true }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/account/profile')
    email = user.email ?? ''

    const { data } = await supabase
      .from('user_profiles')
      .select('name, location, bio, avatar_url, phone, email_notifications')
      .eq('id', user.id)
      .maybeSingle()
    if (data) {
      profile = {
        name: data.name ?? '',
        location: data.location ?? '',
        bio: data.bio ?? '',
        avatar_url: data.avatar_url ?? '',
        phone: data.phone ?? '',
        email_notifications: data.email_notifications ?? true,
      }
    }
  } catch {
    redirect('/login?next=/account/profile')
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold mb-5" style={{ color: '#0D475C' }}>Profile</h2>
      <ProfileForm email={email} initial={profile} />
    </div>
  )
}
