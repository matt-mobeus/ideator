/**
 * Builds LLM prompts for concept extraction and clustering.
 */

export function buildExtractionPrompt(
  text: string,
  domain?: string,
): { system: string; user: string } {
  const domainClause = domain
    ? ` Focus on the "${domain}" domain.`
    : '';

  const system = `You are a concept extraction engine. Analyze the provided text and extract key concepts.${domainClause}

Return a JSON array of objects with these fields:
- "name": string — concise concept name
- "description": string — brief description of the concept
- "abstractionLevel": one of "L1_SPECIFIC", "L2_APPROACH", or "L3_PARADIGM"
- "domain": string — the domain this concept belongs to
- "themes": string[] — relevant themes
- "parentConcepts": string[] — broader concepts this falls under
- "childConcepts": string[] — more specific concepts within this one
- "relatedConcepts": string[] — laterally related concepts

Return ONLY valid JSON. No markdown, no explanation — just the JSON array.`;

  return { system, user: text };
}

export function buildClusteringPrompt(
  concepts: { name: string; description: string; domain: string }[],
): { system: string; user: string } {
  const system = `You are a concept clustering engine. Group the provided concepts into meaningful clusters based on thematic and domain similarity.

Return a JSON array of cluster objects with these fields:
- "name": string — descriptive cluster name
- "domain": string — primary domain of the cluster
- "conceptNames": string[] — names of concepts belonging to this cluster

Every concept must appear in exactly one cluster. Return ONLY valid JSON. No markdown, no explanation — just the JSON array.`;

  const user = JSON.stringify(concepts, null, 2);

  return { system, user };
}
