/**
 * File icon utilities and mappings
 */
import type { FC, SVGProps } from 'react'

import {
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileJsonIcon,
  FileTextIcon,
  GitBranchIcon,
  PackageIcon,
  SettingsIcon,
} from './file-icons'

type IconProps = SVGProps<SVGSVGElement>

// Define colors for different file types (VSCode-inspired)
export const FILE_COLORS = {
  typescript: '#3178c6',
  javascript: '#f7df1e',
  react: '#61dafb',
  json: '#cbcb41',
  markdown: '#519aba',
  css: '#563d7c',
  html: '#e34c26',
  image: '#a074c4',
  config: '#6d8086',
  git: '#f14e32',
  package: '#cb3837',
  text: '#8a8a8a',
  folder: '#54aeff',
  folderOpen: '#218bff',
} as const

// File extension to icon + color mapping
type FileIconConfig = {
  icon: FC<IconProps>
  color: string
}

export const FILE_TYPE_MAP: Record<string, FileIconConfig> = {
  // TypeScript
  '.ts': { icon: FileCodeIcon, color: FILE_COLORS.typescript },
  '.tsx': { icon: FileCodeIcon, color: FILE_COLORS.react },
  '.d.ts': { icon: FileCodeIcon, color: FILE_COLORS.typescript },
  // JavaScript
  '.js': { icon: FileCodeIcon, color: FILE_COLORS.javascript },
  '.jsx': { icon: FileCodeIcon, color: FILE_COLORS.react },
  '.mjs': { icon: FileCodeIcon, color: FILE_COLORS.javascript },
  '.cjs': { icon: FileCodeIcon, color: FILE_COLORS.javascript },
  // Data
  '.json': { icon: FileJsonIcon, color: FILE_COLORS.json },
  '.yaml': { icon: FileTextIcon, color: FILE_COLORS.config },
  '.yml': { icon: FileTextIcon, color: FILE_COLORS.config },
  // Markup
  '.md': { icon: FileTextIcon, color: FILE_COLORS.markdown },
  '.mdx': { icon: FileTextIcon, color: FILE_COLORS.markdown },
  '.html': { icon: FileCodeIcon, color: FILE_COLORS.html },
  '.htm': { icon: FileCodeIcon, color: FILE_COLORS.html },
  // Styles
  '.css': { icon: FileCodeIcon, color: FILE_COLORS.css },
  '.scss': { icon: FileCodeIcon, color: FILE_COLORS.css },
  '.sass': { icon: FileCodeIcon, color: FILE_COLORS.css },
  '.less': { icon: FileCodeIcon, color: FILE_COLORS.css },
  // Images
  '.png': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.jpg': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.jpeg': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.gif': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.svg': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.webp': { icon: FileImageIcon, color: FILE_COLORS.image },
  '.ico': { icon: FileImageIcon, color: FILE_COLORS.image },
  // Config
  '.env': { icon: SettingsIcon, color: FILE_COLORS.config },
  '.config': { icon: SettingsIcon, color: FILE_COLORS.config },
  '.gitignore': { icon: GitBranchIcon, color: FILE_COLORS.git },
  // Text
  '.txt': { icon: FileTextIcon, color: FILE_COLORS.text },
}

// Special filenames mapping
export const FILENAME_MAP: Record<string, FileIconConfig> = {
  'package.json': { icon: PackageIcon, color: FILE_COLORS.package },
  'package-lock.json': { icon: PackageIcon, color: FILE_COLORS.package },
  'tsconfig.json': { icon: SettingsIcon, color: FILE_COLORS.typescript },
  'vite.config.ts': { icon: SettingsIcon, color: FILE_COLORS.config },
  'vite.config.js': { icon: SettingsIcon, color: FILE_COLORS.config },
  '.gitignore': { icon: GitBranchIcon, color: FILE_COLORS.git },
  '.env': { icon: SettingsIcon, color: FILE_COLORS.config },
  '.env.local': { icon: SettingsIcon, color: FILE_COLORS.config },
  'README.md': { icon: FileTextIcon, color: FILE_COLORS.markdown },
  LICENSE: { icon: FileTextIcon, color: FILE_COLORS.text },
}

export function getFileIconConfig(filename: string): FileIconConfig {
  // Check special filenames first
  if (FILENAME_MAP[filename]) {
    return FILENAME_MAP[filename]
  }

  // Get extension
  const ext = filename.includes('.') ? '.' + filename.split('.').pop()?.toLowerCase() : ''

  return FILE_TYPE_MAP[ext] || { icon: FileIcon, color: FILE_COLORS.text }
}
