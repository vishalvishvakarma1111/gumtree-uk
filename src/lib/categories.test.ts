import { describe, it, expect } from 'vitest'
import { buildTree, findDescendantIds, findNode } from './categories'
import type { Category } from '@/types'

const rows: Category[] = [
  { id: 'p1', name: 'Cars & Vehicles', slug: 'cars-vehicles', icon: '🚗', parent_id: null },
  { id: 'c1', name: 'Cars',            slug: 'cars',          icon: '🚙', parent_id: 'p1' },
  { id: 'c2', name: 'Vans',            slug: 'vans',          icon: '🚐', parent_id: 'p1' },
  { id: 'p2', name: 'Electronics',     slug: 'electronics',   icon: '📱', parent_id: null },
  { id: 'c3', name: 'Phones',          slug: 'phones',        icon: '📱', parent_id: 'p2' },
]

describe('buildTree', () => {
  it('places top-level categories at the root', () => {
    const tree = buildTree(rows)
    const rootSlugs = tree.map(n => n.slug).sort()
    expect(rootSlugs).toEqual(['cars-vehicles', 'electronics'])
  })

  it('nests children under the correct parent', () => {
    const tree = buildTree(rows)
    const cars = tree.find(n => n.slug === 'cars-vehicles')!
    expect(cars.children.map(c => c.slug).sort()).toEqual(['cars', 'vans'])
  })

  it('treats orphans (unknown parent_id) as roots', () => {
    const orphan: Category = { id: 'x1', name: 'Orphan', slug: 'orphan', icon: '?', parent_id: 'missing' }
    const tree = buildTree([...rows, orphan])
    expect(tree.map(n => n.slug)).toContain('orphan')
  })
})

describe('findNode', () => {
  it('finds a top-level node', () => {
    const tree = buildTree(rows)
    expect(findNode(tree, 'electronics')?.slug).toBe('electronics')
  })

  it('finds a nested node', () => {
    const tree = buildTree(rows)
    expect(findNode(tree, 'phones')?.slug).toBe('phones')
  })

  it('returns null for an unknown slug', () => {
    const tree = buildTree(rows)
    expect(findNode(tree, 'nope')).toBeNull()
  })
})

describe('findDescendantIds', () => {
  it('returns the parent id plus all child ids', () => {
    const tree = buildTree(rows)
    const ids = findDescendantIds(tree, 'cars-vehicles').sort()
    expect(ids).toEqual(['c1', 'c2', 'p1'])
  })

  it('returns just the node id when called on a leaf', () => {
    const tree = buildTree(rows)
    expect(findDescendantIds(tree, 'phones')).toEqual(['c3'])
  })

  it('returns an empty array for an unknown slug', () => {
    const tree = buildTree(rows)
    expect(findDescendantIds(tree, 'nope')).toEqual([])
  })
})
