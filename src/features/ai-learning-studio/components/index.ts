// Client-safe sub-barrel — mirrors `learning-mode-runtime/components`'s
// own convention. Neither component here has a server-only import of its
// own, but any future client component in this feature must import
// presentational pieces from here, never from the root barrel (which also
// exports server-only queries like `getStudioHomeViewState`/
// `resolveLearningWorkspaceState`).
export { StudioHome } from './StudioHome'
export { LearningWorkspaceShell } from './LearningWorkspaceShell'
