import type { Concept } from '@/types/concept.ts'
import type { Claim } from '@/types/asset.ts'

export const MOCK_CONCEPTS: Concept[] = [
  {
    id: 'c1',
    name: 'Neural Style Transfer',
    description:
      'A technique using deep neural networks to apply the artistic style of one image to another.',
    abstractionLevel: 'L1_SPECIFIC',
    domain: 'Computer Vision',
    themes: ['Deep Learning', 'Generative'],
    parentConcepts: [],
    childConcepts: [],
    relatedConcepts: [],
    sourceReferences: [
      {
        fileId: 'f1',
        fileName: 'gatys_et_al_2016.pdf',
        location: 'p3',
        excerpt:
          'We present a neural algorithm that separates and recombines content and style of arbitrary images.',
        context: 'Introduction section discussing the core methodology.',
      },
      {
        fileId: 'f1',
        fileName: 'gatys_et_al_2016.pdf',
        location: 'p7',
        excerpt:
          'The style representation is built from correlations between feature responses in multiple layers.',
        context: 'Technical details of style extraction.',
      },
      {
        fileId: 'f2',
        fileName: 'johnson_et_al_2016.pdf',
        location: 'p2',
        excerpt:
          'Our approach achieves real-time performance through a feed-forward architecture.',
        context: 'Performance optimization discussion.',
      },
    ],
    clusterId: 'cl1',
    extractionTimestamp: new Date(),
  },
]

export const MOCK_CLAIMS: Claim[] = [
  {
    statement:
      'Neural style transfer separates content and style representations using deep convolutional networks.',
    sourceRefs: [
      {
        fileId: 'f1',
        fileName: 'gatys_et_al_2016.pdf',
        location: 'p3',
        excerpt:
          'We present a neural algorithm that separates and recombines content and style of arbitrary images.',
      },
    ],
    confidence: 0.95,
    synthesisNotes: 'Core methodology directly stated in seminal paper.',
  },
  {
    statement:
      'Style representation is derived from multi-layer feature correlations in the network.',
    sourceRefs: [
      {
        fileId: 'f1',
        fileName: 'gatys_et_al_2016.pdf',
        location: 'p7',
        excerpt:
          'The style representation is built from correlations between feature responses in multiple layers.',
      },
    ],
    confidence: 0.9,
    synthesisNotes: 'Technical mechanism explained in detail.',
  },
  {
    statement: 'Real-time performance is achievable through feed-forward architectures.',
    sourceRefs: [
      {
        fileId: 'f2',
        fileName: 'johnson_et_al_2016.pdf',
        location: 'p2',
        excerpt:
          'Our approach achieves real-time performance through a feed-forward architecture.',
      },
    ],
    confidence: 0.85,
    synthesisNotes: 'Performance improvement demonstrated in follow-up work.',
  },
  {
    statement: 'The technique has broad applications across artistic and commercial domains.',
    sourceRefs: [
      {
        fileId: 'f1',
        fileName: 'gatys_et_al_2016.pdf',
        location: 'p3',
        excerpt:
          'We present a neural algorithm that separates and recombines content and style of arbitrary images.',
      },
      {
        fileId: 'f2',
        fileName: 'johnson_et_al_2016.pdf',
        location: 'p2',
        excerpt:
          'Our approach achieves real-time performance through a feed-forward architecture.',
      },
    ],
    confidence: 0.6,
    synthesisNotes: 'Inferred from methodology, not explicitly stated in sources.',
  },
]
