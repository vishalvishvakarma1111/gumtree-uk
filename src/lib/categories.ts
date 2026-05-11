import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category } from '@/types'

export interface CategoryNode extends Category {
  children: CategoryNode[]
}

/**
 * Fetches all categories and builds a parent → children tree. If the
 * DB is not reachable or returns no rows, falls back to the hardcoded
 * mock tree so the browse page still renders something sensible in
 * dev / mock-data mode.
 */
export async function fetchCategoryTree(
  supabase: SupabaseClient,
): Promise<CategoryNode[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, parent_id, sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return MOCK_TREE
    return buildTree(data as Category[])
  } catch {
    return MOCK_TREE
  }
}

export function buildTree(rows: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>()
  for (const row of rows) {
    byId.set(row.id, { ...row, children: [] })
  }
  const roots: CategoryNode[] = []
  for (const row of rows) {
    const node = byId.get(row.id)!
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

/**
 * Given a slug, return the ids of that node plus all descendants.
 * Returns an empty array if the slug isn't found. Used to expand a
 * parent category selection into a list of leaf category ids for
 * the listings.category_id IN (...) filter.
 */
export function findDescendantIds(
  tree: CategoryNode[],
  slug: string,
): string[] {
  const node = findNode(tree, slug)
  if (!node) return []
  const ids: string[] = []
  const stack: CategoryNode[] = [node]
  while (stack.length) {
    const n = stack.pop()!
    ids.push(n.id)
    stack.push(...n.children)
  }
  return ids
}

export function findNode(
  tree: CategoryNode[],
  slug: string,
): CategoryNode | null {
  for (const node of tree) {
    if (node.slug === slug) return node
    const child = findNode(node.children, slug)
    if (child) return child
  }
  return null
}

/**
 * Hardcoded fallback tree used when Supabase isn't reachable. Slugs
 * mirror the seed in migrations 001 + 008. Ids are stable strings
 * so the mock tree behaves like real DB rows for tree-walking, but
 * `findDescendantIds` returns these strings — callers must guard
 * against using them as real DB uuids.
 */
const MOCK_TREE: CategoryNode[] = [
  parent('cars-vehicles', 'Cars & Vehicles', '🚗', [
    leaf('cars', 'Cars', '🚙'),
    leaf('motorbikes', 'Motorbikes & Scooters', '🏍️'),
    leaf('vans', 'Vans', '🚐'),
    leaf('campervans', 'Campervans & Motorhomes', '🚍'),
    leaf('parts-accessories', 'Parts & Accessories', '🔩'),
  ]),
  parent('property', 'Property', '🏠', [
    leaf('property-for-sale', 'For Sale', '🏡'),
    leaf('property-to-rent', 'To Rent', '🔑'),
    leaf('property-to-share', 'To Share', '👥'),
    leaf('holiday-lets', 'Holiday Lets', '🏖️'),
    leaf('property-commercial', 'Commercial', '🏢'),
  ]),
  parent('jobs', 'Jobs', '💼', [
    leaf('jobs-it', 'IT & Tech', '💻'),
    leaf('jobs-retail', 'Retail', '🛍️'),
    leaf('jobs-hospitality', 'Hospitality & Catering', '🍽️'),
    leaf('jobs-driving', 'Driving & Delivery', '🚚'),
    leaf('jobs-healthcare', 'Healthcare', '🩺'),
    leaf('jobs-admin', 'Admin & Office', '📋'),
  ]),
  parent('electronics', 'Electronics', '📱', [
    leaf('phones', 'Phones', '📱'),
    leaf('computers', 'Computers & Laptops', '💻'),
    leaf('tvs', 'TVs', '📺'),
    leaf('cameras', 'Cameras', '📷'),
    leaf('audio', 'Audio & Stereo', '🎧'),
    leaf('video-games', 'Video Games', '🎮'),
  ]),
  parent('home-garden', 'Home & Garden', '🌿', [
    leaf('furniture', 'Furniture', '🛋️'),
    leaf('appliances', 'Appliances', '🧺'),
    leaf('diy-tools', 'DIY Tools', '🔨'),
    leaf('garden', 'Garden', '🌳'),
    leaf('home-decor', 'Home Decor', '🖼️'),
  ]),
  parent('pets', 'Pets', '🐾', [
    leaf('dogs', 'Dogs', '🐕'),
    leaf('cats', 'Cats', '🐈'),
    leaf('birds', 'Birds', '🐦'),
    leaf('fish', 'Fish & Aquatic', '🐟'),
    leaf('pet-equipment', 'Pet Equipment', '🦴'),
  ]),
  parent('fashion', 'Fashion', '👗', [
    leaf('womens-fashion', "Women's", '👚'),
    leaf('mens-fashion', "Men's", '👔'),
    leaf('kids-fashion', 'Kids', '👕'),
    leaf('shoes', 'Shoes', '👟'),
    leaf('jewellery-watches', 'Jewellery & Watches', '⌚'),
  ]),
  parent('sport-leisure', 'Sport & Leisure', '⚽', [
    leaf('bikes', 'Bikes', '🚲'),
    leaf('fitness-equipment', 'Fitness Equipment', '🏋️'),
    leaf('camping', 'Camping', '🏕️'),
    leaf('sports-gear', 'Sports Gear', '⚾'),
    leaf('tickets', 'Tickets', '🎟️'),
  ]),
  parent('kids-baby', 'Kids & Baby', '🧸', [
    leaf('baby-toys', 'Baby Toys', '🧸'),
    leaf('prams-pushchairs', 'Prams & Pushchairs', '🛒'),
    leaf('kids-clothes', 'Kids Clothes', '👶'),
    leaf('kids-equipment', 'Kids Equipment', '🍼'),
  ]),
  parent('services', 'Services', '🔧', [
    leaf('tradesmen', 'Tradesmen', '🔧'),
    leaf('tutors', 'Tutors', '🎓'),
    leaf('health-beauty', 'Health & Beauty', '💆'),
    leaf('transport', 'Transport', '🚛'),
    leaf('finance-legal', 'Finance & Legal', '💼'),
  ]),
  parent('community', 'Community', '🤝', [
    leaf('events', 'Events', '🎉'),
    leaf('classes', 'Classes', '📚'),
    leaf('lost-found', 'Lost & Found', '🔍'),
    leaf('rideshare-pooling', 'Rideshare & Pooling', '🚙'),
  ]),
  parent('business-industrial', 'Business & Industrial', '🏭', [
    leaf('machinery', 'Machinery', '🏗️'),
    leaf('business-equipment', 'Business Equipment', '🖥️'),
    leaf('office-furniture', 'Office Furniture', '🪑'),
    leaf('business-supplies', 'Supplies', '📦'),
  ]),
  parent('other', 'Other', '📦', []),
]

function parent(
  slug: string,
  name: string,
  icon: string,
  children: CategoryNode[],
): CategoryNode {
  return {
    id: `mock-${slug}`,
    name,
    slug,
    icon,
    parent_id: null,
    children: children.map(c => ({ ...c, parent_id: `mock-${slug}` })),
  }
}

function leaf(slug: string, name: string, icon: string): CategoryNode {
  return {
    id: `mock-${slug}`,
    name,
    slug,
    icon,
    parent_id: null,
    children: [],
  }
}
