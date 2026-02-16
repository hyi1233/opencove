import React from 'react'

export function TaskTagsSection(props: {
  tags: string[]
  addTaskTagInput: string
  onChangeAddTaskTagInput: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}): React.JSX.Element {
  const { tags, addTaskTagInput, onChangeAddTaskTagInput, onAddTag, onRemoveTag } = props

  return (
    <div className="settings-panel__section" id="settings-section-task-tags">
      <h3>Task Tags</h3>

      <div className="settings-provider-card__model-list" data-testid="settings-task-tag-list">
        {tags.map(tag => (
          <div className="settings-provider-card__model-item" key={tag}>
            <span className="settings-provider-card__model-radio">
              <span>{tag}</span>
            </span>
            <button
              type="button"
              className="settings-provider-card__model-remove"
              data-testid={`settings-task-tag-remove-${tag}`}
              disabled={tags.length <= 1}
              onClick={() => {
                onRemoveTag(tag)
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="settings-provider-card__add-row">
        <input
          type="text"
          data-testid="settings-task-tag-add-input"
          value={addTaskTagInput}
          placeholder="Example: perf"
          onChange={event => {
            onChangeAddTaskTagInput(event.target.value)
          }}
          onKeyDown={event => {
            if (event.key !== 'Enter') {
              return
            }

            event.preventDefault()
            onAddTag()
          }}
        />
        <button
          type="button"
          data-testid="settings-task-tag-add-button"
          disabled={addTaskTagInput.trim().length === 0}
          onClick={() => {
            onAddTag()
          }}
        >
          Add
        </button>
      </div>

      <p className="settings-panel__hint">
        Tasks can only select from this list; AI generation also picks from this list.
      </p>
    </div>
  )
}
