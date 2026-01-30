import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'
import type { Claim } from '@/types/asset.ts'

interface ClaimsPanelProps {
  claims: Claim[]
  highlightedFileId?: string
  onClaimHover?: (sourceFileIds: string[] | null) => void
}

export default function ClaimsPanel({
  claims,
  highlightedFileId,
  onClaimHover,
}: ClaimsPanelProps) {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return 'var(--color-green)'
    if (confidence > 0.5) return 'var(--color-yellow)'
    return 'var(--color-red)'
  }

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence > 0.8) return 'High'
    if (confidence > 0.5) return 'Medium'
    return 'Low'
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Claims & Evidence
      </h2>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {claims.map((claim, idx) => {
          const sourceFileIds = claim.sourceRefs.map((ref) => ref.fileId)
          const isHighlighted =
            highlightedFileId && sourceFileIds.includes(highlightedFileId)

          return (
            <Card
              key={idx}
              onMouseEnter={() => onClaimHover?.(sourceFileIds)}
              onMouseLeave={() => onClaimHover?.(null)}
              style={{
                cursor: 'pointer',
                border: isHighlighted
                  ? '1px solid var(--color-cyan)'
                  : '1px solid var(--border-subtle)',
                boxShadow: isHighlighted ? '0 0 8px var(--color-cyan)' : 'none',
                transition: 'all var(--duration-normal) var(--ease-default)',
              }}
            >
              <div className="flex flex-col gap-3">
                {/* Claim statement */}
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {claim.statement}
                </p>

                {/* Confidence indicator */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${getConfidenceColor(claim.confidence)} ${claim.confidence * 100}%, var(--bg-secondary) ${claim.confidence * 100}%)`,
                    }}
                  />
                  <Badge variant="gray">
                    {getConfidenceLabel(claim.confidence)} ({Math.round(claim.confidence * 100)}%)
                  </Badge>
                </div>

                {/* Synthesis notes */}
                {claim.synthesisNotes && (
                  <p
                    className="text-xs italic leading-relaxed"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {claim.synthesisNotes}
                  </p>
                )}

                {/* Source references */}
                <div className="flex flex-col gap-1">
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Sources:
                  </p>
                  {claim.sourceRefs.map((ref, refIdx) => (
                    <div
                      key={refIdx}
                      className="flex items-baseline gap-2 text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Badge variant="gray">
                        {ref.fileName}
                      </Badge>
                      <span>{ref.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
