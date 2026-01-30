import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { Job } from '@/types/queue.ts'
import EmptyState from '@/components/composites/EmptyState.tsx'
import Breadcrumb from '@/components/composites/Breadcrumb.tsx'
import ConceptDetail from './ConceptDetail.tsx'
import AnalysisTrigger from './AnalysisTrigger.tsx'

// ── Mock data for visual testing ──────────────────────────────────────

const MOCK_CONCEPTS: Concept[] = [
  {
    id: 'c1',
    name: 'Neural Style Transfer',
    description:
      'A technique using deep neural networks to apply the artistic style of one image to another, enabling novel visual transformations while preserving content structure.',
    abstractionLevel: 'L1_SPECIFIC',
    domain: 'Computer Vision',
    themes: ['Deep Learning', 'Generative'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: ['c2'],
    sourceReferences: [
      { fileId: 'f1', fileName: 'paper1.pdf', location: 'p3', excerpt: '...', context: '...' },
      { fileId: 'f2', fileName: 'paper2.pdf', location: 'p7', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl1',
    extractionTimestamp: new Date(),
  },
  {
    id: 'c2',
    name: 'Attention Mechanisms',
    description:
      'Allow models to focus on relevant parts of input sequences, dramatically improving performance in translation, summarisation, and other sequence tasks.',
    abstractionLevel: 'L2_APPROACH',
    domain: 'NLP',
    themes: ['Deep Learning', 'Transformers'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: ['c1'],
    sourceReferences: [
      { fileId: 'f3', fileName: 'paper3.pdf', location: 'p1', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl2',
    extractionTimestamp: new Date(),
  },
]

const MOCK_ANALYSIS: AnalysisResult = {
  id: 'a1',
  conceptId: 'c2',
  compositeScore: 78,
  tier: 'T1',
  marketViability: {
    score: 82,
    factors: { demand: 0.9, competition: 0.7, timing: 0.85 },
    analysis: 'Strong market demand with manageable competition.',
  },
  technicalFeasibility: {
    score: 75,
    factors: { complexity: 0.6, resources: 0.8, timeline: 0.85 },
    analysis: 'Technically achievable with current resources.',
  },
  investmentPotential: {
    score: 77,
    factors: { roi: 0.8, risk: 0.7, scalability: 0.8 },
    analysis: 'Good investment potential with reasonable risk.',
  },
  executiveSummary: 'This concept shows strong promise across all dimensions.',
  keyRisks: ['Market saturation', 'Technical complexity'],
  recommendedNextSteps: ['Prototype development', 'Market research'],
  supportingEvidence: [
    { citation: 'Paper et al. 2024', sourceUrl: 'https://example.com' },
  ],
  analyzedAt: new Date(),
}

const MOCK_JOB: Job = {
  id: 'j1',
  type: 'market_analysis',
  status: 'running',
  targetId: 'c1',
  progress: 45,
  progressLabel: 'Analyzing market viability...',
  createdAt: new Date(),
  startedAt: new Date(),
}

// ── Screen ────────────────────────────────────────────────────────────

export default function AnalyzeScreen() {
  const { id: conceptId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [useMock] = useState(true)

  const concepts: Concept[] = useMock ? MOCK_CONCEPTS : []
  const concept = concepts.find((c) => c.id === conceptId)

  // Mock: Show analysis for c2, show running job for c1
  const existingAnalysis = useMock && conceptId === 'c2' ? MOCK_ANALYSIS : undefined
  const currentJob = useMock && conceptId === 'c1' ? MOCK_JOB : undefined

  if (!concept) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="Concept not found"
          description="The requested concept does not exist."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Concepts', onClick: () => navigate('/concepts') },
          { label: concept.name, onClick: () => navigate(`/concepts/${concept.id}`) },
          { label: 'Analyze' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto md:flex-row">
        <div className="flex-1">
          <ConceptDetail concept={concept} />
        </div>
        <div className="w-full md:w-96">
          <AnalysisTrigger
            conceptId={concept.id}
            existingAnalysis={existingAnalysis}
            currentJob={currentJob}
          />
        </div>
      </div>
    </div>
  )
}
