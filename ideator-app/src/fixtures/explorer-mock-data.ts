import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'
import type { VisualizationData } from '@/types/visualization.ts'

export const MOCK_CONCEPT: Concept = {
  id: 'c1',
  name: 'Neural Style Transfer',
  description:
    'A technique using deep neural networks to apply the artistic style of one image to another, enabling novel visual transformations while preserving content structure.',
  abstractionLevel: 'L1_SPECIFIC',
  domain: 'Computer Vision',
  themes: ['Deep Learning', 'Generative'],
  parentConcepts: [],
  childConcepts: [],
  relatedConcepts: ['c2', 'c3'],
  sourceReferences: [
    {
      fileId: 'f1',
      fileName: 'paper1.pdf',
      location: 'p3',
      excerpt: 'Neural style transfer enables artistic rendering by optimizing content and style representations...',
      context: 'Introduction to style transfer methodology',
    },
    {
      fileId: 'f2',
      fileName: 'paper2.pdf',
      location: 'p7',
      excerpt: 'The Gram matrix captures style features while preserving spatial content structure...',
      context: 'Technical implementation details',
    },
  ],
  clusterId: 'cl1',
  extractionTimestamp: new Date(),
}

export const MOCK_ANALYSIS: AnalysisResult = {
  id: 'a1',
  conceptId: 'c1',
  compositeScore: 82,
  tier: 'T1',
  marketViability: {
    score: 85,
    factors: { demand: 0.9, competition: 0.75, timing: 0.9 },
    analysis: 'Strong market demand with moderate competition.',
  },
  technicalFeasibility: {
    score: 78,
    factors: { complexity: 0.65, resources: 0.85, timeline: 0.8 },
    analysis: 'Technically achievable with existing resources.',
  },
  investmentPotential: {
    score: 83,
    factors: { roi: 0.85, risk: 0.75, scalability: 0.9 },
    analysis: 'Excellent investment potential with manageable risk.',
  },
  executiveSummary:
    'Neural style transfer shows exceptional promise for commercial applications in creative tools and media production.',
  keyRisks: ['GPU resource requirements', 'Real-time performance challenges'],
  recommendedNextSteps: ['Prototype development', 'Performance optimization'],
  supportingEvidence: [
    { citation: 'Gatys et al. 2016', sourceUrl: 'https://arxiv.org/abs/1508.06576' },
  ],
  analyzedAt: new Date(),
}

export const MOCK_VISUALIZATION: VisualizationData = {
  id: 'v1',
  conceptId: 'c1',
  timelineNodes: [
    {
      id: 'n1',
      conceptId: 'c1',
      nodeType: 'ORIGIN',
      label: '2015 Origin',
      date: new Date('2015-01-01'),
      datePrecision: 'YEAR',
      description: 'Initial development',
      sourceRefs: [],
      position: { x: 100, y: 300 },
    },
    {
      id: 'n2',
      conceptId: 'c1',
      nodeType: 'VARIATION',
      label: '2016 Fast Style',
      date: new Date('2016-01-01'),
      datePrecision: 'YEAR',
      description: 'Real-time variant',
      sourceRefs: [],
      position: { x: 300, y: 200 },
    },
    {
      id: 'n3',
      conceptId: 'c1',
      nodeType: 'CURRENT',
      label: '2024 Current',
      date: new Date('2024-01-01'),
      datePrecision: 'YEAR',
      description: 'Modern implementation',
      sourceRefs: [],
      position: { x: 500, y: 300 },
    },
  ],
  timelineEdges: [
    {
      id: 'e1',
      sourceNodeId: 'n1',
      targetNodeId: 'n2',
      relationshipType: 'DERIVED',
      strength: 0.9,
      evidence: 'Direct evolution',
      sourceRefs: [],
    },
    {
      id: 'e2',
      sourceNodeId: 'n2',
      targetNodeId: 'n3',
      relationshipType: 'INFLUENCED',
      strength: 0.7,
      evidence: 'Inspired development',
      sourceRefs: [],
    },
  ],
  nodeMapNodes: [
    {
      id: 'nm1',
      label: 'Style Transfer',
      nodeType: 'CONCEPT',
      conceptId: 'c1',
      position: { x: 400, y: 300 },
      metadata: { domain: 'Computer Vision' },
    },
    {
      id: 'nm2',
      label: 'Gatys et al.',
      nodeType: 'PUBLICATION',
      position: { x: 300, y: 200 },
      metadata: { year: '2016' },
    },
    {
      id: 'nm3',
      label: 'Neural Networks',
      nodeType: 'CONCEPT',
      conceptId: 'c2',
      position: { x: 500, y: 200 },
      metadata: { domain: 'Deep Learning' },
    },
  ],
  nodeMapEdges: [
    {
      id: 'nme1',
      sourceId: 'nm2',
      targetId: 'nm1',
      edgeStyle: 'CREATED',
      label: 'Published',
    },
    {
      id: 'nme2',
      sourceId: 'nm1',
      targetId: 'nm3',
      edgeStyle: 'REFERENCED',
      label: 'Uses',
    },
  ],
  generatedAt: new Date(),
}
