import React from 'react'
import {
  AGENT_PROVIDERS,
  AGENT_PROVIDER_LABEL,
  type AgentProvider,
  type TaskTitleProvider,
} from '../../agentConfig'

export function TaskTitleSection(props: {
  defaultProvider: AgentProvider
  taskTitleProvider: TaskTitleProvider
  taskTitleModel: string
  effectiveTaskTitleProvider: AgentProvider
  onChangeTaskTitleProvider: (provider: TaskTitleProvider) => void
  onChangeTaskTitleModel: (model: string) => void
}): React.JSX.Element {
  const {
    defaultProvider,
    taskTitleProvider,
    taskTitleModel,
    effectiveTaskTitleProvider,
    onChangeTaskTitleProvider,
    onChangeTaskTitleModel,
  } = props

  return (
    <div className="settings-panel__section" id="settings-section-task-title">
      <h3>Task Title Generation</h3>
      <div className="settings-panel__row">
        <span>CLI Provider</span>
        <select
          id="settings-task-title-provider"
          data-testid="settings-task-title-provider"
          value={taskTitleProvider}
          onChange={event => {
            onChangeTaskTitleProvider(event.target.value as TaskTitleProvider)
          }}
        >
          <option value="default">
            Follow Default Agent ({AGENT_PROVIDER_LABEL[defaultProvider]})
          </option>
          {AGENT_PROVIDERS.map(provider => (
            <option value={provider} key={provider}>
              {AGENT_PROVIDER_LABEL[provider]}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-panel__row">
        <span>Model (optional)</span>
        <input
          id="settings-task-title-model"
          data-testid="settings-task-title-model"
          value={taskTitleModel}
          placeholder="Leave empty to follow CLI default model"
          onChange={event => {
            onChangeTaskTitleModel(event.target.value)
          }}
        />
      </div>

      <p className="settings-panel__hint">
        Effective provider: {AGENT_PROVIDER_LABEL[effectiveTaskTitleProvider]}
      </p>
    </div>
  )
}
