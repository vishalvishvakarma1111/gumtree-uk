'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortDropdown({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('sort', value)
    router.push(`/browse?${p.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={e => handleChange(e.target.value)}
      className="text-sm border rounded px-2 py-1.5 outline-none bg-white"
      style={{ borderColor: '#dbdadb', color: '#333' }}
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  )
}
