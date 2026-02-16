export type PersistWriteLevel = 'full' | 'no_scrollback' | 'settings_only'
export type PersistWriteFailureReason = 'unavailable' | 'quota' | 'unknown'

export type PersistWriteResult =
  | {
      ok: true
      level: PersistWriteLevel
      bytes: number
    }
  | {
      ok: false
      reason: PersistWriteFailureReason
      message: string
    }
