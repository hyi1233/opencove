import { useCallback, useEffect, type MutableRefObject } from 'react'
import type { Node } from '@xyflow/react'
import {
  resolveAgentModel,
  resolveTaskTitleModel,
  resolveTaskTitleProvider,
  type AgentSettings,
} from '../../../../settings/agentConfig'
import type { TaskPriority, TaskRuntimeStatus, TerminalNodeData } from '../../../types'
import { normalizeTaskPriority, normalizeTaskTagSelection, toErrorMessage } from '../helpers'
import type {
  CreateNodeInput,
  QuickUpdateTaskRequirement,
  QuickUpdateTaskTitle,
  UpdateTaskStatus,
} from '../types'

interface UseTaskActionsParams {
  nodesRef: MutableRefObject<Node<TerminalNodeData>[]>
  setNodes: (
    updater: (prevNodes: Node<TerminalNodeData>[]) => Node<TerminalNodeData>[],
    options?: { syncLayout?: boolean },
  ) => void
  createNodeForSession: (input: CreateNodeInput) => Promise<Node<TerminalNodeData> | null>
  buildAgentNodeTitle: (
    provider: AgentSettings['defaultProvider'],
    effectiveModel: string | null,
  ) => string
  launchAgentInNode: (nodeId: string, mode: 'new' | 'resume') => Promise<void>
  agentSettings: AgentSettings
  workspacePath: string
  taskTagOptions: string[]
  onRequestPersistFlush?: () => void
  runTaskAgentRef: MutableRefObject<(nodeId: string) => Promise<void>>
  updateTaskStatusRef: MutableRefObject<UpdateTaskStatus>
  quickUpdateTaskTitleRef: MutableRefObject<QuickUpdateTaskTitle>
  quickUpdateTaskRequirementRef: MutableRefObject<QuickUpdateTaskRequirement>
}

