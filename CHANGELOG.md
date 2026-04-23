# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Replace bundlephobia badge with bundlejs in README

## [1.0.2] - 2026-02-19

### Added
- Drag Handle story variant in Drag & Drop documentation

### Changed
- Use light banner as fallback image in npm README

## [1.0.1] - 2026-02-18

### Fixed
- Support React 19 in `peerDependencies`

### Changed
- Update badge colors to adapt to GitHub light/dark theme

## [1.0.0] - 2026-02-17

### Added
- Initial release of `lazy-tree-view`
- `LazyTreeView` component with lazy loading support for folder children
- Drag & Drop with configurable `allowDragAndDrop` and `useDragHandle` props
- Keyboard navigation and full accessibility (ARIA)
- Customization via `folderProps`, `itemProps` and `dragClassNames`
- Imperative API via `setTree`
- Error handling and retry for failed loads via `onError`
- Configurable animations
- CSS modules with customizable CSS variables
- Full TypeScript support
