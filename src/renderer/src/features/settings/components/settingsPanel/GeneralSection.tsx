import React from 'react'
import { AGENT_PROVIDERS, AGENT_PROVIDER_LABEL, type AgentProvider } from '../../agentConfig'

export function GeneralSection(props: {
  defaultProvider: AgentProvider
  onChangeDefaultProvider: (provider: AgentProvider) => void
}): React.JSX.Element {
  const { defaultProvider, onChangeDefaultProvider } = props

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
    </div>
  )
}
