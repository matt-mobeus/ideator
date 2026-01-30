export function buildMarketQuery(conceptName: string, domain: string): string {
  const sanitized = sanitizeConceptName(conceptName)
  const sanitizedDomain = domain.trim()

  return `"${sanitized}" ${sanitizedDomain} market size trends demand growth opportunity 2024 2025 2026`
}

export function buildTechQuery(conceptName: string): string {
  const sanitized = sanitizeConceptName(conceptName)

  return `"${sanitized}" technical feasibility implementation challenges technology stack requirements`
}

export function buildInvestmentQuery(
  conceptName: string,
  domain: string
): string {
  const sanitized = sanitizeConceptName(conceptName)
  const sanitizedDomain = domain.trim()

  return `"${sanitized}" ${sanitizedDomain} funding investment venture capital startup valuation`
}

function sanitizeConceptName(name: string): string {
  // Remove extra whitespace and trim
  return name.trim().replace(/\s+/g, ' ')
}
