'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, User as UserIcon, Camera, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  email: string
  initial: {
    name: string
    location: string
    bio: string
    avatar_url: string
    phone: string
  }
}

export default function ProfileForm({ email, initial }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [location, setLocation] = useState(initial.location)
  const [bio, setBio] = useState(initial.bio)
  const [phone, setPhone] = useState(initial.phone)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAvatarUrl(data.url)
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, bio, phone, avatar_url: avatarUrl || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: 'Profile saved' })
      router.refresh()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
    <form onSubmit={handleSave} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
      <div className="px-6 py-6 flex items-center gap-5 border-b" style={{ borderColor: '#f0f0f0' }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group"
          style={{ backgroundColor: '#0D475C' }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : name ? (
            name.slice(0, 1).toUpperCase()
          ) : (
            <UserIcon size={32} />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            {uploadingAvatar ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div>
          <p className="font-bold text-gray-900 text-lg">{name || 'Your name'}</p>
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            <Mail size={12} />
            {email}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <Field label="Display name">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: '#dbdadb' }}
          />
        </Field>

        <Field label="Location">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. London"
            maxLength={200}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: '#dbdadb' }}
          />
        </Field>

        <Field label="Phone (optional)">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="07xxx xxxxxx"
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: '#dbdadb' }}
          />
        </Field>

        <Field label="Bio">
          <textarea
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={500}
            placeholder="Tell buyers a bit about yourself…"
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
            style={{ borderColor: '#dbdadb' }}
          />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
        </Field>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#f0f0f0' }}>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#0D475C' }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
    <PasswordSection />
    </div>
  )
}

function PasswordSection() {
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleChange(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (pwd.length < 6) return setMsg({ type: 'error', text: 'Password must be ≥ 6 chars' })
    if (pwd !== pwd2) return setMsg({ type: 'error', text: 'Passwords don’t match' })
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: pwd })
      if (error) throw error
      setMsg({ type: 'success', text: 'Password updated' })
      setPwd(''); setPwd2('')
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleChange} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f0f0f0' }}>
        <Lock size={14} style={{ color: '#0D475C' }} />
        <h3 className="font-bold text-sm" style={{ color: '#0D475C' }}>Change password</h3>
      </div>
      <div className="p-6 space-y-4">
        <Field label="New password">
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: '#dbdadb' }}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm password">
          <input
            type="password"
            value={pwd2}
            onChange={e => setPwd2(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: '#dbdadb' }}
            autoComplete="new-password"
          />
        </Field>
        {msg && (
          <p className={`text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>
        )}
      </div>
      <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#f0f0f0' }}>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded text-white text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: '#0D475C' }}
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0D475C' }}>{label}</label>
      {children}
    </div>
  )
}
