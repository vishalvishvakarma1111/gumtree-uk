'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

export default function ViewToggle({ current }: { current: 'grid' | 'list' }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function set(view: 'grid' | 'list') {
    const p = new URLSearchParams(searchParams.toString())
    if (view === 'grid') p.delete('view')
    else p.set('view', view)
    router.push(`/browse?${p.toString()}`)
  }

  return (
    <div className="flex border rounded overflow-hidden" style={{ borderColor: '#dbdadb' }}>
      <button
        onClick={() => set('grid')}
        title="Grid view"
        className="px-2 py-1.5 transition-colors"
        style={{ backgroundColor: current === 'grid' ? '#0D475C' : '#fff', color: current === 'grid' ? '#fff' : '#555' }}
      >
        <LayoutGrid size={14} />
      </button>
      <button
        onClick={() => set('list')}
        title="List view"
        className="px-2 py-1.5 transition-colors"
        style={{ backgroundColor: current === 'list' ? '#0D475C' : '#fff', color: current === 'list' ? '#fff' : '#555' }}
      >
        <List size={14} />
      </button>
    </div>
  )
}
