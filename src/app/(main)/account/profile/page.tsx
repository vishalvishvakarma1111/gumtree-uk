import { createClient } from '@/lib/supabase/server'
import { User, Mail, MapPin } from 'lucide-react'

export default async function ProfilePage() {
  let name = ''
  let email = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || ''
      email = user.email ?? ''
    }
  } catch { }

  return (
    <div>
      <h2 className="text-lg font-extrabold mb-5" style={{ color: '#0D475C' }}>Profile</h2>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
        {/* Avatar */}
        <div className="px-6 py-8 flex items-center gap-5 border-b" style={{ borderColor: '#f0f0f0' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: '#0D475C' }}
          >
            {name ? name.slice(0, 1).toUpperCase() : <User size={28} />}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{name || 'Anonymous'}</p>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>

        {/* Fields (read-only display) */}
        <div className="divide-y" style={{ borderColor: '#f5f5f5' }}>
          <ProfileRow icon={<User size={15} />} label="Display name" value={name || '—'} />
          <ProfileRow icon={<Mail size={15} />} label="Email" value={email || '—'} />
          <ProfileRow icon={<MapPin size={15} />} label="Location" value="Not set" />
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: '#f0f0f0' }}>
          <p className="text-xs text-gray-400">
            Profile editing coming soon. To change your name or email, contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}
