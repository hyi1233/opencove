import React from 'react'
import { CANVAS_INPUT_MODES, type CanvasInputMode } from '../../agentConfig'

export function CanvasSection(props: {
  canvasInputMode: CanvasInputMode
  normalizeZoomOnTerminalClick: boolean
  onChangeCanvasInputMode: (mode: CanvasInputMode) => void
  onChangeNormalizeZoomOnTerminalClick: (enabled: boolean) => void
}): React.JSX.Element {
  const {
    canvasInputMode,
    normalizeZoomOnTerminalClick,
    onChangeCanvasInputMode,
    onChangeNormalizeZoomOnTerminalClick,
  } = props

  return (
    <div className="settings-panel__section" id="settings-section-canvas">
      <h3>Canvas Interaction</h3>
      <div className="settings-panel__row">
        <span>Input Mode</span>
        <select
          id="settings-canvas-input-mode"
          data-testid="settings-canvas-input-mode"
          value={canvasInputMode}
          onChange={event => {
            onChangeCanvasInputMode(event.target.value as CanvasInputMode)
          }}
        >
          {CANVAS_INPUT_MODES.map(mode => (
            <option key={mode} value={mode}>
              {mode === 'auto'
                ? 'Auto (Detect from gestures)'
                : mode === 'trackpad'
                  ? 'Trackpad (Drag selects)'
                  : 'Mouse (Shift+Drag selects)'}
            </option>
          ))}
        </select>
      </div>
      <label className="settings-provider-card__toggle">
        <input
          id="settings-normalize-zoom-on-terminal-click"
          data-testid="settings-normalize-zoom-on-terminal-click"
          type="checkbox"
          checked={normalizeZoomOnTerminalClick}
          onChange={event => {
            onChangeNormalizeZoomOnTerminalClick(event.target.checked)
          }}
        />
        <span>Click terminal auto-zooms canvas to 100%</span>
      </label>
      <p className="settings-panel__hint">
        Auto mode infers trackpad vs mouse from wheel and pinch input. If detection does not match
        your hardware, choose a fixed mode.
      </p>
    </div>
  )
}
