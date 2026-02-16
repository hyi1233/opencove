import type { SuggestTaskTitleInput } from '../../../../shared/types/api'
import { normalizeProvider, normalizeStringArray } from '../../../ipc/normalize'

export function normalizeSuggestTaskTitlePayload(payload: unknown): SuggestTaskTitleInput {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload for task:suggest-title')
  }

  const record = payload as Record<string, unknown>

  const provider = normalizeProvider(record.provider)
  const cwd = typeof record.cwd === 'string' ? record.cwd.trim() : ''
  const requirement = typeof record.requirement === 'string' ? record.requirement.trim() : ''
  const model = typeof record.model === 'string' ? record.model.trim() : ''
  const availableTags = normalizeStringArray(record.availableTags)

  if (cwd.length === 0) {
    throw new Error('Invalid cwd for task:suggest-title')
  }

  if (requirement.length === 0) {
    throw new Error('Invalid requirement for task:suggest-title')
  }

  return {
    provider,
    cwd,
    requirement,
    model: model.length > 0 ? model : null,
    availableTags,
  }
}
