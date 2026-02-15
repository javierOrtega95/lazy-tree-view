import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useState } from 'react'

import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { BaseNodeProps, BranchProps } from '../../lazy-tree-view/types'
import { isBranchNode } from '../../lazy-tree-view/utils/validations'
import type { DropData } from '../../types/dnd'
import { DropPosition } from '../../types/dnd'
import type { BranchNode } from '../../types/tree'
import { ChevronRightIcon, LoaderIcon } from '../assets/icons/file-icons'
import '../assets/styles/org-hierarchy.css'

import {
  DEPT_COLORS,
  ORG_TREE,
  loadChildren,
  type DepartmentData,
  type Permission,
  type PersonData,
  type Status,
} from './org-hierarchy.mock'

// ---- SVG Icons (Lucide-based) ----

const svgDefaults = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const BuildingIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <rect width='16' height='20' x='4' y='2' rx='2' ry='2' />
    <path d='M9 22v-4h6v4' />
    <path d='M8 6h.01' />
    <path d='M16 6h.01' />
    <path d='M12 6h.01' />
    <path d='M12 10h.01' />
    <path d='M12 14h.01' />
    <path d='M16 10h.01' />
    <path d='M16 14h.01' />
    <path d='M8 10h.01' />
    <path d='M8 14h.01' />
  </svg>
)

const UsersIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
)

const MailIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <rect width='20' height='16' x='2' y='4' rx='2' />
    <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
  </svg>
)

const MapPinIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
    <circle cx='12' cy='10' r='3' />
  </svg>
)

const CalendarIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <path d='M8 2v4' />
    <path d='M16 2v4' />
    <rect width='18' height='18' x='3' y='4' rx='2' />
    <path d='M3 10h18' />
  </svg>
)

const UserIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
)

const ShieldIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...svgDefaults} {...props}>
    <path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' />
  </svg>
)

const StarIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={8}
    height={8}
    viewBox='0 0 24 24'
    fill='currentColor'
    stroke='none'
    {...props}
  >
    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
  </svg>
)

// ---- Helpers ----

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#6366f1',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getDeptColor(name: string): string {
  return DEPT_COLORS[name] ?? '#64748b'
}

const PERMISSION_LABELS: Record<Permission, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
}

// ---- Shared sub-components ----

const StatusDot: FC<{ status: Status }> = ({ status }) => (
  <span className={`org-hierarchy__status org-hierarchy__status--${status}`} />
)

const LeadBadge: FC = () => (
  <span className='org-hierarchy__lead-badge'>
    <StarIcon />
  </span>
)

const PermissionBadge: FC<{ permission: Permission; className?: string }> = ({
  permission,
  className = '',
}) => (
  <span className={`org-hierarchy__badge org-hierarchy__badge--${permission} ${className}`}>
    {PERMISSION_LABELS[permission]}
  </span>
)

// ---- Selection types ----

type SelectedPerson = {
  type: 'person'
  name: string
  data: PersonData
}

type SelectedDept = {
  type: 'dept'
  name: string
  data: DepartmentData
}

type Selection = SelectedPerson | SelectedDept | null

// ---- Custom Tree Components ----

type OrgBranchExtra = {
  data?: DepartmentData
  onSelect?: (selection: Selection) => void
}

const OrgBranch: FC<BranchProps & OrgBranchExtra> = ({
  name,
  children,
  isOpen = false,
  isLoading = false,
  depth,
  data,
  onToggleOpen,
  onSelect,
}) => {
  const color = data?.color ?? getDeptColor(name)
  const count = data?.headcount ?? children.length

  return (
    <div
      className='org-hierarchy__row'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={(e) => {
        onToggleOpen(e)
        if (data) onSelect?.({ type: 'dept', name, data })
      }}
    >
      <span className={`org-hierarchy__chevron ${isOpen ? 'org-hierarchy__chevron--open' : ''}`}>
        {isLoading ? (
          <span className='org-hierarchy__loader'>
            <LoaderIcon width={14} height={14} />
          </span>
        ) : (
          <ChevronRightIcon width={14} height={14} />
        )}
      </span>

      <span className='org-hierarchy__dept-dot' style={{ background: color }} />

      <div className='org-hierarchy__dept-info'>
        <span className='org-hierarchy__dept-name'>{name}</span>
        <span className='org-hierarchy__dept-count'>
          {count} {count === 1 ? 'person' : 'people'}
        </span>
      </div>
    </div>
  )
}

type OrgItemExtra = {
  data?: PersonData
  onSelect?: (selection: Selection) => void
}

