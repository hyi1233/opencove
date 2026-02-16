import React from 'react'
import type { WorkspaceSpaceState } from '../../../types'
import type { ContextMenuState } from '../types'

interface WorkspaceContextMenuProps {
  contextMenu: ContextMenuState | null
  spaces: WorkspaceSpaceState[]
  activeSpaceId: string | null
  closeContextMenu: () => void
  createTerminalNode: () => Promise<void>
  openTaskCreator: () => void
  openAgentLauncher: () => void
  createSpaceFromSelectedNodes: () => void
  moveSelectionToSpace: (spaceId: string) => void
  removeSelectionFromSpaces: () => void
  clearNodeSelection: () => void
}

export function WorkspaceContextMenu({
  contextMenu,
  spaces,
  activeSpaceId,
  closeContextMenu,
  createTerminalNode,
  openTaskCreator,
  openAgentLauncher,
  createSpaceFromSelectedNodes,
  moveSelectionToSpace,
  removeSelectionFromSpaces,
  clearNodeSelection,
}: WorkspaceContextMenuProps): React.JSX.Element | null {
  if (!contextMenu) {
    return null
  }

  return (
    <div
      className="workspace-context-menu"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={event => {
        event.stopPropagation()
      }}
    >
      {contextMenu.kind === 'pane' ? (
        <>
          <button
            type="button"
            data-testid="workspace-context-new-terminal"
            onClick={() => {
              void createTerminalNode()
            }}
          >
            New Terminal
          </button>
          <button
            type="button"
            data-testid="workspace-context-new-task"
            onClick={() => {
              openTaskCreator()
            }}
          >
            New Task
          </button>
          <button
            type="button"
            data-testid="workspace-context-run-default-agent"
            onClick={() => {
              openAgentLauncher()
            }}
          >
            Run Agent
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            data-testid="workspace-selection-create-space"
            onClick={() => {
              createSpaceFromSelectedNodes()
            }}
          >
            Create Space with Selected
          </button>
          {spaces.map(space => (
            <button
              type="button"
              key={space.id}
              data-testid={`workspace-selection-move-space-${space.id}`}
              onClick={() => {
                moveSelectionToSpace(space.id)
              }}
            >
              Move to {space.name}
              {space.id === activeSpaceId ? ' (Active)' : ''}
            </button>
          ))}
          <button
            type="button"
            data-testid="workspace-selection-remove-space"
            onClick={() => {
              removeSelectionFromSpaces()
            }}
          >
            Remove from Space
          </button>
          <button
            type="button"
            data-testid="workspace-selection-clear"
            onClick={() => {
              clearNodeSelection()
              closeContextMenu()
            }}
          >
            Clear Selection
          </button>
        </>
      )}
    </div>
  )
}
