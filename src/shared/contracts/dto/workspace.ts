export interface WorkspaceDirectory {
  id: string
  name: string
  path: string
}

export interface EnsureDirectoryInput {
  path: string
}

export interface CopyWorkspacePathInput {
  path: string
}

export const WORKSPACE_PATH_OPENER_IDS = [
  'vscode',
  'cursor',
  'windsurf',
  'zed',
  'antigravity',
  'vscode-insiders',
  'vscodium',
  'intellij-idea',
  'fleet',
  'android-studio',
  'xcode',
  'pycharm',
  'webstorm',
  'goland',
  'clion',
  'phpstorm',
  'rubymine',
  'datagrip',
  'rider',
  'sublime-text',
  'nova',
  'bbedit',
  'textmate',
  'coteditor',
  'finder',
  'terminal',
  'iterm',
  'warp',
  'ghostty',
] as const

export type WorkspacePathOpenerId = (typeof WORKSPACE_PATH_OPENER_IDS)[number]

export interface WorkspacePathOpener {
  id: WorkspacePathOpenerId
  label: string
}

export interface ListWorkspacePathOpenersResult {
  openers: WorkspacePathOpener[]
}

export interface OpenWorkspacePathInput {
  path: string
  openerId: WorkspacePathOpenerId
}