export function useWorkspaceCanvasTaskActions({
  nodesRef,
  setNodes,
  createNodeForSession,
  buildAgentNodeTitle,
  launchAgentInNode,
  agentSettings,
  workspacePath,
  taskTagOptions,
  onRequestPersistFlush,
  runTaskAgentRef,
  updateTaskStatusRef,
  quickUpdateTaskTitleRef,
  quickUpdateTaskRequirementRef,
}: UseTaskActionsParams): {
  suggestTaskTitle: (
    requirement: string,
  ) => Promise<{ title: string; priority: TaskPriority; tags: string[] }>
} {
  const runTaskAgent = useCallback(
    async (taskNodeId: string) => {
      const taskNode = nodesRef.current.find(node => node.id === taskNodeId)
      if (!taskNode || taskNode.data.kind !== 'task' || !taskNode.data.task) {
        return
      }

      const requirement = taskNode.data.task.requirement.trim()
      if (requirement.length === 0) {
        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id !== taskNodeId) {
              return node
            }

            return {
              ...node,
              data: {
                ...node.data,
                lastError: '任务要求不能为空。',
              },
            }
          }),
        )
        return
      }

      const linkedAgentNodeId = taskNode.data.task.linkedAgentNodeId
      if (linkedAgentNodeId) {
        const linkedAgentNode = nodesRef.current.find(node => node.id === linkedAgentNodeId)

        if (
          linkedAgentNode &&
          linkedAgentNode.data.kind === 'agent' &&
          linkedAgentNode.data.agent
        ) {
          const now = new Date().toISOString()

          setNodes(prevNodes =>
            prevNodes.map(node => {
              if (node.id === linkedAgentNodeId && node.data.kind === 'agent' && node.data.agent) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    agent: {
                      ...node.data.agent,
                      prompt: requirement,
                      taskId: taskNodeId,
                    },
                    lastError: null,
                  },
                }
              }

              if (node.id === taskNodeId && node.data.kind === 'task' && node.data.task) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    lastError: null,
                    task: {
                      ...node.data.task,
                      status: 'doing',
                      linkedAgentNodeId,
                      lastRunAt: now,
                      updatedAt: now,
                    },
                  },
                }
              }

              return node
            }),
          )
          onRequestPersistFlush?.()

          await launchAgentInNode(linkedAgentNodeId, 'new')
          return
        }

        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
              return node
            }

            return {
              ...node,
              data: {
                ...node.data,
                task: {
                  ...node.data.task,
                  linkedAgentNodeId: null,
                  updatedAt: new Date().toISOString(),
                },
              },
            }
          }),
        )
        onRequestPersistFlush?.()
      }

      const provider = agentSettings.defaultProvider
      const model = resolveAgentModel(agentSettings, provider)

      try {
        const launched = await window.coveApi.agent.launch({
          provider,
          cwd: workspacePath,
          prompt: requirement,
          mode: 'new',
          model,
          cols: 80,
          rows: 24,
        })

        const createdAgentNode = await createNodeForSession({
          sessionId: launched.sessionId,
          title: buildAgentNodeTitle(provider, launched.effectiveModel),
          anchor: {
            x: taskNode.position.x + taskNode.data.width + 48,
            y: taskNode.position.y,
          },
          kind: 'agent',
          agent: {
            provider,
            prompt: requirement,
            model,
            effectiveModel: launched.effectiveModel,
            launchMode: launched.launchMode,
            resumeSessionId: launched.resumeSessionId,
            executionDirectory: workspacePath,
            directoryMode: 'workspace',
            customDirectory: null,
            shouldCreateDirectory: false,
            taskId: taskNodeId,
          },
        })

        if (!createdAgentNode) {
          return
        }

        const now = new Date().toISOString()

        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
              return node
            }

            return {
              ...node,
              data: {
                ...node.data,
                task: {
                  ...node.data.task,
                  status: 'doing',
                  linkedAgentNodeId: createdAgentNode.id,
                  lastRunAt: now,
                  updatedAt: now,
                },
              },
            }
          }),
        )
        onRequestPersistFlush?.()
      } catch (error) {
        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id !== taskNodeId || node.data.kind !== 'task') {
              return node
            }

            return {
              ...node,
              data: {
                ...node.data,
                lastError: `Agent 启动失败：${toErrorMessage(error)}`,
              },
            }
          }),
        )
        onRequestPersistFlush?.()
      }
    },
    [
      agentSettings,
      buildAgentNodeTitle,
      createNodeForSession,
      launchAgentInNode,
      nodesRef,
      onRequestPersistFlush,
      setNodes,
      workspacePath,
    ],
  )

  const updateTaskStatus = useCallback(
    (taskNodeId: string, status: TaskRuntimeStatus) => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              task: {
                ...node.data.task,
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          }
        }),
      )

      onRequestPersistFlush?.()
    },
    [onRequestPersistFlush, setNodes],
  )

  const quickUpdateTaskTitle = useCallback(
    (taskNodeId: string, nextTitle: string) => {
      const normalizedTitle = nextTitle.trim()
      if (normalizedTitle.length === 0) {
        return
      }

      const now = new Date().toISOString()
      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              title: normalizedTitle,
              lastError: null,
              task: {
                ...node.data.task,
                autoGeneratedTitle: false,
                updatedAt: now,
              },
            },
          }
        }),
      )

      onRequestPersistFlush?.()
    },
    [onRequestPersistFlush, setNodes],
  )

  const quickUpdateTaskRequirement = useCallback(
    (taskNodeId: string, nextRequirement: string) => {
      const normalizedRequirement = nextRequirement.trim()
      if (normalizedRequirement.length === 0) {
        return
      }

      const now = new Date().toISOString()
      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.id !== taskNodeId || node.data.kind !== 'task' || !node.data.task) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              lastError: null,
              task: {
                ...node.data.task,
                requirement: normalizedRequirement,
                updatedAt: now,
              },
            },
          }
        }),
      )

      onRequestPersistFlush?.()
    },
    [onRequestPersistFlush, setNodes],
  )

  const suggestTaskTitle = useCallback(
    async (
      requirement: string,
    ): Promise<{ title: string; priority: TaskPriority; tags: string[] }> => {
      const provider = resolveTaskTitleProvider(agentSettings)
      const model = resolveTaskTitleModel(agentSettings)

      const suggested = await window.coveApi.task.suggestTitle({
        provider,
        cwd: workspacePath,
        requirement,
        model,
        availableTags: taskTagOptions,
      })

      return {
        title: suggested.title,
        priority: normalizeTaskPriority(suggested.priority),
        tags: normalizeTaskTagSelection(suggested.tags, taskTagOptions),
      }
    },
    [agentSettings, taskTagOptions, workspacePath],
  )

  useEffect(() => {
    runTaskAgentRef.current = async nodeId => {
      await runTaskAgent(nodeId)
    }
  }, [runTaskAgent, runTaskAgentRef])

  useEffect(() => {
    updateTaskStatusRef.current = (nodeId, status) => {
      updateTaskStatus(nodeId, status)
    }
  }, [updateTaskStatus, updateTaskStatusRef])

  useEffect(() => {
    quickUpdateTaskTitleRef.current = (nodeId, title) => {
      quickUpdateTaskTitle(nodeId, title)
    }
  }, [quickUpdateTaskTitle, quickUpdateTaskTitleRef])

  useEffect(() => {
    quickUpdateTaskRequirementRef.current = (nodeId, requirement) => {
      quickUpdateTaskRequirement(nodeId, requirement)
    }
  }, [quickUpdateTaskRequirement, quickUpdateTaskRequirementRef])

  return { suggestTaskTitle }
}
