import React from 'react'
import {
  AGENT_PROVIDERS,
  AGENT_PROVIDER_LABEL,
  type AgentProvider,
  type AgentSettings,
} from '../../agentConfig'

interface ProviderModelCatalogEntry {
  models: string[]
  source: string | null
  fetchedAt: string | null
  isLoading: boolean
  error: string | null
}

export function ModelOverrideSection(props: {
  settings: AgentSettings
  modelCatalogByProvider: Record<AgentProvider, ProviderModelCatalogEntry>
  addModelInputByProvider: Record<AgentProvider, string>
  onRefreshProviderModels: (provider: AgentProvider) => void
  onToggleCustomModelEnabled: (provider: AgentProvider, enabled: boolean) => void
  onSelectProviderModel: (provider: AgentProvider, model: string) => void
  onRemoveCustomModelOption: (provider: AgentProvider, model: string) => void
  onChangeAddModelInput: (provider: AgentProvider, value: string) => void
  onAddCustomModelOption: (provider: AgentProvider) => void
}): React.JSX.Element {
  const {
    settings,
    modelCatalogByProvider,
    addModelInputByProvider,
    onRefreshProviderModels,
    onToggleCustomModelEnabled,
    onSelectProviderModel,
    onRemoveCustomModelOption,
    onChangeAddModelInput,
    onAddCustomModelOption,
  } = props

  return (
    <div className="settings-panel__section" id="settings-section-model-override">
      <h3>Model Override</h3>
      {AGENT_PROVIDERS.map(provider => {
        const modelCatalog = modelCatalogByProvider[provider]
        const customEnabled = settings.customModelEnabledByProvider[provider]
        const customModel = settings.customModelByProvider[provider]
        const customOptions = settings.customModelOptionsByProvider[provider]

        const allModels = [
          ...new Set(
            [...modelCatalog.models, ...customOptions, customModel]
              .map(model => model.trim())
              .filter(model => model.length > 0),
          ),
        ]

        const addInputValue = addModelInputByProvider[provider]
        const addInputPlaceholder =
          provider === 'codex' ? 'Example: gpt-5.2-codex' : 'Example: claude-sonnet-4-5-20250929'

        return (
          <article className="settings-provider-card" key={provider}>
            <div className="settings-provider-card__header">
              <strong>{AGENT_PROVIDER_LABEL[provider]}</strong>
              <button
                type="button"
                className="settings-provider-card__refresh"
                disabled={modelCatalog.isLoading}
                onClick={() => {
                  onRefreshProviderModels(provider)
                }}
              >
                {modelCatalog.isLoading ? 'Refreshing...' : 'Refresh Models'}
              </button>
            </div>

            <label className="settings-provider-card__toggle">
              <input
                type="checkbox"
                data-testid={`settings-custom-model-enabled-${provider}`}
                checked={customEnabled}
                onChange={event => {
                  onToggleCustomModelEnabled(provider, event.target.checked)
                }}
              />
              <span>Use custom model (unchecked = follow CLI default)</span>
            </label>

            <div
              className="settings-provider-card__model-list"
              data-testid={`settings-model-list-${provider}`}
            >
              {allModels.length === 0 ? (
                <p className="settings-provider-card__empty">No models yet. Add one below.</p>
              ) : (
                allModels.map(model => {
                  const isCustomOption = customOptions.includes(model)

                  return (
                    <div className="settings-provider-card__model-item" key={model}>
                      <label className="settings-provider-card__model-radio">
                        <input
                          type="radio"
                          name={`settings-model-${provider}`}
                          checked={customModel === model}
                          onChange={() => {
                            onSelectProviderModel(provider, model)
                          }}
                        />
                        <span>{model}</span>
                      </label>

                      {isCustomOption ? (
                        <button
                          type="button"
                          className="settings-provider-card__model-remove"
                          onClick={() => {
                            onRemoveCustomModelOption(provider, model)
                          }}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            <div className="settings-provider-card__add-row">
              <input
                type="text"
                data-testid={`settings-custom-model-add-input-${provider}`}
                value={addInputValue}
                placeholder={addInputPlaceholder}
                onChange={event => {
                  onChangeAddModelInput(provider, event.target.value)
                }}
                onKeyDown={event => {
                  if (event.key !== 'Enter') {
                    return
                  }

                  event.preventDefault()
                  onAddCustomModelOption(provider)
                }}
              />
              <button
                type="button"
                data-testid={`settings-custom-model-add-button-${provider}`}
                disabled={addInputValue.trim().length === 0}
                onClick={() => {
                  onAddCustomModelOption(provider)
                }}
              >
                Add
              </button>
            </div>

            <div className="settings-provider-card__meta">
              <span>
                Source: {modelCatalog.source ?? 'N/A'} · {modelCatalog.models.length} models
              </span>
              {modelCatalog.error ? (
                <span className="settings-provider-card__error">Error: {modelCatalog.error}</span>
              ) : modelCatalog.fetchedAt ? (
                <span>Updated: {new Date(modelCatalog.fetchedAt).toLocaleTimeString()}</span>
              ) : (
                <span>Waiting for first fetch...</span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
