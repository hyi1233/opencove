import type { EnsureDirectoryInput } from '../../../../shared/types/api'

export function normalizeEnsureDirectoryPayload(payload: unknown): EnsureDirectoryInput {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload for workspace:ensure-directory')
  }

  const record = payload as Record<string, unknown>
  const path = typeof record.path === 'string' ? record.path.trim() : ''

  if (path.length === 0) {
    throw new Error('Invalid path for workspace:ensure-directory')
  }

  return { path }
}
