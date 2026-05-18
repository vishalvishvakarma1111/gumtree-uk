import { createServiceClient } from '@/lib/supabase/service'
import CategoriesClient, { CategoryRow } from './categories-client'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, icon, parent_id, sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const rows = (data ?? []) as CategoryRow[]

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1" style={{ color: '#0D475C' }}>Categories</h1>
      <p className="text-sm text-gray-500 mb-5">
        Manage parent categories and their subcategories. Two-level nesting only.
      </p>
      <CategoriesClient initial={rows} />
    </div>
  )
}
