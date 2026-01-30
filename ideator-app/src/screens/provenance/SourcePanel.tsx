import Accordion from '@/components/composites/Accordion.tsx'
import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'

interface SourceExcerpt {
  location: string
  text: string
}

interface SourceGroup {
  fileId: string
  fileName: string
  excerpts: SourceExcerpt[]
}

interface SourcePanelProps {
  sources: SourceGroup[]
  highlightedFileId?: string
  onExcerptHover?: (fileId: string | null) => void
}

export default function SourcePanel({
  sources,
  highlightedFileId,
  onExcerptHover,
}: SourcePanelProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Source Documents
      </h2>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {sources.map((source) => (
          <Accordion key={source.fileId} title={source.fileName} defaultOpen>
            <div className="flex flex-col gap-2">
              {source.excerpts.map((excerpt, idx) => {
                const isHighlighted = highlightedFileId === source.fileId
                return (
                  <Card
                    key={idx}
                    onMouseEnter={() => onExcerptHover?.(source.fileId)}
                    onMouseLeave={() => onExcerptHover?.(null)}
                    style={{
                      cursor: 'pointer',
                      border: isHighlighted
                        ? '1px solid var(--color-cyan)'
                        : '1px solid var(--border-subtle)',
                      boxShadow: isHighlighted
                        ? '0 0 8px var(--color-cyan)'
                        : 'none',
                      transition: 'all var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <Badge variant="gray">
                        {excerpt.location}
                      </Badge>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {excerpt.text}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  )
}
