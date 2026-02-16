import type { IpcRegistrationDisposable } from './types'
import { registerAgentIpcHandlers } from '../modules/agent/ipc/register'
import { registerPtyIpcHandlers } from '../modules/pty/ipc/register'
import { createPtyRuntime } from '../modules/pty/ipc/runtime'
import { registerTaskIpcHandlers } from '../modules/task/ipc/register'
import { registerWorkspaceIpcHandlers } from '../modules/workspace/ipc/register'

export type { IpcRegistrationDisposable } from './types'

export function registerIpcHandlers(): IpcRegistrationDisposable {
  const ptyRuntime = createPtyRuntime()

  const disposables: IpcRegistrationDisposable[] = [
    registerWorkspaceIpcHandlers(),
    registerPtyIpcHandlers(ptyRuntime),
    registerAgentIpcHandlers(ptyRuntime),
    registerTaskIpcHandlers(),
  ]

  return {
    dispose: () => {
      for (let index = disposables.length - 1; index >= 0; index -= 1) {
        disposables[index]?.dispose()
      }
    },
  }
}
