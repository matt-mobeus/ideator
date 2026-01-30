import type { Cluster, Concept } from '@/types/concept.ts'
import Accordion from '@/components/composites/Accordion.tsx'
import Badge from '@/components/ui/Badge.tsx'
import ConceptCard from './ConceptCard.tsx'

interface ClusterContainerProps {
  cluster: Cluster
  concepts: Concept[]
  onConceptClick?: (concept: Concept) => void
}

export default function ClusterContainer({ cluster, concepts, onConceptClick }: ClusterContainerProps) {
  return (
    <Accordion
      title={<span>{cluster.name}</span>}
      badge={<Badge variant="gray">{concepts.length}</Badge>}
      defaultOpen
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            onClick={() => onConceptClick?.(concept)}
          />
        ))}
      </div>
    </Accordion>
  )
}
