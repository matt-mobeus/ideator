import type { Concept } from '@/types/concept.ts'
import Card from '@/components/composites/Card.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Tag from '@/components/ui/Tag.tsx'

interface ConceptDetailProps {
  concept: Concept
}

export default function ConceptDetail({ concept }: ConceptDetailProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {concept.name}
        </h2>

        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {concept.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan">{concept.domain}</Badge>
          <Badge variant="green">{concept.abstractionLevel}</Badge>
        </div>

        {concept.themes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Themes
            </span>
            <div className="flex flex-wrap gap-2">
              {concept.themes.map((theme) => (
                <Tag key={theme}>{theme}</Tag>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {concept.sourceReferences.length} source reference
          {concept.sourceReferences.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  )
}