const OrgItem: FC<BaseNodeProps & OrgItemExtra> = ({
  name,
  depth,
  data,
  onDragStart,
  onSelect,
}) => {
  const role = data?.role ?? ''
  const status = data?.status ?? 'offline'
  const initials = data?.initials ?? name.charAt(0)
  const permission = data?.permission ?? 'viewer'
  const isLead = data?.isLead ?? false

  return (
    <div
      className='org-hierarchy__row'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={() => data && onSelect?.({ type: 'person', name, data })}
      draggable
      onDragStart={onDragStart}
    >
      <span className='org-hierarchy__chevron org-hierarchy__chevron--hidden'>
        <ChevronRightIcon width={14} height={14} />
      </span>

      <div className='org-hierarchy__avatar' style={{ background: getAvatarColor(name) }}>
        {initials}
        {isLead ? <LeadBadge /> : <StatusDot status={status} />}
      </div>

      <div className='org-hierarchy__info'>
        <div className='org-hierarchy__name-row'>
          <span className='org-hierarchy__name'>{name}</span>
          <PermissionBadge permission={permission} />
        </div>
        <span className='org-hierarchy__role'>{role}</span>
      </div>
    </div>
  )
}

// ---- Detail Panel ----

const STATUS_LABEL: Record<Status, string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
}

