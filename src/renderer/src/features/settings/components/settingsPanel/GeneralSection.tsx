import React from 'react'
import { AGENT_PROVIDERS, AGENT_PROVIDER_LABEL, type AgentProvider } from '../../agentConfig'

export function GeneralSection(props: {
  defaultProvider: AgentProvider
  agentFullAccess: boolean
  onChangeDefaultProvider: (provider: AgentProvider) => void
  onChangeAgentFullAccess: (enabled: boolean) => void
}): React.JSX.Element {
  const { defaultProvider, agentFullAccess, onChangeDefaultProvider, onChangeAgentFullAccess } =
    props

  return (
    <div className="settings-panel__section" id="settings-section-general">
      <label htmlFor="settings-default-provider">Default Agent</label>
      <select
        id="settings-default-provider"
        value={defaultProvider}
        onChange={event => {
          onChangeDefaultProvider(event.target.value as AgentProvider)
        }}
      >
        {AGENT_PROVIDERS.map(provider => (
          <option value={provider} key={provider}>
            {AGENT_PROVIDER_LABEL[provider]}
          </option>
        ))}
      </select>

      <label className="settings-provider-card__toggle">
        <input
          type="checkbox"
          data-testid="settings-agent-full-access"
          checked={agentFullAccess}
          onChange={event => {
            onChangeAgentFullAccess(event.target.checked)
          }}
        />
        <span>Agent full access (dangerous; disables sandbox + approvals)</span>
      </label>
    </div>
  )
}
