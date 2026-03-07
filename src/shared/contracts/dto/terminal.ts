export interface PseudoTerminalSession {
  sessionId: string
}

export interface SpawnTerminalInput {
  cwd: string
  shell?: string
  cols: number
  rows: number
}

export interface WriteTerminalInput {
  sessionId: string
  data: string
}

export interface ResizeTerminalInput {
  sessionId: string
  cols: number
  rows: number
}

export interface KillTerminalInput {
  sessionId: string
}

export interface AttachTerminalInput {
  sessionId: string
}

export interface DetachTerminalInput {
  sessionId: string
}

export interface SnapshotTerminalInput {
  sessionId: string
}

export interface SnapshotTerminalResult {
  data: string
}

export interface TerminalDataEvent {
  sessionId: string
  data: string
}

export interface TerminalExitEvent {
  sessionId: string
  exitCode: number
}

export type TerminalSessionState = 'working' | 'standby'

export interface TerminalSessionStateEvent {
  sessionId: string
  state: TerminalSessionState
}

export interface TerminalSessionMetadataEvent {
  sessionId: string
  resumeSessionId: string | null
}
