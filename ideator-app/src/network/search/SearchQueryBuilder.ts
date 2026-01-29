// ============================================================================
// IDEATOR — Search Query Builder (NET-3.0)
// Builds optimized search queries for market analysis dimensions
// ============================================================================

/** Dimensions of market analysis that each need search queries */
export type AnalysisDimension =
  | 'market_trends'
  | 'competition'
  | 'technical'
  | 'investment'
  | 'regulatory'
  | 'patents';

const QUERY_TEMPLATES: Record<AnalysisDimension, string> = {
  market_trends: '"{concept}" market trends growth forecast 2024 2025 2026',
  competition: '"{concept}" competitors startups companies funding landscape',
  technical: '"{concept}" technology implementation feasibility challenges',
  investment: '"{concept}" venture capital investment funding round valuation',
  regulatory: '"{concept}" regulation policy government compliance standards',
  patents: '"{concept}" patent filing USPTO innovation intellectual property',
};

/** Build search queries for a concept across analysis dimensions */
export class SearchQueryBuilder {
  /**
   * Generate a set of search queries for a concept.
   * Returns one query per analysis dimension.
   */
  buildQueries(conceptName: string, domain?: string): Record<AnalysisDimension, string> {
    const sanitized = this.sanitize(conceptName);
    const result = {} as Record<AnalysisDimension, string>;

    for (const [dim, template] of Object.entries(QUERY_TEMPLATES)) {
      let query = template.replace('{concept}', sanitized);
      if (domain) {
        query += ` ${domain}`;
      }
      result[dim as AnalysisDimension] = query;
    }

    return result;
  }

  /** Build a single query for a specific dimension */
  buildQuery(conceptName: string, dimension: AnalysisDimension): string {
    const sanitized = this.sanitize(conceptName);
    return QUERY_TEMPLATES[dimension].replace('{concept}', sanitized);
  }

  /** Sanitize concept name to prevent query injection */
  private sanitize(input: string): string {
    // Remove special search operators and excessive punctuation
    return input
      .replace(/['"]/g, '')
      .replace(/\b(AND|OR|NOT|site:|intitle:|inurl:)\b/gi, '')
      .trim()
      .slice(0, 100);
  }
}
