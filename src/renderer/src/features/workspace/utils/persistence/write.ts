import type { PersistedAppState } from '../../types'
import { STORAGE_KEY } from './constants'
import type { PersistWriteResult } from './types'
import { getStorage, isQuotaExceededError } from './storage'

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }

  return typeof error === 'string' ? error : 'Unknown error'
}

function stripScrollbackFromState(state: PersistedAppState): PersistedAppState {
  return {
    ...state,
    workspaces: state.workspaces.map(workspace => ({
      ...workspace,
      nodes: workspace.nodes.map(node => ({
        ...node,
        scrollback: null,
      })),
    })),
  }
}

function settingsOnlyState(state: PersistedAppState): PersistedAppState {
  return {
    activeWorkspaceId: state.activeWorkspaceId,
    workspaces: [],
    settings: state.settings,
  }
}

export function writePersistedState(state: PersistedAppState): PersistWriteResult {
  const storage = getStorage()
  if (!storage) {
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Storage is unavailable; changes will not be saved.',
    }
  }

  const raw = JSON.stringify(state)

  try {
    storage.setItem(STORAGE_KEY, raw)
    return { ok: true, level: 'full', bytes: raw.length }
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      return { ok: false, reason: 'unknown', message: toErrorMessage(error) }
    }

    try {
      const degradedRaw = JSON.stringify(stripScrollbackFromState(state))
      storage.setItem(STORAGE_KEY, degradedRaw)
      return { ok: true, level: 'no_scrollback', bytes: degradedRaw.length }
    } catch (degradedError) {
      if (!isQuotaExceededError(degradedError)) {
        return { ok: false, reason: 'unknown', message: toErrorMessage(degradedError) }
      }
    }

    try {
      const minimalRaw = JSON.stringify(settingsOnlyState(state))
      storage.setItem(STORAGE_KEY, minimalRaw)
      return { ok: true, level: 'settings_only', bytes: minimalRaw.length }
    } catch (minimalError) {
      return {
        ok: false,
        reason: isQuotaExceededError(minimalError) ? 'quota' : 'unknown',
        message: toErrorMessage(minimalError),
      }
    }
  }
}

export function writeRawPersistedState(raw: string): PersistWriteResult {
  const storage = getStorage()
  if (!storage) {
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Storage is unavailable; changes will not be saved.',
    }
  }

  try {
    storage.setItem(STORAGE_KEY, raw)
    return { ok: true, level: 'full', bytes: raw.length }
  } catch {
    return {
      ok: false,
      reason: 'unknown',
      message: 'Failed to write persisted state.',
    }
  }
}
