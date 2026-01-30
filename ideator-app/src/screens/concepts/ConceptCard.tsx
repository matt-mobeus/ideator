import type { Concept } from '@/types/concept.ts'
import Badge from '@/components/ui/Badge.tsx'
import Tag from '@/components/ui/Tag.tsx'

interface ConceptCardProps {
  concept: Concept
  onClick?: () => void
}

const levelLabel: Record<string, string> = {
  L1_SPECIFIC: 'Specific',
  L2_APPROACH: 'Approach',
  L3_PARADIGM: 'Paradigm',
}

const levelVariant: Record<string, 'cyan' | 'green' | 'magenta'> = {
  L1_SPECIFIC: 'cyan',
  L2_APPROACH: 'green',
  L3_PARADIGM: 'magenta',
}

export default function ConceptCard({ concept, onClick }: ConceptCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 text-left transition-all hover:border-[var(--color-cyan)] hover:shadow-[var(--glow-cyan-sm)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {concept.name}
        </span>
        <Badge variant={levelVariant[concept.abstractionLevel] ?? 'cyan'}>
          {levelLabel[concept.abstractionLevel] ?? concept.abstractionLevel}
        </Badge>
      </div>

      <p
        className="text-sm line-clamp-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {concept.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Tag>{concept.domain}</Tag>
        {concept.themes.slice(0, 3).map((theme) => (
          <Tag key={theme}>{theme}</Tag>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {concept.sourceReferences.length} source{concept.sourceReferences.length !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  )
}
