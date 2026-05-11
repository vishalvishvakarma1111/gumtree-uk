import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostAdForm from '@/components/forms/post-ad-form'
import { fetchCategoryTree, findNode } from '@/lib/categories'

const CATEGORIES: Record<string, string> = {
  'cars-vehicles':       'Cars & Vehicles',
  'property':            'Property',
  'jobs':                'Jobs',
  'electronics':         'Electronics',
  'home-garden':         'Home & Garden',
  'pets':                'Pets',
  'fashion':             'Fashion',
  'sport-leisure':       'Sport & Leisure',
  'kids-baby':           'Kids & Baby',
  'services':            'Services',
  'community':           'Community',
  'business-industrial': 'Business & Industrial',
  'other':               'Other',
}

export default async function PostAdCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  const categoryName = CATEGORIES[category]
  if (!categoryName) notFound()

  let subcategories: { slug: string; name: string }[] = []
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/login?next=/post-ad/${category}`)
    const tree = await fetchCategoryTree(supabase)
    const node = findNode(tree, category)
    subcategories = (node?.children ?? []).map(c => ({ slug: c.slug, name: c.name }))
  } catch {
    redirect(`/login?next=/post-ad/${category}`)
  }

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>Post a free ad</h1>
          <p className="text-sm text-gray-400 mt-0.5">Category: {categoryName}</p>
        </div>
      </div>
      <PostAdForm
        categorySlug={category}
        categoryName={categoryName}
        subcategories={subcategories}
      />
    </div>
  )
}
