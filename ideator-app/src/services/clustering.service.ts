/**
 * Groups concepts into clusters using LLM.
 */

import type { Concept, Cluster } from '@/types/concept.ts'
import type { LlmConfig } from '@/types/settings.ts'
import { buildClusteringPrompt } from './prompt-builder.ts'
import { executePrompt } from '@/network/prompt-execution.service.ts'
import { createLlmProvider } from '@/network/llm/index.ts'
import { storage } from '@/services/storage.service.ts'

interface RawCluster {
  name: string
  domain: string
  conceptNames: string[]
}

function parseJsonSafe<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match?.[1]) {
      return JSON.parse(match[1].trim()) as T
    }
    throw new Error('Failed to parse JSON from LLM response')
  }
}

export async function clusterConcepts(
  concepts: Concept[],
  llmConfig: LlmConfig,
): Promise<Cluster[]> {
  const summaries = concepts.map((c) => ({
    name: c.name,
    description: c.description,
    domain: c.domain,
  }))

  const provider = createLlmProvider(llmConfig)
  const prompt = buildClusteringPrompt(summaries)
  const response = await executePrompt(provider, prompt.system, prompt.user)

  const rawClusters = parseJsonSafe<RawCluster[]>(response)

  const conceptsByName = new Map<string, Concept>()
  for (const c of concepts) {
    conceptsByName.set(c.name.toLowerCase(), c)
  }

  const clusters: Cluster[] = rawClusters.map((rc) => {
    const id = crypto.randomUUID()
    const conceptIds: string[] = []

    for (const conceptName of rc.conceptNames) {
      const concept = conceptsByName.get(conceptName.toLowerCase())
      if (concept) {
        concept.clusterId = id
        conceptIds.push(concept.id)
      }
    }

    return {
      id,
      name: rc.name,
      domain: rc.domain,
      conceptIds,
    }
  })

  for (const cluster of clusters) {
    await storage.put('clusters', cluster)
  }
  for (const concept of concepts) {
    await storage.put('concepts', concept)
  }

  return clusters
}

export async function getClusteredConcepts(): Promise<
  { cluster: Cluster; concepts: Concept[] }[]
> {
  const allClusters = await storage.getAll<Cluster>('clusters')
  const allConcepts = await storage.getAll<Concept>('concepts')

  const conceptsByCluster = new Map<string, Concept[]>()
  for (const concept of allConcepts) {
    if (concept.clusterId) {
      const list = conceptsByCluster.get(concept.clusterId) ?? []
      list.push(concept)
      conceptsByCluster.set(concept.clusterId, list)
    }
  }

  return allClusters.map((cluster) => ({
    cluster,
    concepts: conceptsByCluster.get(cluster.id) ?? [],
  }))
}