const DetailPanel: FC<{ selection: Selection }> = ({ selection }) => {
  if (!selection) {
    return (
      <div className='org-detail__empty'>
        <UsersIcon width={32} height={32} />
        <p>Select a person to view profile</p>
      </div>
    )
  }

  if (selection.type === 'dept') {
    return (
      <div className='org-detail__card'>
        <div className='org-detail__dept-header'>
          <span
            className='org-detail__dept-color'
            style={{ background: selection.data.color }}
          />
          <div>
            <div className='org-detail__dept-name'>{selection.name}</div>
            <div className='org-detail__dept-count'>
              {selection.data.headcount} {selection.data.headcount === 1 ? 'member' : 'members'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { data } = selection

  return (
    <div className='org-detail__card'>
      <div className='org-detail__profile'>
        <div
          className='org-detail__avatar'
          style={{ background: getAvatarColor(selection.name) }}
        >
          {data.initials}
          {data.isLead ? <LeadBadge /> : <StatusDot status={data.status} />}
        </div>
        <span className='org-detail__name'>{selection.name}</span>
        <span className='org-detail__role'>{data.role}</span>
        <PermissionBadge permission={data.permission} className='org-detail__badge' />
      </div>

      <div className='org-detail__fields'>
        <div className='org-detail__field'>
          <span className='org-detail__field-icon'>
            <span
              className={`org-hierarchy__status org-hierarchy__status--${data.status}`}
              style={{ position: 'static', border: 'none', width: 8, height: 8 }}
            />
          </span>
          <div className='org-detail__field-content'>
            <span className='org-detail__field-label'>Status</span>
            <span className='org-detail__field-value'>{STATUS_LABEL[data.status]}</span>
          </div>
        </div>

        <div className='org-detail__field'>
          <span className='org-detail__field-icon'><MailIcon width={14} height={14} /></span>
          <div className='org-detail__field-content'>
            <span className='org-detail__field-label'>Email</span>
            <span className='org-detail__field-value'>{data.email}</span>
          </div>
        </div>

        <div className='org-detail__field'>
          <span className='org-detail__field-icon'><MapPinIcon width={14} height={14} /></span>
          <div className='org-detail__field-content'>
            <span className='org-detail__field-label'>Location</span>
            <span className='org-detail__field-value'>{data.location}</span>
          </div>
        </div>

        <div className='org-detail__field'>
          <span className='org-detail__field-icon'><CalendarIcon width={14} height={14} /></span>
          <div className='org-detail__field-content'>
            <span className='org-detail__field-label'>Joined</span>
            <span className='org-detail__field-value'>{data.joinDate}</span>
          </div>
        </div>

        {data.reportsTo && (
          <div className='org-detail__field'>
            <span className='org-detail__field-icon'><UserIcon width={14} height={14} /></span>
            <div className='org-detail__field-content'>
              <span className='org-detail__field-label'>Reports to</span>
              <span className='org-detail__field-value'>{data.reportsTo}</span>
            </div>
          </div>
        )}

        <div className='org-detail__field'>
          <span className='org-detail__field-icon'><ShieldIcon width={14} height={14} /></span>
          <div className='org-detail__field-content'>
            <span className='org-detail__field-label'>Permission</span>
            <span className='org-detail__field-value'>
              {PERMISSION_LABELS[data.permission]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Drag & Drop rules ----
//
// Admins    → can be moved anywhere
// Managers  → can be moved anywhere except HR (restricted department)
// Viewers   → can only be reordered within the same team (not transferred)
// Folders   → departments and teams can't be dragged

function canDrop({ source, target, position, prevParent, nextParent }: DropData): boolean {
  // Folders (departments/teams) can't be moved
  if (isBranchNode(source)) return false

  const permission = (source as { data?: PersonData }).data?.permission

  // HR is restricted — only admins can be dropped there
  const targetIsHR = target.id === 'dept-hr'
    || nextParent?.id === 'dept-hr'
  if (targetIsHR && permission !== 'admin') return false

  // Admins can go anywhere
  if (permission === 'admin') return true

  // Managers can go anywhere (except HR, handled above)
  if (permission === 'manager') return true

  // Viewers can only be reordered within their current team
  if (permission === 'viewer') {
    if (position === DropPosition.Inside) return false
    if (prevParent?.id !== nextParent?.id) return false
  }

  return true
}

// ---- Story Component ----

type OrgHierarchyProps = {
  allowDragAndDrop: boolean
  disableAnimations: boolean
  animationDuration: number
}

const OrgHierarchyDemo: FC<OrgHierarchyProps> = ({
  allowDragAndDrop = true,
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const [selection, setSelection] = useState<Selection>(null)

  return (
    <div className='org-window'>
      <div className='org-window__titlebar'>
        <span className='org-window__dot org-window__dot--red' />
        <span className='org-window__dot org-window__dot--yellow' />
        <span className='org-window__dot org-window__dot--green' />
      </div>
      <div className='org-split'>
        <div className='org-hierarchy org-split__sidebar'>
          <div className='org-hierarchy__header'>
            <span className='org-hierarchy__header-icon'>
              <BuildingIcon width={16} height={16} />
            </span>
            Acme Corp
          </div>
          <LazyTreeView
            initialTree={ORG_TREE}
            loadChildren={(branch: BranchNode) => loadChildren(branch.name)}
            branch={OrgBranch}
            item={OrgItem}
            allowDragAndDrop={allowDragAndDrop}
            canDrop={canDrop}
            disableAnimations={disableAnimations}
            animationDuration={animationDuration}
            branchProps={{ onSelect: setSelection }}
            itemProps={{ onSelect: setSelection }}
            dragClassNames={{
              dragOver: 'org-drag-over',
              dragBefore: 'org-drop-before',
              dragAfter: 'org-drop-after',
              dropNotAllowed: 'org-drop-not-allowed',
            }}
          />
        </div>
        <div className='org-detail'>
          <DetailPanel selection={selection} />
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const meta: Meta<typeof OrgHierarchyDemo> = {
  title: 'Use Cases/Organization Hierarchy',
  component: OrgHierarchyDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'A corporate organization chart built with **LazyTreeView**. Demonstrates:',
          '',
          '- **Custom renderers**: departments with color bars, employees with avatars and status badges',
          '- **Permission badges**: Admin, Manager, and Viewer roles displayed inline',
          '- **Team leads**: star indicator on lead avatars',
          '- **Detail panel**: click a person to see their full profile (email, location, reports to)',
          '- **Lazy loading**: all departments and teams load their members on demand',
          '- **Permission-based drag & drop**: Admins can be moved anywhere. Managers can go anywhere except HR. Viewers can only be reordered within their team. Departments and teams can\'t be dragged.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  args: {
    allowDragAndDrop: true,
    disableAnimations: false,
    animationDuration: 300,
  },
  argTypes: {
    allowDragAndDrop: {
      description: 'Enable permission-based drag & drop. Admins move freely, Managers can\'t enter HR, Viewers can only reorder within their team.',
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    disableAnimations: {
      description: 'Disable expand/collapse animations.',
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    animationDuration: {
      description: 'Duration of expand/collapse animations in milliseconds.',
      control: { type: 'range', min: 0, max: 1000, step: 50 },
      table: { category: 'Behavior', defaultValue: { summary: '300' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof OrgHierarchyDemo>

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'
import { isBranchNode } from 'lazy-tree-view/utils'

// Permission-based drop rules
function canDrop({ source, target, position, prevParent, nextParent }) {
  if (isBranchNode(source)) return false        // departments can't be dragged

  const { permission } = source.data
  const targetIsHR = target.id === 'dept-hr' || nextParent?.id === 'dept-hr'

  if (targetIsHR && permission !== 'admin') return false  // HR is restricted
  if (permission === 'admin') return true                 // admins go anywhere
  if (permission === 'manager') return true               // managers go anywhere (except HR)

  // Viewers can only reorder within their team
  if (position === 'inside') return false
  return prevParent?.id === nextParent?.id
}

<LazyTreeView
  initialTree={orgTree}
  loadChildren={(folder) => fetchTeamMembers(folder.name)}
  branch={DeptBranch}
  item={EmployeeItem}
  allowDragAndDrop
  canDrop={canDrop}
  dragClassNames={{
    dragOver: 'org-drag-over',
    dragBefore: 'org-drop-before',
    dragAfter: 'org-drop-after',
    dropNotAllowed: 'org-drop-not-allowed',
  }}
/>
`.trim()

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
