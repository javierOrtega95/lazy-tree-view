import type { Meta, StoryObj } from '@storybook/react'
import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { BaseNodeProps, FolderProps, LazyTreeViewHandle } from '../../lazy-tree-view/types'
import { ChevronRightIcon, LoaderIcon } from '../assets/icons/file-icons'
import '../assets/styles/help-center.css'

import {
  type ArticleData,
  type CategoryData,
  KB_TREE,
  loadChildren,
  searchArticles,
} from './help-center.mock'

// ---- SVG Icons ----

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

const SearchIcon: FC = () => (
  <svg {...svgDefaults}>
    <circle cx='11' cy='11' r='8' />
    <path d='m21 21-4.3-4.3' />
  </svg>
)

const BookIcon: FC = () => (
  <svg {...svgDefaults}>
    <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' />
  </svg>
)

const CreditCardIcon: FC = () => (
  <svg {...svgDefaults}>
    <rect width='20' height='14' x='2' y='5' rx='2' />
    <line x1='2' x2='22' y1='10' y2='10' />
  </svg>
)

const CodeIcon: FC = () => (
  <svg {...svgDefaults}>
    <polyline points='16 18 22 12 16 6' />
    <polyline points='8 6 2 12 8 18' />
  </svg>
)

const WrenchIcon: FC = () => (
  <svg {...svgDefaults}>
    <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
  </svg>
)

const PlugIcon: FC = () => (
  <svg {...svgDefaults}>
    <path d='M12 22v-5' />
    <path d='M9 8V2' />
    <path d='M15 8V2' />
    <path d='M18 8v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z' />
  </svg>
)

const FileTextIcon: FC = () => (
  <svg {...svgDefaults} width={14} height={14}>
    <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
    <path d='M14 2v4a2 2 0 0 0 2 2h4' />
    <path d='M10 9H8' />
    <path d='M16 13H8' />
    <path d='M16 17H8' />
  </svg>
)

const SearchXIcon: FC = () => (
  <svg {...svgDefaults} width={32} height={32}>
    <circle cx='11' cy='11' r='8' />
    <path d='m21 21-4.3-4.3' />
    <path d='m8 8 6 6' />
    <path d='m14 8-6 6' />
  </svg>
)

const HelpCircleIcon: FC = () => (
  <svg {...svgDefaults} width={32} height={32}>
    <circle cx='12' cy='12' r='10' />
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <path d='M12 17h.01' />
  </svg>
)

const CalendarIcon: FC = () => (
  <svg {...svgDefaults} width={12} height={12}>
    <path d='M8 2v4' />
    <path d='M16 2v4' />
    <rect width='18' height='18' x='3' y='4' rx='2' />
    <path d='M3 10h18' />
  </svg>
)

const TagIcon: FC = () => (
  <svg {...svgDefaults} width={12} height={12}>
    <path d='M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' />
    <circle cx='7.5' cy='7.5' r='.5' fill='currentColor' />
  </svg>
)

const CATEGORY_ICONS: Record<string, FC> = {
  book: BookIcon,
  'credit-card': CreditCardIcon,
  code: CodeIcon,
  wrench: WrenchIcon,
  plug: PlugIcon,
}

// ---- Text Highlighting ----

function highlightText(text: string, query: string): ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className='kb-highlight'>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ---- Custom Renderers ----

type KbExtra = {
  searchQuery?: string
  onSelect?: (article: ArticleData & { name: string }) => void
}

const KbCategory: FC<FolderProps<{ data?: CategoryData }> & KbExtra> = ({
  name,
  children,
  isOpen = false,
  isLoading = false,
  depth,
  data,
  onToggleOpen,
  searchQuery,
}) => {
  const IconComponent = CATEGORY_ICONS[data?.icon ?? ''] ?? BookIcon
  const count = data?.articleCount ?? children.length

  return (
    <div
      className='kb-row'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={onToggleOpen}
    >
      <span className={`kb-row__chevron ${isOpen ? 'kb-row__chevron--open' : ''}`}>
        {isLoading ? (
          <span className='kb-loader'>
            <LoaderIcon width={14} height={14} />
          </span>
        ) : (
          <ChevronRightIcon width={14} height={14} />
        )}
      </span>
      <span className='kb-row__icon'>
        <IconComponent />
      </span>
      <span className='kb-row__name'>{highlightText(name, searchQuery ?? '')}</span>
      <span className='kb-row__count'>{count}</span>
    </div>
  )
}

const KbArticle: FC<BaseNodeProps<{ data?: ArticleData }> & KbExtra> = ({
  name,
  depth,
  data,
  searchQuery,
  onSelect,
}) => {
  return (
    <div
      className='kb-article'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={() => {
        if (data) onSelect?.({ ...data, name })
      }}
    >
      <span className='kb-article__icon'>
        <FileTextIcon />
      </span>
      <span className='kb-article__name'>{highlightText(name, searchQuery ?? '')}</span>
    </div>
  )
}

// ---- Detail Panel ----

type SelectedArticle = ArticleData & { name: string }

