import { normalizeAgentSettings } from '../../../settings/agentConfig'
import type { PersistedAppState, PersistedWorkspaceState } from '../../types'
import { STORAGE_KEY } from './constants'
import { ensurePersistedWorkspace } from './ensure'
import { getStorage } from './storage'

export function readPersistedState(): PersistedAppState | null {
  const storage = getStorage()
  if (!storage) {
    return null
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const record = parsed as Record<string, unknown>
    const activeWorkspaceId = record.activeWorkspaceId
    const workspaces = record.workspaces

    if (activeWorkspaceId !== null && typeof activeWorkspaceId !== 'string') {
      return null
    }

    if (!Array.isArray(workspaces)) {
      return null
    }

    const normalizedWorkspaces = workspaces
      .map(item => ensurePersistedWorkspace(item))
      .filter((item): item is PersistedWorkspaceState => item !== null)

    const settings = normalizeAgentSettings(record.settings)

    return {
      activeWorkspaceId,
      workspaces: normalizedWorkspaces,
      settings,
    }
  } catch {
    return null
  }
}
