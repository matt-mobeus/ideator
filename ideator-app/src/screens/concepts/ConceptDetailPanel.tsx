import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Tag from '@/components/ui/Tag.tsx'
import Accordion from '@/components/composites/Accordion.tsx'

interface ConceptDetailPanelProps {
  concept: Concept | null
  allConcepts: Concept[]
  onClose: () => void
}

const abstractionLevelMap = {
  L1_SPECIFIC: 'L1: Specific',
  L2_APPROACH: 'L2: Approach',
  L3_PARADIGM: 'L3: Paradigm',
}

export default function ConceptDetailPanel({ concept, allConcepts, onClose }: ConceptDetailPanelProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (concept && panelRef.current) {
      panelRef.current.focus()
    }
  }, [concept])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (concept) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [concept, onClose])

  if (!concept) return null

  // Resolve concept IDs to names
  const resolveConceptNames = (ids: string[]): string[] => {
    return ids.map(id => {
      const found = allConcepts.find(c => c.id === id)
      return found ? found.name : id
    })
  }

  const parentNames = resolveConceptNames(concept.parentConcepts)
  const childNames = resolveConceptNames(concept.childConcepts)
  const relatedNames = resolveConceptNames(concept.relatedConcepts)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 50,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '600px',
          maxWidth: '90vw',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)',
          zIndex: 51,
          overflowY: 'auto',
          transform: 'translateX(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {concept.name}
              </h2>
              <div className="mt-2">
                <Badge variant="cyan">
                  {abstractionLevelMap[concept.abstractionLevel]}
                </Badge>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>

          {/* Metadata Block */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Tag>{concept.domain}</Tag>
              {concept.themes.map((theme, i) => (
                <Tag key={i}>{theme}</Tag>
              ))}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Extracted: {concept.extractionTimestamp.toLocaleString()}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Description
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {concept.description}
            </p>
          </div>

          {/* Source References */}
          {concept.sourceReferences.length > 0 && (
            <Accordion
              title="Source References"
              badge={
                <Badge variant="gray">
                  {concept.sourceReferences.length}
                </Badge>
              }
            >
              <div className="flex flex-col gap-3">
                {concept.sourceReferences.map((ref, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-md)] p-3 text-sm"
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderLeft: '3px solid var(--color-cyan)',
                    }}
                  >
                    <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {ref.fileName}
                    </div>
                    <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      {ref.location}
                    </div>
                    <p className="italic" style={{ color: 'var(--text-secondary)' }}>
                      "{ref.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {/* Related Concepts */}
          {concept.relatedConcepts.length > 0 && (
            <Accordion
              title="Related Concepts"
              badge={
                <Badge variant="gray">
                  {concept.relatedConcepts.length}
                </Badge>
              }
            >
              <ul className="flex flex-col gap-2">
                {relatedNames.map((name, i) => (
                  <li
                    key={i}
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    • {name}
                  </li>
                ))}
              </ul>
            </Accordion>
          )}

          {/* Parent Concepts */}
          {concept.parentConcepts.length > 0 && (
            <Accordion
              title="Parent Concepts"
              badge={
                <Badge variant="gray">
                  {concept.parentConcepts.length}
                </Badge>
              }
            >
              <ul className="flex flex-col gap-2">
                {parentNames.map((name, i) => (
                  <li
                    key={i}
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    • {name}
                  </li>
                ))}
              </ul>
            </Accordion>
          )}

          {/* Child Concepts */}
          {concept.childConcepts.length > 0 && (
            <Accordion
              title="Child Concepts"
              badge={
                <Badge variant="gray">
                  {concept.childConcepts.length}
                </Badge>
              }
            >
              <ul className="flex flex-col gap-2">
                {childNames.map((name, i) => (
                  <li
                    key={i}
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    • {name}
                  </li>
                ))}
              </ul>
            </Accordion>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => navigate(`/analyze/${concept.id}`)}
              variant="primary"
              className="w-full"
            >
              Analyze
            </Button>
            <Button
              onClick={() => navigate(`/explore/${concept.id}`)}
              variant="secondary"
              className="w-full"
            >
              Explore
            </Button>
            <Button
              onClick={() => navigate(`/provenance/${concept.id}`)}
              variant="ghost"
              className="w-full"
            >
              View Provenance
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
