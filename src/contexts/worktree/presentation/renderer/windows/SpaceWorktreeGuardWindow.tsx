import React from 'react'
import { Bot, Monitor, TriangleAlert } from 'lucide-react'

export interface SpaceWorktreeGuardState {
  spaceName: string
  agentCount: number
  terminalCount: number
  pendingLabel: string
  allowMarkMismatch: boolean
  isBusy: boolean
  error: string | null
}

export function SpaceWorktreeGuardWindow({
  guard,
  onCancel,
  onMarkMismatchAndContinue,
  onCloseAllAndContinue,
}: {
  guard: SpaceWorktreeGuardState | null
  onCancel: () => void
  onMarkMismatchAndContinue: () => void
  onCloseAllAndContinue: () => void
}): React.JSX.Element | null {
  if (!guard) {
    return null
  }

  return (
    <div
      className="cove-window-backdrop workspace-space-worktree-guard-backdrop"
      data-testid="space-worktree-guard"
      onClick={() => {
        if (guard.isBusy) {
          return
        }

        onCancel()
      }}
    >
      <section
        className="cove-window workspace-space-worktree-guard"
        onClick={event => {
          event.stopPropagation()
        }}
      >
        <div className="workspace-space-worktree-guard__eyebrow">Action blocked</div>
        <div className="workspace-space-worktree-guard__hero">
          <div className="workspace-space-worktree-guard__alert-icon" aria-hidden="true">
            <TriangleAlert size={20} />
          </div>
          <div className="workspace-space-worktree-guard__hero-copy">
            <h3>{guard.pendingLabel}</h3>
            <p>
              Space <strong>{guard.spaceName}</strong> still has active windows bound to its current
              directory.
            </p>
          </div>
        </div>

        <section className="workspace-space-worktree-guard__notice">
          <strong>Close those windows before continuing.</strong>
          <p>
            {guard.allowMarkMismatch
              ? 'You can close everything now, or continue by marking the current windows as DIR MISMATCH.'
              : 'This action changes worktree binding and metadata, so every active window in this space must be closed first.'}
          </p>
        </section>

        <div className="workspace-space-worktree-guard__stats">
          <div className="workspace-space-worktree-guard__stat-card">
            <div className="workspace-space-worktree-guard__stat-label">
              <Bot size={15} aria-hidden="true" />
              <span>Agents</span>
            </div>
            <strong>{guard.agentCount}</strong>
          </div>
          <div className="workspace-space-worktree-guard__stat-card">
            <div className="workspace-space-worktree-guard__stat-label">
              <Monitor size={15} aria-hidden="true" />
              <span>Terminals</span>
            </div>
            <strong>{guard.terminalCount}</strong>
          </div>
        </div>

        {guard.error ? (
          <p className="cove-window__error workspace-space-worktree-guard__error">{guard.error}</p>
        ) : null}

        <div className="cove-window__actions workspace-space-worktree-guard__actions">
          <button
            type="button"
            className="cove-window__action cove-window__action--ghost"
            data-testid="space-worktree-guard-cancel"
            disabled={guard.isBusy}
            onClick={() => {
              onCancel()
            }}
          >
            Cancel
          </button>

          {guard.allowMarkMismatch ? (
            <button
              type="button"
              className="cove-window__action cove-window__action--secondary"
              data-testid="space-worktree-guard-mark-mismatch"
              disabled={guard.isBusy}
              onClick={() => {
                onMarkMismatchAndContinue()
              }}
            >
              Mark Mismatch & Continue
            </button>
          ) : null}

          <button
            type="button"
            className="cove-window__action cove-window__action--danger"
            data-testid="space-worktree-guard-close-all"
            disabled={guard.isBusy}
            onClick={() => {
              onCloseAllAndContinue()
            }}
          >
            Close All & Continue
          </button>
        </div>
      </section>
    </div>
  )
}
