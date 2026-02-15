/**
 * Knowledge Base Mock Data
 * Simulates a help center with categories and articles,
 * including a server-side search endpoint.
 */
import type { TreeNode } from '../../types/tree'

export type ArticleData = {
  summary: string
  tags: string[]
  updatedAt: string
}

type CategoryData = {
  icon: string
  articleCount: number
}

// ---- Helpers ----

const article = (
  id: string,
  name: string,
  opts: { summary: string; tags: string[]; updatedAt?: string },
): TreeNode<{ data: ArticleData }> => ({
  id,
  name,
  data: {
    summary: opts.summary,
    tags: opts.tags,
    updatedAt: opts.updatedAt ?? 'Jan 2025',
  },
})

const category = (
  id: string,
  name: string,
  icon: string,
  articleCount: number,
): TreeNode<{ data: CategoryData }> => ({
  id,
  name,
  children: [],
  data: { icon, articleCount },
})

// ---- Full article database (simulates what the server knows) ----

const ALL_ARTICLES: Record<string, TreeNode<{ data: ArticleData }>[]> = {
  'cat-getting-started': [
    article('art-1', 'Creating your first project', {
      summary:
        'Learn how to set up a new project from scratch. This guide walks you through installation, configuration, and creating your first component.',
      tags: ['setup', 'installation', 'quickstart'],
      updatedAt: 'Dec 2024',
    }),
    article('art-2', 'Understanding the dashboard', {
      summary:
        'A complete tour of the main dashboard: navigation, widgets, settings panel, and how to customize your workspace layout.',
      tags: ['dashboard', 'navigation', 'ui'],
      updatedAt: 'Nov 2024',
    }),
    article('art-3', 'Importing existing data', {
      summary:
        'Step-by-step instructions for importing data from CSV, JSON, or other platforms. Includes handling common import errors.',
      tags: ['import', 'data', 'migration', 'csv'],
      updatedAt: 'Jan 2025',
    }),
    article('art-4', 'Keyboard shortcuts reference', {
      summary:
        'Complete list of keyboard shortcuts to speed up your workflow. Covers navigation, editing, and command palette.',
      tags: ['keyboard', 'shortcuts', 'productivity'],
      updatedAt: 'Oct 2024',
    }),
  ],
  'cat-account': [
    article('art-5', 'Managing your subscription', {
      summary:
        'How to upgrade, downgrade, or cancel your subscription plan. Includes information about billing cycles and refunds.',
      tags: ['billing', 'subscription', 'plans', 'pricing'],
      updatedAt: 'Jan 2025',
    }),
    article('art-6', 'Two-factor authentication setup', {
      summary:
        'Enable 2FA for your account using an authenticator app or SMS. Includes backup codes and recovery options.',
      tags: ['security', '2fa', 'authentication'],
      updatedAt: 'Dec 2024',
    }),
    article('art-7', 'Team roles and permissions', {
      summary:
        'Understanding Owner, Admin, Editor, and Viewer roles. How to invite team members and manage access control.',
      tags: ['teams', 'roles', 'permissions', 'access'],
      updatedAt: 'Nov 2024',
    }),
    article('art-8', 'Deleting your account', {
      summary:
        'How to permanently delete your account and all associated data. This action cannot be undone.',
      tags: ['account', 'delete', 'data'],
      updatedAt: 'Sep 2024',
    }),
  ],
  'cat-api': [
    article('art-9', 'Authentication & API keys', {
      summary:
        'How to generate API keys, use bearer tokens, and implement OAuth2 flows for server-to-server communication.',
      tags: ['api', 'authentication', 'oauth', 'tokens'],
      updatedAt: 'Jan 2025',
    }),
    article('art-10', 'Rate limits and quotas', {
      summary:
        'Details on API rate limits per plan, how to handle 429 responses, and best practices for staying within quotas.',
      tags: ['api', 'rate-limit', 'quotas', 'performance'],
      updatedAt: 'Dec 2024',
    }),
    article('art-11', 'Webhooks configuration', {
      summary:
        'Set up webhooks to receive real-time notifications. Covers event types, payload formats, and retry policies.',
      tags: ['webhooks', 'events', 'realtime', 'notifications'],
      updatedAt: 'Nov 2024',
    }),
    article('art-12', 'Pagination and filtering', {
      summary:
        'How to paginate large result sets using cursor-based pagination. Includes filtering, sorting, and field selection.',
      tags: ['api', 'pagination', 'filtering', 'queries'],
      updatedAt: 'Oct 2024',
    }),
    article('art-13', 'Error codes reference', {
      summary:
        'Complete reference of API error codes (4xx and 5xx), their meanings, and recommended resolution steps.',
      tags: ['api', 'errors', 'debugging', 'reference'],
      updatedAt: 'Jan 2025',
    }),
  ],
  'cat-troubleshooting': [
    article('art-14', 'Login issues and password reset', {
      summary:
        'Troubleshoot common login problems: forgotten passwords, locked accounts, SSO configuration, and session timeouts.',
      tags: ['login', 'password', 'sso', 'authentication'],
      updatedAt: 'Jan 2025',
    }),
    article('art-15', 'Slow performance diagnosis', {
      summary:
        'Steps to diagnose and fix slow loading times. Covers browser cache, network issues, and account-level performance settings.',
      tags: ['performance', 'slow', 'cache', 'debugging'],
      updatedAt: 'Dec 2024',
    }),
    article('art-16', 'Data sync errors', {
      summary:
        'Resolve synchronization conflicts between devices or integrations. Includes manual sync triggers and conflict resolution.',
      tags: ['sync', 'errors', 'data', 'conflict'],
      updatedAt: 'Nov 2024',
    }),
    article('art-17', 'Export failures', {
      summary:
        'Fix common export issues: timeout errors, missing fields, file format problems, and large dataset handling.',
      tags: ['export', 'errors', 'data', 'files'],
      updatedAt: 'Oct 2024',
    }),
  ],
  'cat-integrations': [
    article('art-18', 'Slack notifications', {
      summary:
        'Connect your workspace to Slack for real-time alerts. Configure channels, notification types, and quiet hours.',
      tags: ['slack', 'notifications', 'integration'],
      updatedAt: 'Jan 2025',
    }),
    article('art-19', 'GitHub & GitLab sync', {
      summary:
        'Sync repositories and automate workflows with GitHub or GitLab. Covers branch tracking, PR status, and deploy hooks.',
      tags: ['github', 'gitlab', 'git', 'ci-cd', 'integration'],
      updatedAt: 'Dec 2024',
    }),
    article('art-20', 'Zapier automation', {
      summary:
        'Build custom automations with Zapier triggers and actions. Includes popular workflow templates and troubleshooting.',
      tags: ['zapier', 'automation', 'workflows', 'integration'],
      updatedAt: 'Nov 2024',
    }),
    article('art-21', 'SSO with Okta or Azure AD', {
      summary:
        'Enterprise Single Sign-On setup guide for Okta and Azure Active Directory. SAML 2.0 and OIDC configuration.',
      tags: ['sso', 'okta', 'azure', 'enterprise', 'security'],
      updatedAt: 'Jan 2025',
    }),
  ],
}

// ---- Initial tree (categories only, lazy-loaded) ----

export const KB_TREE: TreeNode[] = [
  category('cat-getting-started', 'Getting Started', 'book', 4),
  category('cat-account', 'Account & Billing', 'credit-card', 4),
  category('cat-api', 'API Reference', 'code', 5),
  category('cat-troubleshooting', 'Troubleshooting', 'wrench', 4),
  category('cat-integrations', 'Integrations', 'plug', 4),
]

export { type CategoryData }

// ---- Lazy load (category expand) ----

export async function loadChildren(folder: { id: string }): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))
  return ALL_ARTICLES[folder.id] ?? []
}

// ---- Server-side search simulation ----

export async function searchArticles(query: string): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300))

  const q = query.toLowerCase().trim()
  if (!q) return KB_TREE

  const results: TreeNode[] = []

  for (const cat of KB_TREE) {
    const articles = ALL_ARTICLES[cat.id] ?? []
    const matches = articles.filter((art) => {
      const d = art.data as ArticleData
      return (
        art.name.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      )
    })

    if (matches.length > 0) {
      results.push({
        ...cat,
        children: matches,
        isOpen: true,
        hasFetched: true,
      })
    }
  }

  return results
}
