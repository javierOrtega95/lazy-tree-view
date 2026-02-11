/**
 * Organization Hierarchy Mock Data
 * Simulates a company with departments, teams, and employees
 */
import type { TreeNode } from '../../types/tree'

export type Status = 'online' | 'offline' | 'away'
export type Permission = 'admin' | 'manager' | 'viewer'

export type PersonData = {
  role: string
  status: Status
  initials: string
  permission: Permission
  isLead?: boolean
  email: string
  location: string
  joinDate: string
  reportsTo?: string
}

export type DepartmentData = {
  color: string
  headcount: number
}

// Helper to create an employee node (leaf)
const person = (
  name: string,
  opts: {
    role: string
    status: Status
    permission: Permission
    isLead?: boolean
    email?: string
    location?: string
    joinDate?: string
    reportsTo?: string
  },
): TreeNode<{ data: PersonData }> => ({
  id: `person-${name.toLowerCase().replace(/\s/g, '-')}`,
  name,
  data: {
    role: opts.role,
    status: opts.status,
    permission: opts.permission,
    isLead: opts.isLead,
    initials: name
      .split(' ')
      .map((w) => w[0])
      .join(''),
    email: opts.email ?? `${name.toLowerCase().replace(/\s/g, '.')}@acme.com`,
    location: opts.location ?? 'San Francisco, CA',
    joinDate: opts.joinDate ?? 'Jan 2024',
    reportsTo: opts.reportsTo,
  },
})

// Helper to create a department/team folder (always lazy — no prefetched children)
const group = (
  id: string,
  name: string,
  data?: DepartmentData,
): TreeNode => ({
  id,
  name,
  children: [],
  ...(data && { data }),
})

// ---- Department colors ----

export const DEPT_COLORS: Record<string, string> = {
  Engineering: '#3178c6',
  Design: '#e5568b',
  Product: '#8b5cf6',
  Marketing: '#f59e0b',
  'Human Resources': '#10b981',
}

// ---- Main tree (all folders start empty — children loaded on demand) ----

export const ORG_TREE: TreeNode[] = [
  group('dept-engineering', 'Engineering', { color: DEPT_COLORS.Engineering, headcount: 14 }),
  group('dept-design', 'Design', { color: DEPT_COLORS.Design, headcount: 5 }),
  group('dept-product', 'Product', { color: DEPT_COLORS.Product, headcount: 6 }),
  group('dept-marketing', 'Marketing', { color: DEPT_COLORS.Marketing, headcount: 8 }),
  group('dept-hr', 'Human Resources', { color: DEPT_COLORS['Human Resources'], headcount: 4 }),
]

// ---- Lazy-loaded children (all levels) ----

const LAZY_CHILDREN: Record<string, TreeNode[]> = {
  // Departments → Teams / People
  Engineering: [
    group('team-frontend', 'Frontend', { color: DEPT_COLORS.Engineering, headcount: 3 }),
    group('team-backend', 'Backend', { color: DEPT_COLORS.Engineering, headcount: 3 }),
    group('team-devops', 'DevOps', { color: DEPT_COLORS.Engineering, headcount: 2 }),
  ],
  Design: [
    person('Grace Park', {
      role: 'Design Lead',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'Los Angeles, CA',
      joinDate: 'May 2021',
      reportsTo: 'CEO',
    }),
    person('Henry Adams', {
      role: 'Senior Designer',
      status: 'away',
      permission: 'manager',
      location: 'Portland, OR',
      joinDate: 'Nov 2022',
      reportsTo: 'Grace Park',
    }),
    person('Iris Wang', {
      role: 'UX Researcher',
      status: 'online',
      permission: 'viewer',
      location: 'San Francisco, CA',
      joinDate: 'Apr 2024',
      reportsTo: 'Grace Park',
    }),
  ],
  Product: [
    person('Jack Brown', {
      role: 'VP Product',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'San Francisco, CA',
      joinDate: 'Feb 2020',
      reportsTo: 'CEO',
    }),
    person('Kate Miller', {
      role: 'Product Manager',
      status: 'online',
      permission: 'manager',
      location: 'Chicago, IL',
      joinDate: 'Jul 2023',
      reportsTo: 'Jack Brown',
    }),
    person('Leo Garcia', {
      role: 'Product Analyst',
      status: 'offline',
      permission: 'viewer',
      location: 'Miami, FL',
      joinDate: 'Jan 2025',
      reportsTo: 'Kate Miller',
    }),
  ],
  Marketing: [
    person('Oscar Davis', {
      role: 'Marketing Director',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'New York, NY',
      joinDate: 'Jun 2021',
      reportsTo: 'CEO',
    }),
    person('Paula Scott', {
      role: 'Content Strategist',
      status: 'offline',
      permission: 'manager',
      location: 'Austin, TX',
      joinDate: 'Dec 2023',
      reportsTo: 'Oscar Davis',
    }),
    person('Quinn Reed', {
      role: 'Social Media Manager',
      status: 'online',
      permission: 'viewer',
      location: 'Los Angeles, CA',
      joinDate: 'Aug 2024',
      reportsTo: 'Oscar Davis',
    }),
  ],
  'Human Resources': [
    person('Rachel Green', {
      role: 'HR Director',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'San Francisco, CA',
      joinDate: 'Apr 2020',
      reportsTo: 'CEO',
    }),
    person('Sam Wilson', {
      role: 'Recruiter',
      status: 'away',
      permission: 'viewer',
      location: 'Remote',
      joinDate: 'Sep 2024',
      reportsTo: 'Rachel Green',
    }),
  ],

  // Teams → People
  Frontend: [
    person('Alice Chen', {
      role: 'Senior Engineer',
      status: 'online',
      permission: 'manager',
      isLead: true,
      location: 'San Francisco, CA',
      joinDate: 'Mar 2021',
      reportsTo: 'CTO',
    }),
    person('Bob Martinez', {
      role: 'Engineer',
      status: 'online',
      permission: 'viewer',
      joinDate: 'Sep 2023',
      reportsTo: 'Alice Chen',
    }),
    person('Carol White', {
      role: 'Junior Engineer',
      status: 'away',
      permission: 'viewer',
      location: 'Austin, TX',
      joinDate: 'Jun 2024',
      reportsTo: 'Alice Chen',
    }),
  ],
  Backend: [
    person('David Kim', {
      role: 'Staff Engineer',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'Seattle, WA',
      joinDate: 'Jan 2020',
      reportsTo: 'CTO',
    }),
    person('Eva Johnson', {
      role: 'Senior Engineer',
      status: 'offline',
      permission: 'manager',
      location: 'New York, NY',
      joinDate: 'Aug 2022',
      reportsTo: 'David Kim',
    }),
    person('Frank Lee', {
      role: 'Engineer',
      status: 'online',
      permission: 'viewer',
      joinDate: 'Feb 2024',
      reportsTo: 'David Kim',
    }),
  ],
  DevOps: [
    person('Mike Turner', {
      role: 'DevOps Lead',
      status: 'online',
      permission: 'admin',
      isLead: true,
      location: 'Denver, CO',
      joinDate: 'Oct 2021',
      reportsTo: 'CTO',
    }),
    person('Nina Patel', {
      role: 'SRE Engineer',
      status: 'away',
      permission: 'viewer',
      location: 'San Francisco, CA',
      joinDate: 'Mar 2024',
      reportsTo: 'Mike Turner',
    }),
  ],
}

export async function loadChildren(folderName: string): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))
  return LAZY_CHILDREN[folderName] ?? []
}
