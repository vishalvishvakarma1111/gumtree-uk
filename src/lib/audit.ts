import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from './supabase/service'

export interface AuditEntry {
  actorId: string | null
  action: string
  entityType: string
  entityId?: string | null
  meta?: Record<string, unknown>
}

/**
 * Append a row to `audit_log`. Uses the service-role client because
 * the table is admin-only and not exposed via RLS to authenticated users.
 *
 * Failures are logged but never thrown — auditing must not break the
 * primary admin action.
 */
export async function logAuditAction(
  entry: AuditEntry,
  client?: SupabaseClient,
): Promise<void> {
  try {
    const admin = client ?? createServiceClient()
    const { error } = await admin.from('audit_log').insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      meta: entry.meta ?? {},
    })
    if (error) console.error('audit_log insert failed:', error)
  } catch (err) {
    console.error('logAuditAction threw:', err)
  }
}
