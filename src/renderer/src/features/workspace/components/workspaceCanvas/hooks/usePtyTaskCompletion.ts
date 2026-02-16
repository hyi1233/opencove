import { useEffect } from 'react'
import type { Node } from '@xyflow/react'
import type { TerminalNodeData } from '../../../types'

export function useWorkspaceCanvasPtyTaskCompletion({
  setNodes,
}: {
  setNodes: (
    updater: (prevNodes: Node<TerminalNodeData>[]) => Node<TerminalNodeData>[],
    options?: { syncLayout?: boolean },
  ) => void
}): void {
  useEffect(() => {
    const ptyWithOptionalDone = window.coveApi.pty as typeof window.coveApi.pty & {
      onDone?:
        | ((listener: (event: { sessionId: string; signal: 'done' }) => void) => () => void)
        | undefined
    }

    if (typeof ptyWithOptionalDone.onDone !== 'function') {
      return
    }

    const unsubscribeDone = ptyWithOptionalDone.onDone(event => {
      if (event.signal !== 'done') {
        return
      }

      setNodes(prevNodes => {
        const taskNodeId = prevNodes.find(node => {
          return node.data.kind === 'agent' && node.data.sessionId === event.sessionId
        })?.data.agent?.taskId

        if (!taskNodeId) {
          return prevNodes
        }

        return prevNodes.map(node => {
          if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              task: {
                ...node.data.task,
                status: 'ai_done',
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      })
    })

    return () => {
      unsubscribeDone()
    }
  }, [setNodes])

  useEffect(() => {
    const ptyWithOptionalDone = window.coveApi.pty as typeof window.coveApi.pty & {
      onDone?: unknown
    }
    const shouldFallbackToExitDone = typeof ptyWithOptionalDone.onDone !== 'function'

    const unsubscribeExit = window.coveApi.pty.onExit(event => {
      setNodes(prevNodes => {
        let relatedTaskNodeId: string | null = null

        const nextNodes = prevNodes.map(node => {
          if (node.data.sessionId !== event.sessionId || node.data.kind !== 'agent') {
            return node
          }

          if (node.data.status === 'stopped') {
            return node
          }

          relatedTaskNodeId = node.data.agent?.taskId ?? null

          return {
            ...node,
            data: {
              ...node.data,
              status: event.exitCode === 0 ? ('exited' as const) : ('failed' as const),
              endedAt: new Date().toISOString(),
              exitCode: event.exitCode,
            },
          }
        })

        if (!shouldFallbackToExitDone || event.exitCode !== 0 || !relatedTaskNodeId) {
          return nextNodes
        }

        return nextNodes.map(node => {
          if (node.id !== relatedTaskNodeId || node.data.kind !== 'task' || !node.data.task) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              task: {
                ...node.data.task,
                status: 'ai_done',
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      })
    })

    return () => {
      unsubscribeExit()
    }
  }, [setNodes])
}
