'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  icon: string
  parent_id: string | null
  sort_order: number
}

interface EditState {
  id: string | null
  name: string
  slug: string
  icon: string
  sort_order: number
}

const EMPTY_EDIT: EditState = { id: null, name: '', slug: '', icon: '', sort_order: 0 }

export default function CategoriesClient({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT)
  const [creatingUnder, setCreatingUnder] = useState<string | 'root' | null>(null)
  const [newRow, setNewRow] = useState<EditState>(EMPTY_EDIT)

  const { parents, childMap } = useMemo(() => {
    const parents = initial.filter(c => !c.parent_id)
    const childMap = new Map<string, CategoryRow[]>()
    for (const c of initial) {
      if (c.parent_id) {
        const arr = childMap.get(c.parent_id) ?? []
        arr.push(c)
        childMap.set(c.parent_id, arr)
      }
    }
    return { parents, childMap }
  }, [initial])

  const refresh = () => startTransition(() => router.refresh())

  async function handleCreate(parentId: string | null) {
    if (!newRow.name.trim()) { setError('Name required'); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRow.name,
          slug: newRow.slug || undefined,
          icon: newRow.icon,
          parent_id: parentId,
          sort_order: newRow.sort_order,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Create failed')
      setNewRow(EMPTY_EDIT)
      setCreatingUnder(null)
      if (parentId) setExpanded(s => new Set(s).add(parentId))
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    if (!edit.id) return
    if (!edit.name.trim()) { setError('Name required'); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${edit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: edit.name,
          slug: edit.slug,
          icon: edit.icon,
          sort_order: edit.sort_order,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      setEdit(EMPTY_EDIT)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(c: CategoryRow) {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'border rounded px-2 py-1 text-sm w-full'
  const btnPrimary = 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded text-white disabled:opacity-50'
  const btnGhost = 'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50'

  return (
    <div className="bg-white rounded-xl border" style={{ borderColor: '#dbdadb' }}>
      {error && (
        <div className="m-3 px-3 py-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#f0f0f0' }}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parent categories</p>
        <button
          type="button"
          className={btnPrimary}
          style={{ backgroundColor: '#0D475C' }}
          onClick={() => { setCreatingUnder('root'); setNewRow(EMPTY_EDIT) }}
          disabled={busy || pending}
        >
          <Plus size={12} /> New parent
        </button>
      </div>

      {creatingUnder === 'root' && (
        <NewRowForm
          row={newRow}
          onChange={setNewRow}
          onCancel={() => setCreatingUnder(null)}
          onSave={() => handleCreate(null)}
          busy={busy}
        />
      )}

      <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
        {parents.map(parent => {
          const isOpen = expanded.has(parent.id)
          const children = childMap.get(parent.id) ?? []
          const isEditing = edit.id === parent.id
          return (
            <li key={parent.id}>
              <div className="px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 p-0.5"
                  onClick={() => setExpanded(s => {
                    const next = new Set(s)
                    if (next.has(parent.id)) next.delete(parent.id); else next.add(parent.id)
                    return next
                  })}
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <span className="text-base w-6 text-center">{parent.icon}</span>

                {isEditing ? (
                  <EditFields edit={edit} setEdit={setEdit} className="flex-1" />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{parent.name}</div>
                    <div className="text-xs text-gray-400">/{parent.slug} · sort {parent.sort_order} · {children.length} sub</div>
                  </div>
                )}

                <RowActions
                  isEditing={isEditing}
                  busy={busy}
                  onEdit={() => setEdit({
                    id: parent.id, name: parent.name, slug: parent.slug,
                    icon: parent.icon, sort_order: parent.sort_order,
                  })}
                  onSave={handleSave}
                  onCancel={() => setEdit(EMPTY_EDIT)}
                  onAddChild={() => {
                    setCreatingUnder(parent.id)
                    setNewRow(EMPTY_EDIT)
                    setExpanded(s => new Set(s).add(parent.id))
                  }}
                  onDelete={() => handleDelete(parent)}
                />
              </div>

              {creatingUnder === parent.id && (
                <NewRowForm
                  row={newRow}
                  onChange={setNewRow}
                  onCancel={() => setCreatingUnder(null)}
                  onSave={() => handleCreate(parent.id)}
                  busy={busy}
                  indent
                />
              )}

              {isOpen && children.length > 0 && (
                <ul className="bg-gray-50 border-t" style={{ borderColor: '#f0f0f0' }}>
                  {children.map(child => {
                    const childEditing = edit.id === child.id
                    return (
                      <li key={child.id} className="px-3 py-2 pl-12 flex items-center gap-2 border-b last:border-b-0" style={{ borderColor: '#f0f0f0' }}>
                        <span className="text-sm w-6 text-center">{child.icon}</span>
                        {childEditing ? (
                          <EditFields edit={edit} setEdit={setEdit} className="flex-1" />
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-800 truncate">{child.name}</div>
                            <div className="text-xs text-gray-400">/{child.slug} · sort {child.sort_order}</div>
                          </div>
                        )}
                        <RowActions
                          isEditing={childEditing}
                          busy={busy}
                          onEdit={() => setEdit({
                            id: child.id, name: child.name, slug: child.slug,
                            icon: child.icon, sort_order: child.sort_order,
                          })}
                          onSave={handleSave}
                          onCancel={() => setEdit(EMPTY_EDIT)}
                          onDelete={() => handleDelete(child)}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )

  function NewRowForm({
    row, onChange, onCancel, onSave, busy, indent,
  }: {
    row: EditState
    onChange: (r: EditState) => void
    onCancel: () => void
    onSave: () => void
    busy: boolean
    indent?: boolean
  }) {
    return (
      <div className={`bg-blue-50 border-y px-3 py-3 flex flex-wrap gap-2 items-center ${indent ? 'pl-12' : ''}`} style={{ borderColor: '#cfe1ec' }}>
        <input
          className={inputCls + ' flex-1 min-w-[160px]'}
          placeholder="Name"
          value={row.name}
          onChange={e => onChange({ ...row, name: e.target.value })}
          autoFocus
        />
        <input
          className={inputCls + ' w-40'}
          placeholder="slug (auto)"
          value={row.slug}
          onChange={e => onChange({ ...row, slug: e.target.value })}
        />
        <input
          className={inputCls + ' w-16 text-center'}
          placeholder="🎨"
          value={row.icon}
          onChange={e => onChange({ ...row, icon: e.target.value })}
        />
        <input
          className={inputCls + ' w-20'}
          type="number"
          placeholder="sort"
          value={row.sort_order}
          onChange={e => onChange({ ...row, sort_order: Number(e.target.value) || 0 })}
        />
        <button type="button" className={btnPrimary} style={{ backgroundColor: '#0D475C' }} onClick={onSave} disabled={busy}>
          <Check size={12} /> Save
        </button>
        <button type="button" className={btnGhost} onClick={onCancel} disabled={busy}>
          <X size={12} /> Cancel
        </button>
      </div>
    )
  }

  function EditFields({ edit, setEdit, className }: { edit: EditState; setEdit: (e: EditState) => void; className?: string }) {
    return (
      <div className={`${className ?? ''} flex flex-wrap gap-2 items-center`}>
        <input className={inputCls + ' flex-1 min-w-[140px]'} value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
        <input className={inputCls + ' w-40'} value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} />
        <input className={inputCls + ' w-16 text-center'} value={edit.icon} onChange={e => setEdit({ ...edit, icon: e.target.value })} />
        <input className={inputCls + ' w-20'} type="number" value={edit.sort_order} onChange={e => setEdit({ ...edit, sort_order: Number(e.target.value) || 0 })} />
      </div>
    )
  }

  function RowActions({
    isEditing, busy, onEdit, onSave, onCancel, onAddChild, onDelete,
  }: {
    isEditing: boolean
    busy: boolean
    onEdit: () => void
    onSave: () => void
    onCancel: () => void
    onAddChild?: () => void
    onDelete: () => void
  }) {
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <button type="button" className={btnPrimary} style={{ backgroundColor: '#0D475C' }} onClick={onSave} disabled={busy}>
            <Check size={12} /> Save
          </button>
          <button type="button" className={btnGhost} onClick={onCancel} disabled={busy}>
            <X size={12} /> Cancel
          </button>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1">
        {onAddChild && (
          <button type="button" className={btnGhost} onClick={onAddChild} disabled={busy} title="Add subcategory">
            <Plus size={12} />
          </button>
        )}
        <button type="button" className={btnGhost} onClick={onEdit} disabled={busy} title="Edit">
          <Pencil size={12} />
        </button>
        <button type="button" className={btnGhost + ' text-red-600 hover:bg-red-50'} onClick={onDelete} disabled={busy} title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    )
  }
}