const DetailPanel: FC<{ article: SelectedArticle | null }> = ({ article }) => {
  if (!article) {
    return (
      <div className='kb-detail-empty'>
        <span className='kb-detail-empty__icon'>
          <HelpCircleIcon />
        </span>
        <span className='kb-detail-empty__text'>Select an article to preview</span>
      </div>
    )
  }

  return (
    <div className='kb-detail'>
      <div className='kb-detail__title'>{article.name}</div>
      <div className='kb-detail__meta'>
        <CalendarIcon /> Updated {article.updatedAt}
      </div>
      <p className='kb-detail__summary'>{article.summary}</p>
      <div className='kb-detail__meta'>
        <TagIcon /> Tags
      </div>
      <div className='kb-detail__tags'>
        {article.tags.map((tag) => (
          <span key={tag} className='kb-detail__tag'>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---- Story Component ----

type KnowledgeBaseProps = {
  disableAnimations: boolean
  animationDuration: number
}

const KnowledgeBaseDemo: FC<KnowledgeBaseProps> = ({
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const treeRef = useRef<LazyTreeViewHandle>(null)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [selected, setSelected] = useState<SelectedArticle | null>(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      // Restore original tree
      treeRef.current?.setTree(KB_TREE)
      setResultCount(null)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      const results = await searchArticles(query)
      treeRef.current?.setTree(results)

      // Count articles in results
      let count = 0
      for (const cat of results) {
        if ('children' in cat) count += cat.children.length
      }
      setResultCount(count)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleClear = useCallback(() => {
    setQuery('')
    setSelected(null)
  }, [])

  return (
    <div className='kb'>
      <div className='kb-window'>
        <div className='kb-window__titlebar'>
          <div className='kb-window__dots'>
            <span className='kb-window__dot kb-window__dot--red' />
            <span className='kb-window__dot kb-window__dot--yellow' />
            <span className='kb-window__dot kb-window__dot--green' />
          </div>
          <span className='kb-window__title'>Help Center</span>
        </div>

        <div className='kb-split'>
          <div className='kb-split__sidebar'>
            {/* Search bar */}
            <div className='kb-search'>
              <span className='kb-search__icon'>
                <SearchIcon />
              </span>
              <input
                className='kb-search__input'
                placeholder='Search articles...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {isSearching && (
                <span className='kb-search__spinner'>
                  <LoaderIcon width={16} height={16} />
                </span>
              )}
              {query && !isSearching && (
                <button className='kb-search__clear' onClick={handleClear}>
                  &times;
                </button>
              )}
            </div>

            {/* Result count */}
            {resultCount !== null && !isSearching && (
              <div className='kb-results'>
                {resultCount === 0
                  ? 'No articles found'
                  : `${resultCount} article${resultCount !== 1 ? 's' : ''} found`}
              </div>
            )}

            {/* Tree or no-results */}
            {resultCount === 0 && !isSearching ? (
              <div className='kb-no-results'>
                <span className='kb-no-results__icon'>
                  <SearchXIcon />
                </span>
                <span className='kb-no-results__title'>No results for &ldquo;{query}&rdquo;</span>
                <span className='kb-no-results__hint'>
                  Try different keywords or browse categories
                </span>
              </div>
            ) : (
              <LazyTreeView
                ref={treeRef}
                initialTree={KB_TREE}
                loadChildren={loadChildren}
                folder={KbCategory}
                item={KbArticle}
                folderProps={{ searchQuery: query, onSelect: setSelected }}
                itemProps={{ searchQuery: query, onSelect: setSelected }}
                disableAnimations={disableAnimations}
                animationDuration={animationDuration}
              />
            )}
          </div>

          {/* Detail panel */}
          <div className='kb-split__detail'>
            <DetailPanel article={selected} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const meta: Meta<typeof KnowledgeBaseDemo> = {
  title: 'Use Cases/Help Center',
  component: KnowledgeBaseDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'A Help Center / Knowledge Base built with **LazyTreeView**. Demonstrates:',
          '',
          '- **Server-side search**: type a query to simulate a backend search that returns a filtered tree',
          '- **`setTree` via ref**: search results replace the entire tree using the imperative API',
          '- **Text highlighting**: matching text is highlighted in category and article names',
          '- **Debounced input**: search is triggered after a short delay to avoid excessive requests',
          '- **Loading states**: spinner while searching, result count after completion',
          '- **No results**: empty state when the search has no matches',
          '- **Lazy loading**: categories load their articles on demand when browsing (no search)',
          '- **Detail panel**: click an article to preview its summary and tags',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  args: {
    disableAnimations: false,
    animationDuration: 300,
  },
  argTypes: {
    disableAnimations: {
      description: 'Disable expand/collapse animations.',
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    animationDuration: {
      description: 'Duration of expand/collapse animations in milliseconds.',
      control: { type: 'range', min: 100, max: 1000, step: 50 },
      table: { category: 'Behavior', defaultValue: { summary: '300' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof KnowledgeBaseDemo>

const SOURCE_CODE = `
import { useRef, useState, useEffect } from 'react'
import LazyTreeView, { type LazyTreeViewHandle } from 'lazy-tree-view'

const treeRef = useRef<LazyTreeViewHandle>(null)
const [query, setQuery] = useState('')

// Debounced server-side search → replace tree
useEffect(() => {
  if (!query.trim()) {
    treeRef.current?.setTree(originalTree)  // restore
    return
  }

  const timer = setTimeout(async () => {
    const results = await searchArticles(query)  // server call
    treeRef.current?.setTree(results)             // replace tree
  }, 300)

  return () => clearTimeout(timer)
}, [query])

<input value={query} onChange={(e) => setQuery(e.target.value)} />

<LazyTreeView
  ref={treeRef}
  initialTree={originalTree}
  loadChildren={loadChildren}
  folder={CategoryFolder}
  item={ArticleItem}
  folderProps={{ searchQuery: query }}
  itemProps={{ searchQuery: query }}
/>
`.trim()

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
