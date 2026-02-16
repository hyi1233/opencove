import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../../shared/constants/ipc'
import type {
  AttachTerminalInput,
  DetachTerminalInput,
  KillTerminalInput,
  ResizeTerminalInput,
  SnapshotTerminalInput,
  SnapshotTerminalResult,
  SpawnTerminalInput,
  WriteTerminalInput,
} from '../../../../shared/types/api'
import type { IpcRegistrationDisposable } from '../../../ipc/types'
import type { PtyRuntime } from './runtime'
import {
  normalizeAttachTerminalPayload,
  normalizeDetachTerminalPayload,
  normalizeKillTerminalPayload,
  normalizeResizeTerminalPayload,
  normalizeSnapshotPayload,
  normalizeSpawnTerminalPayload,
  normalizeWriteTerminalPayload,
} from './validate'

export function registerPtyIpcHandlers(runtime: PtyRuntime): IpcRegistrationDisposable {
  ipcMain.handle(IPC_CHANNELS.ptySpawn, async (_event, payload: SpawnTerminalInput) => {
    const normalized = normalizeSpawnTerminalPayload(payload)
    return runtime.spawnSession(normalized)
  })

  ipcMain.handle(IPC_CHANNELS.ptyWrite, async (_event, payload: WriteTerminalInput) => {
    const normalized = normalizeWriteTerminalPayload(payload)
    runtime.write(normalized.sessionId, normalized.data)
  })

  ipcMain.handle(IPC_CHANNELS.ptyResize, async (_event, payload: ResizeTerminalInput) => {
    const normalized = normalizeResizeTerminalPayload(payload)
    runtime.resize(normalized.sessionId, normalized.cols, normalized.rows)
  })

  ipcMain.handle(IPC_CHANNELS.ptyKill, async (_event, payload: KillTerminalInput) => {
    const normalized = normalizeKillTerminalPayload(payload)
    runtime.kill(normalized.sessionId)
  })

  ipcMain.handle(IPC_CHANNELS.ptyAttach, async (event, payload: AttachTerminalInput) => {
    const normalized = normalizeAttachTerminalPayload(payload)
    runtime.attach(event.sender.id, normalized.sessionId)
  })

  ipcMain.handle(IPC_CHANNELS.ptyDetach, async (event, payload: DetachTerminalInput) => {
    const normalized = normalizeDetachTerminalPayload(payload)
    runtime.detach(event.sender.id, normalized.sessionId)
  })

  ipcMain.handle(
    IPC_CHANNELS.ptySnapshot,
    async (_event, payload: SnapshotTerminalInput): Promise<SnapshotTerminalResult> => {
      const normalized = normalizeSnapshotPayload(payload)
      return { data: runtime.snapshot(normalized.sessionId) }
    },
  )

  return {
    dispose: () => {
      ipcMain.removeHandler(IPC_CHANNELS.ptySpawn)
      ipcMain.removeHandler(IPC_CHANNELS.ptyWrite)
      ipcMain.removeHandler(IPC_CHANNELS.ptyResize)
      ipcMain.removeHandler(IPC_CHANNELS.ptyKill)
      ipcMain.removeHandler(IPC_CHANNELS.ptyAttach)
      ipcMain.removeHandler(IPC_CHANNELS.ptyDetach)
      ipcMain.removeHandler(IPC_CHANNELS.ptySnapshot)

      runtime.dispose()
    },
  }
}
