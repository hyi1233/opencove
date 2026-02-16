import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../../shared/constants/ipc'
import type { SuggestTaskTitleInput, SuggestTaskTitleResult } from '../../../../shared/types/api'
import type { IpcRegistrationDisposable } from '../../../ipc/types'
import { suggestTaskTitle } from '../../../infrastructure/task/TaskTitleGenerator'
import { normalizeSuggestTaskTitlePayload } from './validate'

export function registerTaskIpcHandlers(): IpcRegistrationDisposable {
  ipcMain.handle(
    IPC_CHANNELS.taskSuggestTitle,
    async (_event, payload: SuggestTaskTitleInput): Promise<SuggestTaskTitleResult> => {
      const normalized = normalizeSuggestTaskTitlePayload(payload)
      return await suggestTaskTitle(normalized)
    },
  )

  return {
    dispose: () => {
      ipcMain.removeHandler(IPC_CHANNELS.taskSuggestTitle)
    },
  }
}
