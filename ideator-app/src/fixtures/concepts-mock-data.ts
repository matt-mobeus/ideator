import type { Concept, Cluster } from '@/types/concept.ts'

export const MOCK_CONCEPTS: Concept[] = [
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
      { fileId: 'f2', fileName: 'paper2.pdf', location: 'p1', excerpt: '...', context: '...' },
      { fileId: 'f3', fileName: 'paper3.pdf', location: 'p5', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl2',
    extractionTimestamp: new Date(),
  },
  {
    id: 'c3',
    name: 'Emergence in Complex Systems',
    description:
      'The phenomenon where large-scale patterns and behaviours arise from simple local interactions, a paradigm applicable across biology, physics, and AI.',
    abstractionLevel: 'L3_PARADIGM',
    domain: 'Systems Theory',
    themes: ['Complexity', 'Interdisciplinary'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: [],
    sourceReferences: [
      { fileId: 'f4', fileName: 'paper4.pdf', location: 'p2', excerpt: '...', context: '...' },
    ],
    clusterId: 'cl2',
    extractionTimestamp: new Date(),
  },
]

export const MOCK_CLUSTERS: Cluster[] = [
  { id: 'cl1', name: 'Visual Generation', domain: 'Computer Vision', conceptIds: ['c1'] },
  { id: 'cl2', name: 'Foundational Approaches', domain: 'General', conceptIds: ['c2', 'c3'] },
]
