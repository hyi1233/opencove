import { useCallback, useEffect, useRef, useState } from 'react'
import type { Node } from '@xyflow/react'
import type { ReactFlowInstance } from '@xyflow/react'
import type { TerminalNodeData, WorkspaceSpaceState } from '../../../types'
import type { ContextMenuState, EmptySelectionPromptState, SpaceDragState } from '../types'

interface UseSpaceDragParams {
  workspaceId: string
  reactFlow: ReactFlowInstance<Node<TerminalNodeData>>
  nodesRef: React.MutableRefObject<Node<TerminalNodeData>[]>
  spacesRef: React.MutableRefObject<WorkspaceSpaceState[]>
  setNodes: (
    updater: (prevNodes: Node<TerminalNodeData>[]) => Node<TerminalNodeData>[],
    options?: { syncLayout?: boolean },
  ) => void
  onSpacesChange: (spaces: WorkspaceSpaceState[]) => void
  onActiveSpaceChange: (spaceId: string | null) => void
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>
  cancelSpaceRename: () => void
  setEmptySelectionPrompt: React.Dispatch<React.SetStateAction<EmptySelectionPromptState | null>>
}

export function useWorkspaceCanvasSpaceDrag({
  workspaceId,
  reactFlow,
  nodesRef,
  spacesRef,
  setNodes,
  onSpacesChange,
  onActiveSpaceChange,
  setContextMenu,
  cancelSpaceRename,
  setEmptySelectionPrompt,
}: UseSpaceDragParams): {
  spaceDragOffset: { spaceId: string; dx: number; dy: number } | null
  handleSpaceDragHandlePointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    spaceId: string,
  ) => void
} {
  const [spaceDragOffset, setSpaceDragOffset] = useState<{
    spaceId: string
    dx: number
    dy: number
  } | null>(null)
  const [spaceDragPointerId, setSpaceDragPointerId] = useState<number | null>(null)
  const spaceDragStateRef = useRef<SpaceDragState | null>(null)

  useEffect(() => {
    setSpaceDragOffset(null)
    setSpaceDragPointerId(null)
    spaceDragStateRef.current = null
  }, [workspaceId])

  const applySpaceDragNodePositions = useCallback(
    (dragState: SpaceDragState, dx: number, dy: number) => {
      setNodes(
        prevNodes => {
          let hasMoved = false
          const nextNodes = prevNodes.map(node => {
            const initialPosition = dragState.initialNodePositions.get(node.id)
            if (!initialPosition) {
              return node
            }

            const nextX = initialPosition.x + dx
            const nextY = initialPosition.y + dy
            if (node.position.x === nextX && node.position.y === nextY) {
              return node
            }

            hasMoved = true
            return {
              ...node,
              position: {
                x: nextX,
                y: nextY,
              },
            }
          })

          return hasMoved ? nextNodes : prevNodes
        },
        { syncLayout: false },
      )
    },
    [setNodes],
  )

  const finalizeSpaceDrag = useCallback(
    (dragState: SpaceDragState, dx: number, dy: number) => {
      applySpaceDragNodePositions(dragState, dx, dy)

      if (!dragState.initialRect || (dx === 0 && dy === 0)) {
        return
      }

      const nextSpaces = spacesRef.current.map(space => {
        if (space.id !== dragState.spaceId || !dragState.initialRect) {
          return space
        }

        return {
          ...space,
          rect: {
            ...dragState.initialRect,
            x: dragState.initialRect.x + dx,
            y: dragState.initialRect.y + dy,
          },
        }
      })

      onSpacesChange(nextSpaces)
    },
    [applySpaceDragNodePositions, onSpacesChange, spacesRef],
  )

  const handleSpaceDragPointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = spaceDragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return
      }

      const currentFlow = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const dx = currentFlow.x - dragState.startFlow.x
      const dy = currentFlow.y - dragState.startFlow.y

      setSpaceDragOffset({
        spaceId: dragState.spaceId,
        dx,
        dy,
      })
      applySpaceDragNodePositions(dragState, dx, dy)
    },
    [applySpaceDragNodePositions, reactFlow],
  )

  const handleSpaceDragPointerUp = useCallback(
    (event: PointerEvent) => {
      const dragState = spaceDragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return
      }

      const endFlow = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const dx = endFlow.x - dragState.startFlow.x
      const dy = endFlow.y - dragState.startFlow.y

      finalizeSpaceDrag(dragState, dx, dy)
      spaceDragStateRef.current = null
      setSpaceDragOffset(null)
      setSpaceDragPointerId(null)
    },
    [finalizeSpaceDrag, reactFlow],
  )

  useEffect(() => {
    if (spaceDragPointerId === null) {
      return
    }

    window.addEventListener('pointermove', handleSpaceDragPointerMove)
    window.addEventListener('pointerup', handleSpaceDragPointerUp)
    window.addEventListener('pointercancel', handleSpaceDragPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleSpaceDragPointerMove)
      window.removeEventListener('pointerup', handleSpaceDragPointerUp)
      window.removeEventListener('pointercancel', handleSpaceDragPointerUp)
    }
  }, [handleSpaceDragPointerMove, handleSpaceDragPointerUp, spaceDragPointerId])

  const handleSpaceDragHandlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, spaceId: string) => {
      if (event.button !== 0) {
        return
      }

      const targetSpace = spacesRef.current.find(space => space.id === spaceId)
      if (!targetSpace) {
        return
      }

      const movableNodes = targetSpace.nodeIds
        .map(nodeId => nodesRef.current.find(node => node.id === nodeId))
        .filter((node): node is Node<TerminalNodeData> => Boolean(node))
      if (movableNodes.length === 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const startFlow = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      spaceDragStateRef.current = {
        pointerId: event.pointerId,
        spaceId,
        startFlow,
        initialRect: targetSpace.rect,
        initialNodePositions: new Map(
          movableNodes.map(node => [node.id, { x: node.position.x, y: node.position.y }]),
        ),
      }
      setSpaceDragOffset({
        spaceId,
        dx: 0,
        dy: 0,
      })
      setSpaceDragPointerId(event.pointerId)
      onActiveSpaceChange(spaceId)
      setContextMenu(null)
      cancelSpaceRename()
      setEmptySelectionPrompt(null)
    },
    [
      cancelSpaceRename,
      nodesRef,
      onActiveSpaceChange,
      reactFlow,
      setContextMenu,
      setEmptySelectionPrompt,
      spacesRef,
    ],
  )

  return {
    spaceDragOffset,
    handleSpaceDragHandlePointerDown,
  }
}
