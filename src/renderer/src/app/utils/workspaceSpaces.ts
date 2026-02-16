import type { WorkspaceState, WorkspaceViewport } from '../../features/workspace/types'
import { DEFAULT_WORKSPACE_VIEWPORT } from '../../features/workspace/types'

export function sanitizeWorkspaceSpaces(
  spaces: WorkspaceState['spaces'],
): WorkspaceState['spaces'] {
  return spaces
    .map(space => ({
      ...space,
      nodeIds: [...new Set(space.nodeIds)],
    }))
    .filter(space => space.nodeIds.length > 0)
}

export function createDefaultWorkspaceViewport(): WorkspaceViewport {
  return {
    x: DEFAULT_WORKSPACE_VIEWPORT.x,
    y: DEFAULT_WORKSPACE_VIEWPORT.y,
    zoom: DEFAULT_WORKSPACE_VIEWPORT.zoom,
  }
}
