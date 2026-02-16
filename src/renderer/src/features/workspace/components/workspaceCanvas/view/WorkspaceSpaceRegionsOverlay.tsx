import React from 'react'
import { ViewportPortal } from '@xyflow/react'
import type { SpaceVisual } from '../types'

interface WorkspaceSpaceRegionsOverlayProps {
  spaceVisuals: SpaceVisual[]
  activeSpaceId: string | null
  spaceDragOffset: { spaceId: string; dx: number; dy: number } | null
  handleSpaceDragHandlePointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    spaceId: string,
  ) => void
  editingSpaceId: string | null
  spaceRenameInputRef: React.RefObject<HTMLInputElement>
  spaceRenameDraft: string
  setSpaceRenameDraft: React.Dispatch<React.SetStateAction<string>>
  commitSpaceRename: (spaceId: string) => void
  cancelSpaceRename: () => void
  startSpaceRename: (spaceId: string) => void
}

export function WorkspaceSpaceRegionsOverlay({
  spaceVisuals,
  activeSpaceId,
  spaceDragOffset,
  handleSpaceDragHandlePointerDown,
  editingSpaceId,
  spaceRenameInputRef,
  spaceRenameDraft,
  setSpaceRenameDraft,
  commitSpaceRename,
  cancelSpaceRename,
  startSpaceRename,
}: WorkspaceSpaceRegionsOverlayProps): React.JSX.Element {
  return (
    <ViewportPortal>
      {spaceVisuals.map(space => (
        <div
          key={space.id}
          className={`workspace-space-region${space.id === activeSpaceId ? ' workspace-space-region--active' : ''}`}
          style={{
            transform: `translate(${
              space.rect.x +
              (spaceDragOffset?.spaceId === space.id && space.hasExplicitRect
                ? spaceDragOffset.dx
                : 0)
            }px, ${
              space.rect.y +
              (spaceDragOffset?.spaceId === space.id && space.hasExplicitRect
                ? spaceDragOffset.dy
                : 0)
            }px)`,
            width: space.rect.width,
            height: space.rect.height,
          }}
        >
          <div
            className="workspace-space-region__drag-handle workspace-space-region__drag-handle--top"
            data-testid={`workspace-space-drag-${space.id}-top`}
            onPointerDown={event => {
              handleSpaceDragHandlePointerDown(event, space.id)
            }}
          />
          <div
            className="workspace-space-region__drag-handle workspace-space-region__drag-handle--right"
            data-testid={`workspace-space-drag-${space.id}-right`}
            onPointerDown={event => {
              handleSpaceDragHandlePointerDown(event, space.id)
            }}
          />
          <div
            className="workspace-space-region__drag-handle workspace-space-region__drag-handle--bottom"
            data-testid={`workspace-space-drag-${space.id}-bottom`}
            onPointerDown={event => {
              handleSpaceDragHandlePointerDown(event, space.id)
            }}
          />
          <div
            className="workspace-space-region__drag-handle workspace-space-region__drag-handle--left"
            data-testid={`workspace-space-drag-${space.id}-left`}
            onPointerDown={event => {
              handleSpaceDragHandlePointerDown(event, space.id)
            }}
          />
          {editingSpaceId === space.id ? (
            <input
              ref={spaceRenameInputRef}
              className="workspace-space-region__label-input nodrag nowheel"
              data-testid={`workspace-space-label-input-${space.id}`}
              value={spaceRenameDraft}
              onPointerDown={event => {
                event.stopPropagation()
              }}
              onClick={event => {
                event.stopPropagation()
              }}
              onChange={event => {
                setSpaceRenameDraft(event.target.value)
              }}
              onBlur={() => {
                commitSpaceRename(space.id)
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitSpaceRename(space.id)
                  return
                }

                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelSpaceRename()
                }
              }}
            />
          ) : (
            <button
              type="button"
              className="workspace-space-region__label"
              data-testid={`workspace-space-label-${space.id}`}
              onPointerDown={event => {
                event.stopPropagation()
              }}
              onClick={event => {
                event.stopPropagation()
                startSpaceRename(space.id)
              }}
            >
              {space.name}
            </button>
          )}
        </div>
      ))}
    </ViewportPortal>
  )
}
