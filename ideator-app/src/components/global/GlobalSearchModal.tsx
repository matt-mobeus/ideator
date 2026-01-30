import { useState, useEffect, useRef, useCallback } from 'react'
import Modal from '@/components/composites/Modal.tsx'
import SearchInput from '@/components/composites/SearchInput.tsx'
import Icon from '@/components/ui/Icon.tsx'
import { searchIndex } from '@/services/search-index.service.ts'
import type { SearchResult } from '@/services/search-index.service.ts'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setActiveIndex(0)
    if (!value.trim()) {
      setResults([])
      return
    }
    setResults(searchIndex.search(value))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        // TODO: navigate to selected concept
        onClose()
      }
    },
    [results, onClose],
  )

  // Scroll active item into view
  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const active = container.children[activeIndex] as HTMLElement | undefined
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <Modal open={isOpen} onClose={onClose} title="Search Concepts" className="max-w-xl">
      <div onKeyDown={handleKeyDown}>
        <SearchInput
          ref={inputRef}
          placeholder="Type to search concepts..."
          value={query}
          onChange={(e) => handleQueryChange(e.currentTarget.value)}
          onClear={() => handleQueryChange('')}
        />

        <div
          ref={listRef}
          className="mt-3 max-h-80 overflow-y-auto"
          role="listbox"
        >
          {!query.trim() && (
            <p
              className="py-8 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Type to search concepts...
            </p>
          )}

          {query.trim() && results.length === 0 && (
            <p
              className="py-8 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No concepts found
            </p>
          )}

          {results.map((result, index) => (
            <div
              key={result.item.id}
              role="option"
              aria-selected={index === activeIndex}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-colors"
              style={{
                backgroundColor: index === activeIndex ? 'var(--bg-tertiary)' : 'transparent',
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={onClose}
            >
              <Icon name="zap" size={16} className="mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {result.item.name}
                </p>
                {result.item.description && (
                  <p
                    className="mt-0.5 line-clamp-1 text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {result.item.description}
                  </p>
                )}
              </div>
              {result.item.domain && (
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--color-cyan)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {result.item.domain}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
